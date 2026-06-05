import pool from '../config/db.js';

export const getEnrollments = async (req, res) => {
  try {
    const { studentId, classId } = req.query;
    let query = `
      SELECT e.*, s.first_name, s.last_name, c.name as class_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN classes c ON e.class_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (studentId) {
      query += ' AND e.student_id = ?';
      params.push(studentId);
    }
    if (classId) {
      query += ' AND e.class_id = ?';
      params.push(classId);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createEnrollment = async (req, res) => {
  const { student_id, class_id, enrollment_date, status } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO enrollments (student_id, class_id, enrollment_date, status)
       VALUES (?, ?, ?, ?)`,
      [student_id, class_id, enrollment_date || new Date(), status || 'active']
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Student already enrolled in this class' });
    }
    res.status(500).json({ message: err.message });
  }
};

export const updateEnrollment = async (req, res) => {
  const { status } = req.body;
  try {
    const [result] = await pool.query(
      'UPDATE enrollments SET status = ? WHERE id = ?',
      [status, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Enrollment updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM enrollments WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Enrollment not found' });
    res.json({ message: 'Enrollment deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};