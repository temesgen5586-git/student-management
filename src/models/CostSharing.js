import pool from '../config/db.js';

const CostSharing = {
  async getAll({ studentId, status } = {}) {
    let query = 'SELECT * FROM cost_sharing WHERE 1=1';
    const params = [];
    if (studentId) { query += ' AND student_id = ?'; params.push(studentId); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    query += ' ORDER BY id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM cost_sharing WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ student_id, total_amount, paid_amount, due_date, status }) {
    const [result] = await pool.query(
      'INSERT INTO cost_sharing (student_id, total_amount, paid_amount, due_date, status) VALUES (?, ?, ?, ?, ?)',
      [student_id, total_amount, paid_amount || 0, due_date, status || 'active']
    );
    return { id: result.insertId };
  },

  async update(id, { total_amount, paid_amount, due_date, status }) {
    const [result] = await pool.query(
      `UPDATE cost_sharing
       SET total_amount = COALESCE(?, total_amount),
           paid_amount = COALESCE(?, paid_amount),
           due_date = COALESCE(?, due_date),
           status = COALESCE(?, status)
       WHERE id = ?`,
      [total_amount, paid_amount, due_date, status, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM cost_sharing WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default CostSharing;