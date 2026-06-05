import pool from '../config/db.js';

const Fee = {
  async getAll({ departmentId, academicYear } = {}) {
    let query = 'SELECT f.*, d.name as department_name FROM fees f LEFT JOIN departments d ON f.department_id = d.id WHERE 1=1';
    const params = [];
    if (departmentId) { query += ' AND f.department_id = ?'; params.push(departmentId); }
    if (academicYear) { query += ' AND f.academic_year = ?'; params.push(academicYear); }
    query += ' ORDER BY f.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM fees WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ department_id, fee_type, amount, academic_year }) {
    const [result] = await pool.query(
      'INSERT INTO fees (department_id, fee_type, amount, academic_year) VALUES (?, ?, ?, ?)',
      [department_id, fee_type, amount, academic_year]
    );
    return { id: result.insertId };
  },

  async update(id, { department_id, fee_type, amount, academic_year }) {
    const [result] = await pool.query(
      `UPDATE fees
       SET department_id = COALESCE(?, department_id),
           fee_type = COALESCE(?, fee_type),
           amount = COALESCE(?, amount),
           academic_year = COALESCE(?, academic_year)
       WHERE id = ?`,
      [department_id, fee_type, amount, academic_year, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM fees WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Fee;