-- Student Management System Database Setup
-- Run this script in MySQL to create the database and tables

-- Create database
CREATE DATABASE IF NOT EXISTS student_management;
USE student_management;

-- Users table (for authentication)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'dean', 'hod', 'teacher', 'student', 'registrar', 'finance') DEFAULT 'student',
    profile_pic VARCHAR(255),
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Faculties table
CREATE TABLE IF NOT EXISTS faculties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    faculty_id INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (faculty_id) REFERENCES faculties(id) ON DELETE SET NULL
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    studentId VARCHAR(20) NOT NULL UNIQUE,
    dateOfBirth DATE,
    gender ENUM('male', 'female', 'other'),
    phone VARCHAR(20),
    address TEXT,
    department_id INT,
    enrollmentDate DATE,
    status ENUM('active', 'inactive', 'graduated', 'suspended') DEFAULT 'active',
    photo VARCHAR(255),
    emergencyContact VARCHAR(100),
    createdBy INT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL,
    FOREIGN KEY (createdBy) REFERENCES users(id) ON DELETE SET NULL
);

-- Teachers table
CREATE TABLE IF NOT EXISTS teachers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    employeeId VARCHAR(20) NOT NULL UNIQUE,
    dateOfBirth DATE,
    gender ENUM('male', 'female', 'other'),
    phone VARCHAR(20),
    address TEXT,
    department_id INT,
    specialization VARCHAR(100),
    qualification VARCHAR(100),
    hireDate DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    photo VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Staff table
CREATE TABLE IF NOT EXISTS staff (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    firstName VARCHAR(50) NOT NULL,
    lastName VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    employeeId VARCHAR(20) NOT NULL UNIQUE,
    position VARCHAR(100),
    department_id INT,
    phone VARCHAR(20),
    hireDate DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL UNIQUE,
    credits INT NOT NULL DEFAULT 3,
    department_id INT,
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Classes table (class offerings)
CREATE TABLE IF NOT EXISTS classes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    course_id INT NOT NULL,
    teacher_id INT,
    semester VARCHAR(20),
    year INT,
    schedule VARCHAR(100),
    room VARCHAR(50),
    capacity INT DEFAULT 30,
    enrolledCount INT DEFAULT 0,
    status ENUM('open', 'closed', 'completed') DEFAULT 'open',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
    FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
);

-- Enrollments table
CREATE TABLE IF NOT EXISTS enrollments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    enrollmentDate DATE,
    enrollment_status ENUM('enrolled', 'dropped', 'completed') DEFAULT 'enrolled',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_enrollment (student_id, class_id)
);

-- Attendance table
CREATE TABLE IF NOT EXISTS attendance (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    date DATE NOT NULL,
    status ENUM('present', 'absent', 'late', 'excused') DEFAULT 'present',
    remarks TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_attendance (student_id, class_id, date)
);

-- Grades table
CREATE TABLE IF NOT EXISTS grades (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    class_id INT NOT NULL,
    grade VARCHAR(5),
    exam_date DATE,
    remarks TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
    UNIQUE KEY unique_grade (student_id, class_id)
);

-- Fees table
CREATE TABLE IF NOT EXISTS fees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    amount DECIMAL(10, 2) NOT NULL,
    due_date DATE,
    department_id INT,
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    status ENUM('active', 'inactive') DEFAULT 'active',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES departments(id) ON DELETE SET NULL
);

-- Cost Sharing table
CREATE TABLE IF NOT EXISTS cost_sharing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    fee_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'waived') DEFAULT 'pending',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (fee_id) REFERENCES fees(id) ON DELETE CASCADE
);

-- Invoices table
CREATE TABLE IF NOT EXISTS invoices (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    issue_date DATE,
    due_date DATE,
    amount DECIMAL(10, 2) NOT NULL,
    status ENUM('pending', 'paid', 'overdue', 'cancelled') DEFAULT 'pending',
    description TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Invoice Items table
CREATE TABLE IF NOT EXISTS invoice_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity INT DEFAULT 1,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_id INT,
    student_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method ENUM('cash', 'bank_transfer', 'credit_card', 'mobile_money') DEFAULT 'cash',
    payment_date DATE,
    transaction_id VARCHAR(100),
    status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'completed',
    remarks TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Certificates table
CREATE TABLE IF NOT EXISTS certificates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    certificate_type VARCHAR(50) NOT NULL,
    issue_date DATE,
    expiry_date DATE,
    certificate_number VARCHAR(50) UNIQUE,
    status ENUM('active', 'expired', 'revoked') DEFAULT 'active',
    file_path VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    action VARCHAR(50) NOT NULL,
    entity VARCHAR(50),
    entity_id INT,
    details TEXT,
    ip_address VARCHAR(45),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Settings table
CREATE TABLE IF NOT EXISTS settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(50) NOT NULL UNIQUE,
    setting_value TEXT,
    description VARCHAR(255),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert default admin user (password: AdminPass2024!)
-- bcrypt hash for 'admin123' is: $2b$10$t5lcjGJ3hnrlHH9429mgRusMfmk53b3jsHW1/xD1UX591YuhD3E2G


INSERT INTO users (name, email, password, role, status) 
VALUES ('Administrator', 'admin@school.edu', 'AdminPass2024!', 'admin', 'active')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample users 
with different roles (all passwords: admin123)
INSERT INTO users (name, email, password, role, status) 
VALUES 
('Dean Engineering', 'dean@school.edu', '$2b$10$t5lcjGJ3hnrlHH9429mgRusMfmk53b3jsHW1/xD1UX591YuhD3E2G', 'dean', 'active'),
('HOD Computer Science', 'hod@school.edu', '$2b$10$t5lcjGJ3hnrlHH9429mgRusMfmk53b3jsHW1/xD1UX591YuhD3E2G', 'hod', 'active'),
('Teacher John', 'teacher@school.edu', '$2b$10$t5lcjGJ3hnrlHH9429mgRusMfmk53b3jsHW1/xD1UX591YuhD3E2G', 'teacher', 'active'),
('Student Alice', 'student@school.edu', '$2b$10$t5lcjGJ3hnrlHH9429mgRusMfmk53b3jsHW1/xD1UX591YuhD3E2G', 'student', 'active'),
('Finance Officer', 'finance@school.edu', '$2b$10$t5lcjGJ3hnrlHH9429mgRusMfmk53b3jsHW1/xD1UX591YuhD3E2G', 'registrar', 'active')
ON DUPLICATE KEY UPDATE name = name;

-- Insert sample data for testing
INSERT INTO faculties (name, code) VALUES 
('Engineering', 'ENG'),
('Science', 'SCI'),
('Business', 'BUS')
ON DUPLICATE KEY UPDATE name = name;

INSERT INTO departments (name, code, faculty_id) VALUES 
('Computer Science', 'CS', 1),
('Electrical Engineering', 'EE', 1),
('Mathematics', 'MATH', 2),
('Physics', 'PHY', 2),
('Business Administration', 'BA', 3)
ON DUPLICATE KEY UPDATE name = name;

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_token (token),
    INDEX idx_email (email)
);
