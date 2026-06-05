import pool from '../config/db.js';

const Course = {
  async getAll({ departmentId, search } = {}) {
    let query = `
      SELECT c.*, d.name as department_name
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      WHERE 1=1
    `;
    const params = [];
    if (departmentId) { query += ' AND c.department_id = ?'; params.push(departmentId); }
    if (search) {
      query += ' AND (c.name LIKE ? OR c.code LIKE ?)';
      params.push(`%${search}%`, `%${search}%`);
    }
    query += ' ORDER BY c.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT c.*, d.name as department_name
      FROM courses c
      JOIN departments d ON c.department_id = d.id
      WHERE c.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ name, code, credits, department_id, description }) {
    const [result] = await pool.query(
      'INSERT INTO courses (name, code, credits, department_id, description) VALUES (?, ?, ?, ?, ?)',
      [name, code, credits, department_id, description]
    );
    return { id: result.insertId };
  },

  async update(id, { name, code, credits, department_id, description }) {
    const [result] = await pool.query(
      `UPDATE courses
       SET name = COALESCE(?, name),
           code = COALESCE(?, code),
           credits = COALESCE(?, credits),
           department_id = COALESCE(?, department_id),
           description = COALESCE(?, description)
       WHERE id = ?`,
      [name, code, credits, department_id, description, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM courses WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Course;