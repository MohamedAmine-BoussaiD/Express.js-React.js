const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const {
  getCourses, getCourse, createCourse, updateCourse,
  deleteCourse, enrollStudent, unenrollStudent, getAvailableStudents,
} = require("../controllers/courseController");
const { authenticate, authorize } = require("../middleware/auth");

router.use(authenticate, authorize("admin"));

const courseRules = [
  body("code").trim().notEmpty().withMessage("Course code is required."),
  body("name").trim().notEmpty().withMessage("Course name is required."),
  body("credits").optional().isInt({ min: 1, max: 10 }),
  body("capacity").optional().isInt({ min: 1 }),
  body("status").optional().isIn(["active", "inactive"]),
];

router.get("/",                              getCourses);
router.get("/:id",                           getCourse);
router.get("/:id/available-students",        getAvailableStudents);
router.post("/",              courseRules,   createCourse);
router.put("/:id",            courseRules,   updateCourse);
router.delete("/:id",                        deleteCourse);
router.post("/:id/enroll",                   enrollStudent);
router.delete("/:id/enroll/:studentId",      unenrollStudent);

module.exports = router;
