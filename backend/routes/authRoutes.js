const express = require("express");
const { body } = require("express-validator");
const router = express.Router();

const { register, login, getMe, changePassword } = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// ── Validation rules ──────────────────────────────────────────
const registerRules = [
  body("first_name").trim().notEmpty().withMessage("First name is required."),
  body("last_name").trim().notEmpty().withMessage("Last name is required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters.")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter.")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number."),
];

const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required."),
  body("password").notEmpty().withMessage("Password is required."),
];

const changePasswordRules = [
  body("current_password").notEmpty().withMessage("Current password is required."),
  body("new_password")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters."),
];

// ── Routes ────────────────────────────────────────────────────
router.post("/register", registerRules, register);
router.post("/login", loginRules, login);
router.get("/me", authenticate, getMe);
router.put("/change-password", authenticate, changePasswordRules, changePassword);

module.exports = router;
