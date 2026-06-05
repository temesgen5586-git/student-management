import pool from '../config/db.js';
import { calculateGPA } from '../utils/academicUtils.js';

export const getAdminDashboardStats = async (req, res) => {
  try {
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) as totalStudents FROM students');
    const [[{ totalTeachers }]] = await pool.query('SELECT COUNT(*) as totalTeachers FROM teachers');
    const [[{ totalClasses }]] = await pool.query('SELECT COUNT(*) as totalClasses FROM classes');
    const [[{ totalEnrollments }]] = await pool.query('SELECT COUNT(*) as totalEnrollments FROM enrollments');
    const [recentStudents] = await pool.query(
      'SELECT * FROM students ORDER BY id DESC LIMIT 5'
    );
    res.json({
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      totalClasses: totalClasses || 0,
      totalEnrollments: totalEnrollments || 0,
      recentStudents
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDeanDashboardStats = async (req, res) => {
  try {
    // Get all departments with counts
    const [departments] = await pool.query('SELECT * FROM departments');
    const [[{ totalDepartments }]] = await pool.query('SELECT COUNT(*) as totalDepartments FROM departments');
    
    // Get students count per department
    const [[{ totalStudents }]] = await pool.query('SELECT COUNT(*) as totalStudents FROM students');
    
    // Get teachers count
    const [[{ totalTeachers }]] = await pool.query('SELECT COUNT(*) as totalTeachers FROM teachers');
    
    // Get courses count
    const [[{ totalCourses }]] = await pool.query('SELECT COUNT(*) as totalCourses FROM courses');
    
    res.json({
      totalDepartments: totalDepartments || 0,
      totalStudents: totalStudents || 0,
      totalTeachers: totalTeachers || 0,
      totalCourses: totalCourses || 0,
      departments
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getHodDashboardStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get department of the HOD - look for teacher with this user_id
    const [teacherDept] = await pool.query(
      'SELECT department_id FROM teachers WHERE user_id = ?',
      [userId]
    );
    
    let deptId = null;
    if (teacherDept.length && teacherDept[0].department_id) {
      deptId = teacherDept[0].department_id;
    }
    
    if (!deptId) {
      // Fallback: try to get from first teacher in departments
      return res.json({
        totalTeachers: 0,
        totalStudents: 0,
        totalCourses: 0,
        courses: []
      });
    }
    
    // Get teachers in this department
    const [teachers] = await pool.query(
      'SELECT * FROM teachers WHERE department_id = ?',
      [deptId]
    );
    
    // Get students in this department
    const [students] = await pool.query(
      'SELECT * FROM students WHERE department_id = ?',
      [deptId]
    );
    
    // Get courses for this department
    const [courses] = await pool.query(
      'SELECT * FROM courses WHERE department_id = ?',
      [deptId]
    );
    
    res.json({
      totalTeachers: teachers.length,
      totalStudents: students.length,
      totalCourses: courses.length,
      courses
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeacherDashboardStats = async (req, res) => {
  const userId = req.user.id;
  try {
    // Find teacher by user_id
    const [teachers] = await pool.query(
      'SELECT id FROM teachers WHERE user_id = ?',
      [userId]
    );
    
    if (!teachers.length) {
      return res.json({ classes: [], totalStudents: 0 });
    }
    
    const teacherId = teachers[0].id;
    const [classes] = await pool.query(
      'SELECT * FROM classes WHERE teacher_id = ?',
      [teacherId]
    );
    const classIds = classes.map(c => c.id);
    let totalStudents = 0;
    if (classIds.length > 0) {
      const [rows] = await pool.query(
        'SELECT COUNT(DISTINCT student_id) as total FROM enrollments WHERE class_id IN (?)',
        [classIds]
      );
      totalStudents = rows[0].total;
    }
    res.json({ classes, totalStudents });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStudentDashboardStats = async (req, res) => {
  const userId = req.user.id;
  try {
    // Find student by user_id
    const [students] = await pool.query(
      'SELECT * FROM students WHERE user_id = ?',
      [userId]
    );

    if (!students.length) {
      return res.json({ enrollments: [], attendance: [], grades: [] });
    }
    
    const student = students[0];
    const studentId = student.id;
    const gpa = await calculateGPA(studentId, pool);

    
    const [enrollments] = await pool.query(
      `SELECT c.*, e.status as enrollment_status
       FROM enrollments e
       JOIN classes c ON e.class_id = c.id
       WHERE e.student_id = ?`,
      [studentId]
    );
    const [attendance] = await pool.query(
      `SELECT status, COUNT(*) as count
       FROM attendance
       WHERE student_id = ?
       GROUP BY status`,
      [studentId]
    );

    const [grades] = await pool.query(
      `SELECT g.*, c.name as class_name
       FROM grades g
       JOIN classes c ON g.class_id = c.id
       WHERE g.student_id = ?
       ORDER BY g.exam_date DESC LIMIT 10`,
      [studentId]
    );
    res.json({ 
      enrollments, 
      attendance, 
      grades, 
      gpa: gpa.toFixed(2),
      standing: gpa >= 3.0 ? 'Excellent' : gpa >= 2.0 ? 'Good' : 'Probation',
      batch: student.batch,
      department_id: student.department_id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

