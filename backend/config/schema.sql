-- ============================================================
-- Student Management System - Database Schema
-- Run this file once to initialize the database
-- ============================================================

CREATE DATABASE IF NOT EXISTS student_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE student_management;

-- ─────────────────────────────────────────
-- USERS table (admins, teachers, students)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  first_name  VARCHAR(100) NOT NULL,
  last_name   VARCHAR(100) NOT NULL,
  email       VARCHAR(191) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,
  role        ENUM('admin', 'teacher', 'student') NOT NULL DEFAULT 'student',
  avatar      VARCHAR(255) DEFAULT NULL,
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
-- STUDENT PROFILES (extends users)
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS student_profiles (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL UNIQUE,
  student_code  VARCHAR(20) NOT NULL UNIQUE,
  date_of_birth DATE DEFAULT NULL,
  phone         VARCHAR(20) DEFAULT NULL,
  address       TEXT DEFAULT NULL,
  major         VARCHAR(150) DEFAULT NULL,
  year_of_study TINYINT DEFAULT 1,
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
-- REFRESH TOKENS
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  user_id    INT NOT NULL,
  token      VARCHAR(512) NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─────────────────────────────────────────
-- SEED: default admin account
-- password: Admin@1234
-- ─────────────────────────────────────────
INSERT IGNORE INTO users (first_name, last_name, email, password, role)
VALUES (
  'Super', 'Admin',
  'admin@school.com',
  '$2a$12$9v.3Yh8zKzT1Jq1wQ2hHuOt/UVz0Q1yYkVMO5s9yH2CcG3mGv8Bxm',
  'admin'
);
-- NOTE: Hash above = bcrypt("Admin@1234", 12)
-- Change this password immediately after first login!
