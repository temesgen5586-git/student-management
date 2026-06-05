import pool from '../config/db.js';
import { generateStudentTranscript } from '../utils/createPDF.js';
import { generateStudentListExcel } from '../utils/createExcel.js';

// @desc    Generate transcript for a student (PDF)
// @route   GET /api/reports/transcript/:studentId
export const getStudentTranscript = async (req, res) => {
  try {
    const [studentRows] = await pool.query(
      `SELECT s.*, u.name, u.email
       FROM students s
       JOIN users u ON s.id = u.id
       WHERE s.id = ?`,
      [req.params.studentId]
    );
    if (studentRows.length === 0) return res.status(404).json({ message: 'Student not found' });
    const student = studentRows[0];

    const [gradeRows] = await pool.query(
      `SELECT g.*, c.name as class_name
       FROM grades g
       JOIN classes c ON g.class_id = c.id
       WHERE g.student_id = ?`,
      [req.params.studentId]
    );

    generateStudentTranscript(student, gradeRows, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Export students list to Excel
// @route   GET /api/reports/students-excel
export const exportStudentsExcel = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT s.id, s.first_name, s.last_name, s.phone, s.date_of_birth, s.address, s.enrollment_date, s.status,
             u.email
      FROM students s
      JOIN users u ON s.id = u.id
    `);
    await generateStudentListExcel(rows, res);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};