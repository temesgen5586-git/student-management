import pool from '../config/db.js';

// @desc    Mark attendance for a class on a specific date (bulk)
// @route   POST /api/attendance
export const markAttendance = async (req, res) => {
  const { class_id, date, attendanceList } = req.body; // attendanceList: [{ student_id, status, remarks? }]
  const teacher_id = req.user.id; // from auth middleware
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    for (const record of attendanceList) {
      await connection.query(
        `INSERT INTO attendance (student_id, class_id, date, status, marked_by, remarks)
         VALUES (?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), remarks = VALUES(remarks)`,
        [record.student_id, class_id, date, record.status, teacher_id, record.remarks || null]
      );
    }

    await connection.commit();
    res.json({ message: 'Attendance recorded successfully' });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// @desc    Get attendance for a class on a date
// @route   GET /api/attendance?class_id=&date=
export const getAttendance = async (req, res) => {
  const { class_id, date, student_id } = req.query;
  try {
    let query = `
      SELECT a.*, s.first_name, s.last_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      WHERE 1=1
    `;
    const params = [];
    if (class_id) {
      query += ' AND a.class_id = ?';
      params.push(class_id);
    }
    if (date) {
      query += ' AND a.date = ?';
      params.push(date);
    }
    if (student_id) {
      query += ' AND a.student_id = ?';
      params.push(student_id);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};