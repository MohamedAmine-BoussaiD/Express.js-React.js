const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  getStudents, getStudent, createStudent,
  updateStudent, deleteStudent, getMajors,
} = require("../controllers/studentController");
const { authenticate, authorize } = require("../middleware/auth");

// All routes require admin
router.use(authenticate, authorize("admin"));

const createRules = [
  body("first_name").trim().notEmpty().withMessage("First name required."),
  body("last_name").trim().notEmpty().withMessage("Last name required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("password").isLength({ min: 6 }).withMessage("Password min 6 chars."),
  body("year_of_study").optional().isInt({ min: 1, max: 7 }),
];

const updateRules = [
  body("first_name").trim().notEmpty().withMessage("First name required."),
  body("last_name").trim().notEmpty().withMessage("Last name required."),
  body("email").isEmail().normalizeEmail().withMessage("Valid email required."),
  body("year_of_study").optional().isInt({ min: 1, max: 7 }),
];

router.get("/",          getStudents);
router.get("/majors",    getMajors);
router.get("/:id",       getStudent);
router.post("/",         createRules,  createStudent);
router.put("/:id",       updateRules,  updateStudent);
router.delete("/:id",    deleteStudent);

module.exports = router;
