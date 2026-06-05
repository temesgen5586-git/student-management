import pool from '../config/db.js';

const Teacher = {
  async getAll({ page = 1, limit = 10, search } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (search) {
      whereClause += ` AND (t.first_name LIKE ? OR t.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const query = `
      SELECT t.*, u.name, u.email, u.profile_pic
      FROM teachers t
      JOIN users u ON t.id = u.id
      ${whereClause}
      ORDER BY t.id DESC
      LIMIT ? OFFSET ?
    `;
    const countQuery = `
      SELECT COUNT(*) as total
      FROM teachers t
      JOIN users u ON t.id = u.id
      ${whereClause}
    `;

    const [rows] = await pool.query(query, [...params, limit, offset]);
    const [totalRows] = await pool.query(countQuery, params);
    return { teachers: rows, total: totalRows[0].total };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT t.*, u.name, u.email, u.profile_pic
       FROM teachers t
       JOIN users u ON t.id = u.id
       WHERE t.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(teacherData) {
    const { id, first_name, last_name, phone, qualification, hire_date } = teacherData;
    const [result] = await pool.query(
      `INSERT INTO teachers (id, first_name, last_name, phone, qualification, hire_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, first_name, last_name, phone, qualification, hire_date || new Date()]
    );
    return result;
  },

  async update(id, fields) {
    const { first_name, last_name, phone, qualification, hire_date } = fields;
    const updates = [];
    const values = [];

    if (first_name) { updates.push('first_name = ?'); values.push(first_name); }
    if (last_name) { updates.push('last_name = ?'); values.push(last_name); }
    if (phone) { updates.push('phone = ?'); values.push(phone); }
    if (qualification) { updates.push('qualification = ?'); values.push(qualification); }
    if (hire_date) { updates.push('hire_date = ?'); values.push(hire_date); }

    if (updates.length === 0) return false;

    const query = `UPDATE teachers SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM teachers WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Teacher;