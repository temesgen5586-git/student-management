import pool from '../config/db.js';

const Attendance = {
  async getByFilters({ studentId, classId, date, fromDate, toDate } = {}) {
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (studentId) {
      whereClause += ' AND a.student_id = ?';
      params.push(studentId);
    }
    if (classId) {
      whereClause += ' AND a.class_id = ?';
      params.push(classId);
    }
    if (date) {
      whereClause += ' AND a.date = ?';
      params.push(date);
    } else {
      if (fromDate) {
        whereClause += ' AND a.date >= ?';
        params.push(fromDate);
      }
      if (toDate) {
        whereClause += ' AND a.date <= ?';
        params.push(toDate);
      }
    }

    const query = `
      SELECT a.*, s.first_name, s.last_name, u.name as marked_by_name
      FROM attendance a
      JOIN students s ON a.student_id = s.id
      LEFT JOIN users u ON a.marked_by = u.id
      ${whereClause}
      ORDER BY a.date DESC, a.id DESC
    `;
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findOne(studentId, classId, date) {
    const [rows] = await pool.query(
      'SELECT * FROM attendance WHERE student_id = ? AND class_id = ? AND date = ?',
      [studentId, classId, date]
    );
    return rows[0];
  },

  async createOrUpdate(attendanceData) {
    const { student_id, class_id, date, status, marked_by, remarks } = attendanceData;
    const [result] = await pool.query(
      `INSERT INTO attendance (student_id, class_id, date, status, marked_by, remarks)
       VALUES (?, ?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), remarks = VALUES(remarks)`,
      [student_id, class_id, date, status, marked_by, remarks || null]
    );
    return result;
  },

  async bulkCreateOrUpdate(attendanceList) {
    // attendanceList: array of objects
    if (!attendanceList.length) return;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      for (const record of attendanceList) {
        await connection.query(
          `INSERT INTO attendance (student_id, class_id, date, status, marked_by, remarks)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status), marked_by = VALUES(marked_by), remarks = VALUES(remarks)`,
          [record.student_id, record.class_id, record.date, record.status, record.marked_by, record.remarks || null]
        );
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM attendance WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Attendance;