import pool from '../config/db.js';

const Department = {
  async getAll({ facultyId } = {}) {
    let query = `
      SELECT d.*, f.name as faculty_name, u.name as hod_name
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN users u ON d.hod_id = u.id
    `;
    const params = [];
    if (facultyId) {
      query += ' WHERE d.faculty_id = ?';
      params.push(facultyId);
    }
    query += ' ORDER BY d.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT d.*, f.name as faculty_name, u.name as hod_name
      FROM departments d
      LEFT JOIN faculties f ON d.faculty_id = f.id
      LEFT JOIN users u ON d.hod_id = u.id
      WHERE d.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ name, code, faculty_id, hod_id }) {
    const [result] = await pool.query(
      'INSERT INTO departments (name, code, faculty_id, hod_id) VALUES (?, ?, ?, ?)',
      [name, code, faculty_id, hod_id]
    );
    return { id: result.insertId };
  },

  async update(id, { name, code, faculty_id, hod_id }) {
    const [result] = await pool.query(
      `UPDATE departments
       SET name = COALESCE(?, name),
           code = COALESCE(?, code),
           faculty_id = COALESCE(?, faculty_id),
           hod_id = COALESCE(?, hod_id)
       WHERE id = ?`,
      [name, code, faculty_id, hod_id, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM departments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Department;