// src/controllers/studentController.js
import Student from '../models/Student.js';
import { logAudit } from './auditController.js';
import pool from '../config/db.js';
import { validationResult } from 'express-validator'; // optional, for validation
import fs from 'fs/promises'; // for file upload handling
import path from 'path';

// ==================== Helper Functions ====================

/**
 * Generate a unique student ID (e.g., STU-2025-0001)
 */
const generateStudentId = async () => {
  const year = new Date().getFullYear();
  const [rows] = await pool.query(
    'SELECT COUNT(*) as count FROM students WHERE YEAR(createdAt) = ?',
    [year]
  );
  const seq = (rows[0].count + 1).toString().padStart(4, '0');
  return `STU-${year}-${seq}`;
};

/**
 * Validate email format and uniqueness (optional)
 */
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Build filter object from query parameters for getStudents
 */
const buildStudentFilters = (query, user) => {
  const { department, search, status, enrollmentYear, sortBy, sortOrder, page, limit } = query;
  const filters = {};

  if (department) filters.department = department;
  if (status) filters.status = status;
  if (enrollmentYear) filters.enrollmentYear = enrollmentYear;

  // Department restriction from middleware (HOD can only see own dept)
  if (user.departmentRestriction) {
    filters.department = user.departmentRestriction;
  }

  // Search across multiple fields
  if (search) {
    filters.search = search;
  }

  // Pagination
  filters.page = parseInt(page) || 1;
  filters.limit = parseInt(limit) || 20;
  filters.sortBy = sortBy || 'lastName';
  filters.sortOrder = sortOrder === 'desc' ? 'DESC' : 'ASC';

  return filters;
};

// ==================== CRUD Operations ====================

/**
 * @desc    Get all students with filtering, pagination, sorting
 * @route   GET /api/students
 * @access  Private (admin, dean, hod, teacher) + department restriction
 */
export const getStudents = async (req, res) => {
  try {
    const filters = buildStudentFilters(req.query, req.user);
    const result = await Student.getAll(filters);

    // Audit log for list view? Usually not, but could be heavy. Optional.
    res.json({
      success: true,
      data: result.data,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total: result.total,
        pages: Math.ceil(result.total / filters.limit)
      }
    });
  } catch (err) {
    console.error('Error in getStudents:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Get a single student by ID
 * @route   GET /api/students/:id
 * @access  Private (admin, dean, hod, teacher, student) + self-view for students
 */
export const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only view their own record
    if (req.user.role === 'student' && student.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden: You can only view your own profile' });
    }

    // Additional check: if teacher, restrict to own department? (handled by middleware)

    res.json({ success: true, data: student });
  } catch (err) {
    console.error('Error in getStudentById:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Create a new student
 * @route   POST /api/students
 * @access  Private (admin, registrar)
 */
export const createStudent = async (req, res) => {
  // Validate input (using express-validator or manual)
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const { firstName, lastName, email, dateOfBirth, department, phone, address, emergencyContact, enrollmentDate } = req.body;

    // Validate email format
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Invalid email format' });
    }

    // Check if email or studentId already exists
    const existing = await Student.findByEmailOrId({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Student with this email already exists' });
    }

    // Generate a unique student ID
    const studentId = await generateStudentId();

    const newStudent = await Student.create({
      firstName,
      lastName,
      email,
      studentId,
      dateOfBirth,
      department,
      phone,
      address,
      emergencyContact,
      enrollmentDate: enrollmentDate || new Date(),
      createdBy: req.user.id,
      status: 'active' // default
    });

    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'student',
      entityId: newStudent.id,
      ipAddress: req.ip,
      details: `Created student ${firstName} ${lastName} (${studentId})`
    });

    res.status(201).json({ success: true, data: newStudent });
  } catch (err) {
    console.error('Error in createStudent:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Update a student
 * @route   PUT /api/students/:id
 * @access  Private (admin, registrar)
 */
export const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Prevent changing email to an existing one
    if (req.body.email && req.body.email !== student.email) {
      if (!validateEmail(req.body.email)) {
        return res.status(400).json({ success: false, message: 'Invalid email format' });
      }
      const conflict = await Student.findByEmailOrId({ email: req.body.email, excludeId: req.params.id });
      if (conflict) {
        return res.status(400).json({ success: false, message: 'Email already in use by another student' });
      }
    }

    // Prevent changing studentId (should be immutable)
    if (req.body.studentId && req.body.studentId !== student.studentId) {
      return res.status(400).json({ success: false, message: 'Student ID cannot be changed' });
    }

    const updated = await Student.update(req.params.id, req.body);

    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'student',
      entityId: req.params.id,
      ipAddress: req.ip,
      details: `Updated student ${student.firstName} ${student.lastName}`
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error in updateStudent:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Delete a student
 * @route   DELETE /api/students/:id
 * @access  Private (admin)
 */
export const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Optional: check if student has active enrollments before deleting
    const enrollments = await Student.getEnrollments(req.params.id);
    if (enrollments && enrollments.length > 0) {
      return res.status(400).json({ success: false, message: 'Cannot delete student with active enrollments. Consider deactivating instead.' });
    }

    const deleted = await Student.delete(req.params.id);
    if (!deleted) {
      return res.status(500).json({ success: false, message: 'Failed to delete student' });
    }

    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'student',
      entityId: req.params.id,
      ipAddress: req.ip,
      details: `Deleted student ${student.firstName} ${student.lastName} (${student.studentId})`
    });

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (err) {
    console.error('Error in deleteStudent:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ==================== Additional Endpoints ====================

/**
 * @desc    Get academic status for a student (GPA, credits, standing)
 * @route   GET /api/students/:id/academic-status
 * @access  Private (admin, hod, teacher, student)
 */
export const getAcademicStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only view their own
    if (req.user.role === 'student' && student.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const status = await Student.getAcademicStatus(req.params.id);
    if (!status) {
      return res.status(404).json({ success: false, message: 'Academic status not available' });
    }

    res.json({ success: true, data: status });
  } catch (err) {
    console.error('Error in getAcademicStatus:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Get top students by GPA
 * @route   GET /api/students/top/students
 * @access  Private (admin, dean, hod)
 */
export const getTopStudents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const department = req.query.department; // optional filter
    const topStudents = await Student.getTopStudents(limit, department);
    res.json({ success: true, data: topStudents });
  } catch (err) {
    console.error('Error in getTopStudents:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Get student enrollments (courses they are registered in)
 * @route   GET /api/students/:id/enrollments
 * @access  Private (admin, hod, teacher, student)
 */
export const getStudentEnrollments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.role === 'student' && student.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const enrollments = await Student.getEnrollments(req.params.id);
    res.json({ success: true, data: enrollments });
  } catch (err) {
    console.error('Error in getStudentEnrollments:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Get student's transcript (all courses with grades)
 * @route   GET /api/students/:id/transcript
 * @access  Private (admin, hod, teacher, student)
 */
export const getStudentTranscript = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (req.user.role === 'student' && student.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const transcript = await Student.getTranscript(req.params.id);
    res.json({ success: true, data: transcript });
  } catch (err) {
    console.error('Error in getStudentTranscript:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Bulk create students (import from CSV/JSON)
 * @route   POST /api/students/bulk
 * @access  Private (admin, registrar)
 */
export const bulkCreateStudents = async (req, res) => {
  if (!['admin', 'registrar'].includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const studentsData = req.body; // expecting an array of student objects
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data: expected non-empty array' });
    }

    const results = {
      created: [],
      errors: []
    };

    for (const data of studentsData) {
      try {
        // Validate email
        if (!data.email || !validateEmail(data.email)) {
          results.errors.push({ data, error: 'Invalid email' });
          continue;
        }

        // Check duplicate
        const existing = await Student.findByEmailOrId({ email: data.email });
        if (existing) {
          results.errors.push({ data, error: 'Email already exists' });
          continue;
        }

        // Generate studentId if not provided
        if (!data.studentId) {
          data.studentId = await generateStudentId();
        }

        const newStudent = await Student.create({
          ...data,
          createdBy: req.user.id,
          status: data.status || 'active'
        });
        results.created.push(newStudent);

        // Audit each creation individually (optional)
        await logAudit({
          userId: req.user.id,
          action: 'CREATE',
          entity: 'student',
          entityId: newStudent.id,
          ipAddress: req.ip,
          details: `Bulk created student ${newStudent.firstName} ${newStudent.lastName}`
        });
      } catch (err) {
        results.errors.push({ data, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Bulk creation completed: ${results.created.length} created, ${results.errors.length} failed`,
      data: results
    });
  } catch (err) {
    console.error('Error in bulkCreateStudents:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Bulk delete students (by IDs)
 * @route   DELETE /api/students/bulk
 * @access  Private (admin)
 */
export const bulkDeleteStudents = async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Forbidden' });
  }

  try {
    const { ids } = req.body; // array of student IDs
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ success: false, message: 'Invalid data: expected non-empty array of IDs' });
    }

    const result = await Student.bulkDelete(ids);

    await logAudit({
      userId: req.user.id,
      action: 'BULK_DELETE',
      entity: 'student',
      entityId: null,
      ipAddress: req.ip,
      details: `Bulk deleted ${result.deletedCount} students`
    });

    res.json({ success: true, message: `Deleted ${result.deletedCount} students`, data: result });
  } catch (err) {
    console.error('Error in bulkDeleteStudents:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Get student statistics (counts by department, status, etc.)
 * @route   GET /api/students/stats
 * @access  Private (admin, dean, hod)
 */
export const getStudentStatistics = async (req, res) => {
  try {
    const stats = await Student.getStatistics(req.user.departmentRestriction);
    res.json({ success: true, data: stats });
  } catch (err) {
    console.error('Error in getStudentStatistics:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Upload student photo (profile picture)
 * @route   POST /api/students/:id/photo
 * @access  Private (admin, registrar, student (own))
 */
export const uploadStudentPhoto = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Students can only upload their own photo
    if (req.user.role === 'student' && student.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // Save file path to database
    const photoPath = `/uploads/students/${req.params.id}/${req.file.filename}`;
    await Student.update(req.params.id, { photo: photoPath });

    await logAudit({
      userId: req.user.id,
      action: 'UPLOAD_PHOTO',
      entity: 'student',
      entityId: req.params.id,
      ipAddress: req.ip
    });

    res.json({ success: true, message: 'Photo uploaded successfully', data: { photoPath } });
  } catch (err) {
    console.error('Error in uploadStudentPhoto:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Change student status (active, inactive, graduated, etc.)
 * @route   PATCH /api/students/:id/status
 * @access  Private (admin, registrar)
 */
export const changeStudentStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['active', 'inactive', 'graduated', 'suspended'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value' });
    }

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    const updated = await Student.update(req.params.id, { status });

    await logAudit({
      userId: req.user.id,
      action: 'CHANGE_STATUS',
      entity: 'student',
      entityId: req.params.id,
      ipAddress: req.ip,
      details: `Changed status to ${status}`
    });

    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('Error in changeStudentStatus:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

/**
 * @desc    Get student by user ID (if users are linked)
 * @route   GET /api/students/user/:userId
 * @access  Private (admin, student (own))
 */
export const getStudentByUserId = async (req, res) => {
  try {
    const student = await Student.findByUserId(req.params.userId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found for this user' });
    }

    // Students can only get their own
    if (req.user.role === 'student' && student.id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    res.json({ success: true, data: student });
  } catch (err) {
    console.error('Error in getStudentByUserId:', err);
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};