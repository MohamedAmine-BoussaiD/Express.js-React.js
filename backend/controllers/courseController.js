const { validationResult } = require("express-validator");
const { pool } = require("../config/db");

// ── LIST all courses (with enrollment count) ──────────────────
const getCourses = async (req, res, next) => {
  try {
    const search  = req.query.search ? `%${req.query.search}%` : null;
    const status  = req.query.status || null;
    const page    = Math.max(1, parseInt(req.query.page)  || 1);
    const limit   = Math.min(50, parseInt(req.query.limit) || 12);
    const offset  = (page - 1) * limit;

    let where = "WHERE 1=1";
    const params = [];

    if (search) {
      where += " AND (c.name LIKE ? OR c.code LIKE ? OR c.description LIKE ?)";
      params.push(search, search, search);
    }
    if (status) {
      where += " AND c.status = ?";
      params.push(status);
    }

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM courses c ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT c.*,
              COUNT(e.id) AS enrolled_count,
              u.first_name AS creator_first, u.last_name AS creator_last
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       LEFT JOIN users u ON u.id = c.created_by
       ${where}
       GROUP BY c.id
       ORDER BY c.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: { courses: rows, pagination: { total, page, limit, pages: Math.ceil(total / limit) } },
    });
  } catch (err) { next(err); }
};

// ── GET single course with enrolled students ──────────────────
const getCourse = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, COUNT(e.id) AS enrolled_count
       FROM courses c
       LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.id = ? GROUP BY c.id`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: "Course not found." });

    const [students] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email,
              sp.student_code, sp.major, e.enrolled_at
       FROM enrollments e
       JOIN users u ON u.id = e.student_id
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE e.course_id = ?
       ORDER BY e.enrolled_at DESC`,
      [req.params.id]
    );

    res.json({ success: true, data: { course: rows[0], students } });
  } catch (err) { next(err); }
};

// ── CREATE course ─────────────────────────────────────────────
const createCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { code, name, description, credits = 3, capacity = 30, status = "active" } = req.body;

    const [dup] = await pool.query("SELECT id FROM courses WHERE code = ?", [code]);
    if (dup.length)
      return res.status(409).json({ success: false, message: "Course code already exists." });

    const [result] = await pool.query(
      `INSERT INTO courses (code, name, description, credits, capacity, status, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), name, description || null, credits, capacity, status, req.user.id]
    );

    const [newCourse] = await pool.query(
      "SELECT * FROM courses WHERE id = ?", [result.insertId]
    );

    res.status(201).json({
      success: true, message: "Course created.",
      data: { course: { ...newCourse[0], enrolled_count: 0 } },
    });
  } catch (err) { next(err); }
};

// ── UPDATE course ─────────────────────────────────────────────
const updateCourse = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const { code, name, description, credits, capacity, status } = req.body;

    const [exists] = await pool.query("SELECT id FROM courses WHERE id = ?", [id]);
    if (!exists.length)
      return res.status(404).json({ success: false, message: "Course not found." });

    if (code) {
      const [dup] = await pool.query(
        "SELECT id FROM courses WHERE code = ? AND id != ?", [code, id]
      );
      if (dup.length)
        return res.status(409).json({ success: false, message: "Course code already in use." });
    }

    await pool.query(
      `UPDATE courses SET code=?, name=?, description=?, credits=?, capacity=?, status=?
       WHERE id=?`,
      [code?.toUpperCase(), name, description || null, credits, capacity, status, id]
    );

    const [updated] = await pool.query(
      `SELECT c.*, COUNT(e.id) AS enrolled_count
       FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.id = ? GROUP BY c.id`, [id]
    );

    res.json({ success: true, message: "Course updated.", data: { course: updated[0] } });
  } catch (err) { next(err); }
};

// ── DELETE course ─────────────────────────────────────────────
const deleteCourse = async (req, res, next) => {
  try {
    const [exists] = await pool.query("SELECT id FROM courses WHERE id = ?", [req.params.id]);
    if (!exists.length)
      return res.status(404).json({ success: false, message: "Course not found." });

    await pool.query("DELETE FROM courses WHERE id = ?", [req.params.id]);
    res.json({ success: true, message: "Course deleted." });
  } catch (err) { next(err); }
};

// ── ENROLL student ────────────────────────────────────────────
const enrollStudent = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const { student_id } = req.body;

    if (!student_id)
      return res.status(422).json({ success: false, message: "student_id is required." });

    // Check course exists and has capacity
    const [[course]] = await pool.query(
      `SELECT c.*, COUNT(e.id) AS enrolled_count
       FROM courses c LEFT JOIN enrollments e ON e.course_id = c.id
       WHERE c.id = ? GROUP BY c.id`, [courseId]
    );
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found." });
    if (course.enrolled_count >= course.capacity)
      return res.status(400).json({ success: false, message: "Course is at full capacity." });

    // Check student exists
    const [student] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'student' AND is_active = 1", [student_id]
    );
    if (!student.length)
      return res.status(404).json({ success: false, message: "Student not found." });

    // Check already enrolled
    const [already] = await pool.query(
      "SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?", [courseId, student_id]
    );
    if (already.length)
      return res.status(409).json({ success: false, message: "Student already enrolled." });

    await pool.query(
      "INSERT INTO enrollments (course_id, student_id) VALUES (?, ?)", [courseId, student_id]
    );

    res.status(201).json({ success: true, message: "Student enrolled successfully." });
  } catch (err) { next(err); }
};

// ── UNENROLL student ──────────────────────────────────────────
const unenrollStudent = async (req, res, next) => {
  try {
    const { id: courseId, studentId } = req.params;

    const [exists] = await pool.query(
      "SELECT id FROM enrollments WHERE course_id = ? AND student_id = ?", [courseId, studentId]
    );
    if (!exists.length)
      return res.status(404).json({ success: false, message: "Enrollment not found." });

    await pool.query(
      "DELETE FROM enrollments WHERE course_id = ? AND student_id = ?", [courseId, studentId]
    );

    res.json({ success: true, message: "Student unenrolled." });
  } catch (err) { next(err); }
};

// ── GET students NOT enrolled in a course (for dropdown) ──────
const getAvailableStudents = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, sp.student_code
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.role = 'student' AND u.is_active = 1
         AND u.id NOT IN (
           SELECT student_id FROM enrollments WHERE course_id = ?
         )
       ORDER BY u.first_name`,
      [req.params.id]
    );
    res.json({ success: true, data: { students: rows } });
  } catch (err) { next(err); }
};

module.exports = {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, enrollStudent, unenrollStudent, getAvailableStudents,
};
