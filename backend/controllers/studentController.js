const bcrypt = require("bcryptjs");
const { validationResult } = require("express-validator");
const { pool } = require("../config/db");

// ── LIST all students (with search + pagination) ─────────────
const getStudents = async (req, res, next) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page)  || 1);
    const limit    = Math.min(50, parseInt(req.query.limit) || 10);
    const offset   = (page - 1) * limit;
    const search   = req.query.search ? `%${req.query.search}%` : null;
    const major    = req.query.major  || null;

    let where = "WHERE u.role = 'student' AND u.is_active = 1";
    const params = [];

    if (search) {
      where += " AND (u.first_name LIKE ? OR u.last_name LIKE ? OR u.email LIKE ? OR sp.student_code LIKE ?)";
      params.push(search, search, search, search);
    }
    if (major) {
      where += " AND sp.major = ?";
      params.push(major);
    }

    // Total count
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id ${where}`,
      params
    );

    // Paginated rows
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at,
              sp.student_code, sp.date_of_birth, sp.phone, sp.major, sp.year_of_study, sp.address
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       ${where}
       ORDER BY u.created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    res.json({
      success: true,
      data: {
        students: rows,
        pagination: { total, page, limit, pages: Math.ceil(total / limit) },
      },
    });
  } catch (err) { next(err); }
};

// ── GET single student ────────────────────────────────────────
const getStudent = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at,
              sp.student_code, sp.date_of_birth, sp.phone, sp.major, sp.year_of_study, sp.address
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ? AND u.role = 'student'`,
      [req.params.id]
    );

    if (!rows.length)
      return res.status(404).json({ success: false, message: "Student not found." });

    res.json({ success: true, data: { student: rows[0] } });
  } catch (err) { next(err); }
};

// ── CREATE student (admin creates on behalf) ──────────────────
const createStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const {
      first_name, last_name, email, password,
      phone, date_of_birth, major, year_of_study = 1, address,
    } = req.body;

    // Check duplicate email
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length)
      return res.status(409).json({ success: false, message: "Email already in use." });

    const hashed = await bcrypt.hash(password, 12);

    const [result] = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?,?,?,?,'student')",
      [first_name, last_name, email, hashed]
    );
    const userId = result.insertId;
    const studentCode = `STU-${new Date().getFullYear()}-${String(userId).padStart(4, "0")}`;

    await pool.query(
      `INSERT INTO student_profiles
         (user_id, student_code, phone, date_of_birth, major, year_of_study, address)
       VALUES (?,?,?,?,?,?,?)`,
      [userId, studentCode, phone || null, date_of_birth || null,
       major || null, year_of_study, address || null]
    );

    const [newStudent] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.created_at,
              sp.student_code, sp.major, sp.year_of_study
       FROM users u LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ?`,
      [userId]
    );

    res.status(201).json({
      success: true,
      message: "Student created successfully.",
      data: { student: newStudent[0] },
    });
  } catch (err) { next(err); }
};

// ── UPDATE student ────────────────────────────────────────────
const updateStudent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ success: false, errors: errors.array() });

    const { id } = req.params;
    const {
      first_name, last_name, email,
      phone, date_of_birth, major, year_of_study, address,
    } = req.body;

    // Check student exists
    const [exists] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'student'", [id]
    );
    if (!exists.length)
      return res.status(404).json({ success: false, message: "Student not found." });

    // Check email not taken by another user
    if (email) {
      const [dup] = await pool.query(
        "SELECT id FROM users WHERE email = ? AND id != ?", [email, id]
      );
      if (dup.length)
        return res.status(409).json({ success: false, message: "Email already in use." });
    }

    await pool.query(
      "UPDATE users SET first_name=?, last_name=?, email=? WHERE id=?",
      [first_name, last_name, email, id]
    );

    await pool.query(
      `UPDATE student_profiles
       SET phone=?, date_of_birth=?, major=?, year_of_study=?, address=?
       WHERE user_id=?`,
      [phone || null, date_of_birth || null, major || null,
       year_of_study || 1, address || null, id]
    );

    const [updated] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.is_active, u.created_at,
              sp.student_code, sp.date_of_birth, sp.phone, sp.major, sp.year_of_study, sp.address
       FROM users u LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ?`,
      [id]
    );

    res.json({
      success: true,
      message: "Student updated successfully.",
      data: { student: updated[0] },
    });
  } catch (err) { next(err); }
};

// ── SOFT DELETE (deactivate) ──────────────────────────────────
const deleteStudent = async (req, res, next) => {
  try {
    const { id } = req.params;

    const [exists] = await pool.query(
      "SELECT id FROM users WHERE id = ? AND role = 'student'", [id]
    );
    if (!exists.length)
      return res.status(404).json({ success: false, message: "Student not found." });

    await pool.query("UPDATE users SET is_active = 0 WHERE id = ?", [id]);

    res.json({ success: true, message: "Student deactivated successfully." });
  } catch (err) { next(err); }
};

// ── GET distinct majors (for filter dropdown) ─────────────────
const getMajors = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT DISTINCT major FROM student_profiles WHERE major IS NOT NULL ORDER BY major"
    );
    res.json({ success: true, data: { majors: rows.map(r => r.major) } });
  } catch (err) { next(err); }
};

module.exports = { getStudents, getStudent, createStudent, updateStudent, deleteStudent, getMajors };
