import pool from '../config/db.js';

const Leave = {
  async getAll({ staffId, status } = {}) {
    let query = `
      SELECT l.*, s.employee_id, s.position, u.name as staff_name, approver.name as approved_by_name
      FROM leaves l
      JOIN staff s ON l.staff_id = s.id
      JOIN users u ON l.staff_id = u.id
      LEFT JOIN users approver ON l.approved_by = approver.id
      WHERE 1=1
    `;
    const params = [];
    if (staffId) { 
      query += ' AND l.staff_id = ?'; 
      params.push(staffId); 
    }
    if (status) { 
      query += ' AND l.status = ?'; 
      params.push(status); 
    }
    query += ' ORDER BY l.created_at DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT l.*, s.employee_id, s.position, u.name as staff_name, approver.name as approved_by_name
      FROM leaves l
      JOIN staff s ON l.staff_id = s.id
      JOIN users u ON l.staff_id = u.id
      LEFT JOIN users approver ON l.approved_by = approver.id
      WHERE l.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ staff_id, type, start_date, end_date, days, status = 'pending' }) {
    const [result] = await pool.query(
      `INSERT INTO leaves (id, staff_id, type, start_date, end_date, days, status)
       VALUES (UUID_SHORT(), ?, ?, ?, ?, ?, ?)`,
      [staff_id, type, start_date, end_date, days, status]
    );
    return { id: result.insertId.toString() };
  },

  async update(id, { type, start_date, end_date, days, status, approved_by }) {
    const fields = [];
    const values = [];
    if (type !== undefined) { fields.push('type = COALESCE(?, type)'); values.push(type); }
    if (start_date !== undefined) { fields.push('start_date = COALESCE(?, start_date)'); values.push(start_date); }
    if (end_date !== undefined) { fields.push('end_date = COALESCE(?, end_date)'); values.push(end_date); }
    if (days !== undefined) { fields.push('days = COALESCE(?, days)'); values.push(days); }
    if (status !== undefined) { fields.push('status = COALESCE(?, status)'); values.push(status); }
    if (approved_by !== undefined) { fields.push('approved_by = COALESCE(?, approved_by)'); values.push(approved_by); }
    if (fields.length === 0) return false;
    values.push(id);
    const [result] = await pool.query(
      `UPDATE leaves SET ${fields.join(', ')} WHERE id = ?`,
      values
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM leaves WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Leave;
