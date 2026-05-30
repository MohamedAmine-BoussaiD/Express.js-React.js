const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { pool } = require("../config/db");

// ── Helper: sign tokens ──────────────────────────────────────
const signAccessToken = (user) =>
  jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

// ── REGISTER ─────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { first_name, last_name, email, password, role = "student" } = req.body;

    // Only admin can create admin/teacher accounts via this endpoint
    const allowedRoles = ["student"];
    if (!allowedRoles.includes(role)) {
      return res.status(403).json({
        success: false,
        message: "You can only register as a student via this endpoint.",
      });
    }

    // Check duplicate email
    const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
    if (existing.length) {
      return res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert user
    const [result] = await pool.query(
      "INSERT INTO users (first_name, last_name, email, password, role) VALUES (?, ?, ?, ?, ?)",
      [first_name, last_name, email, hashedPassword, role]
    );

    const userId = result.insertId;

    // Auto-generate student code: STU-YEAR-ID
    const year = new Date().getFullYear();
    const studentCode = `STU-${year}-${String(userId).padStart(4, "0")}`;

    // Create student profile
    await pool.query(
      "INSERT INTO student_profiles (user_id, student_code) VALUES (?, ?)",
      [userId, studentCode]
    );

    // Return new user (no password)
    const [newUser] = await pool.query(
      "SELECT id, first_name, last_name, email, role, created_at FROM users WHERE id = ?",
      [userId]
    );

    const token = signAccessToken(newUser[0]);

    return res.status(201).json({
      success: true,
      message: "Account created successfully.",
      data: { user: newUser[0], token },
    });
  } catch (error) {
    next(error);
  }
};

// ── LOGIN ─────────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user
    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const user = rows[0];

    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Contact an administrator.",
      });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = signAccessToken(user);

    // Remove password from response
    const { password: _pw, ...userData } = user;

    return res.status(200).json({
      success: true,
      message: "Login successful.",
      data: { user: userData, token },
    });
  } catch (error) {
    next(error);
  }
};

// ── GET ME (current user) ─────────────────────────────────────
const getMe = async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT u.id, u.first_name, u.last_name, u.email, u.role, u.avatar, u.created_at,
              sp.student_code, sp.date_of_birth, sp.phone, sp.major, sp.year_of_study
       FROM users u
       LEFT JOIN student_profiles sp ON sp.user_id = u.id
       WHERE u.id = ?`,
      [req.user.id]
    );

    if (!rows.length) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({ success: true, data: { user: rows[0] } });
  } catch (error) {
    next(error);
  }
};

// ── CHANGE PASSWORD ───────────────────────────────────────────
const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ success: false, errors: errors.array() });
    }

    const { current_password, new_password } = req.body;

    const [rows] = await pool.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    const isMatch = await bcrypt.compare(current_password, rows[0].password);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: "Current password is incorrect." });
    }

    const hashed = await bcrypt.hash(new_password, 12);
    await pool.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);

    return res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, changePassword };
