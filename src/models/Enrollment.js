import pool from '../config/db.js';

const Enrollment = {
  async getAll({ studentId, classId, status } = {}) {
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (studentId) {
      whereClause += ' AND student_id = ?';
      params.push(studentId);
    }
    if (classId) {
      whereClause += ' AND class_id = ?';
      params.push(classId);
    }
    if (status) {
      whereClause += ' AND status = ?';
      params.push(status);
    }

    const query = `
      SELECT e.*, s.first_name, s.last_name, c.name as class_name
      FROM enrollments e
      JOIN students s ON e.student_id = s.id
      JOIN classes c ON e.class_id = c.id
      ${whereClause}
      ORDER BY e.id DESC
    `;
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT e.*, s.first_name, s.last_name, c.name as class_name
       FROM enrollments e
       JOIN students s ON e.student_id = s.id
       JOIN classes c ON e.class_id = c.id
       WHERE e.id = ?`,
      [id]
    );
    return rows[0];
  },

  async findByStudentAndClass(studentId, classId) {
    const [rows] = await pool.query(
      'SELECT * FROM enrollments WHERE student_id = ? AND class_id = ?',
      [studentId, classId]
    );
    return rows[0];
  },

  async create(enrollmentData) {
    const { student_id, class_id, enrollment_date, status } = enrollmentData;
    try {
      const [result] = await pool.query(
        `INSERT INTO enrollments (student_id, class_id, enrollment_date, status)
         VALUES (?, ?, ?, ?)`,
        [student_id, class_id, enrollment_date || new Date(), status || 'active']
      );
      return { id: result.insertId };
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        throw new Error('Student already enrolled in this class');
      }
      throw err;
    }
  },

  async update(id, fields) {
    const { status } = fields;
    if (!status) return false;
    const [result] = await pool.query(
      'UPDATE enrollments SET status = ? WHERE id = ?',
      [status, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM enrollments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Enrollment;