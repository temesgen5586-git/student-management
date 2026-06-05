import pool from '../config/db.js';

const Class = {
  async getAll({ page = 1, limit = 10, teacherId, academicYear } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (teacherId) {
      whereClause += ' AND teacher_id = ?';
      params.push(teacherId);
    }
    if (academicYear) {
      whereClause += ' AND academic_year = ?';
      params.push(academicYear);
    }

    const query = `
      SELECT c.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      ${whereClause}
      ORDER BY c.id DESC
      LIMIT ? OFFSET ?
    `;
    const countQuery = `SELECT COUNT(*) as total FROM classes c ${whereClause}`;

    const [rows] = await pool.query(query, [...params, limit, offset]);
    const [totalRows] = await pool.query(countQuery, params);
    return { classes: rows, total: totalRows[0].total };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT c.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name
       FROM classes c
       LEFT JOIN teachers t ON c.teacher_id = t.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(classData) {
    const { name, code, subject, schedule, room, teacher_id, academic_year } = classData;
    const [result] = await pool.query(
      `INSERT INTO classes (name, code, subject, schedule, room, teacher_id, academic_year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, code, subject, schedule, room, teacher_id, academic_year]
    );
    return { id: result.insertId };
  },

  async update(id, fields) {
    const { name, code, subject, schedule, room, teacher_id, academic_year } = fields;
    const updates = [];
    const values = [];

    if (name) { updates.push('name = ?'); values.push(name); }
    if (code) { updates.push('code = ?'); values.push(code); }
    if (subject) { updates.push('subject = ?'); values.push(subject); }
    if (schedule) { updates.push('schedule = ?'); values.push(schedule); }
    if (room) { updates.push('room = ?'); values.push(room); }
    if (teacher_id !== undefined) { updates.push('teacher_id = ?'); values.push(teacher_id); }
    if (academic_year) { updates.push('academic_year = ?'); values.push(academic_year); }

    if (updates.length === 0) return false;

    const query = `UPDATE classes SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Class;