-- ============================================================
-- Course Management - Add these tables to your existing DB
-- Run in MySQL: source this file or paste manually
-- ============================================================

USE student_management;

-- ─────────────────────────────────────────
-- COURSES table
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS courses (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  code        VARCHAR(20)  NOT NULL UNIQUE,
  name        VARCHAR(150) NOT NULL,
  description TEXT         DEFAULT NULL,
  credits     TINYINT      NOT NULL DEFAULT 3,
  capacity    INT          NOT NULL DEFAULT 30,
  status      ENUM('active','inactive') NOT NULL DEFAULT 'active',
  created_by  INT          DEFAULT NULL,
  created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
-- ENROLLMENTS table (course ↔ student)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS enrollments (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  course_id   INT NOT NULL,
  student_id  INT NOT NULL,
  enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_enrollment (course_id, student_id),
  FOREIGN KEY (course_id)  REFERENCES courses(id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES users(id)   ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
-- SEED: a few sample courses
-- ─────────────────────────────────────────
INSERT IGNORE INTO courses (code, name, description, credits, capacity, status) VALUES
  ('CS101', 'Introduction to Computer Science', 'Fundamentals of programming and computational thinking.', 3, 40, 'active'),
  ('MATH201', 'Linear Algebra', 'Vectors, matrices, and linear transformations.', 4, 35, 'active'),
  ('ENG101', 'Technical English', 'Academic writing and communication skills.', 2, 50, 'active'),
  ('WEB301', 'Web Development', 'HTML, CSS, JavaScript and modern frameworks.', 4, 30, 'active');
