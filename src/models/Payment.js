import pool from '../config/db.js';

const Payment = {
  async getAll({ invoiceId, studentId } = {}) {
    let query = `
      SELECT p.*, u.name as received_by_name
      FROM payments p
      LEFT JOIN users u ON p.received_by = u.id
      WHERE 1=1
    `;
    const params = [];
    if (invoiceId) { query += ' AND p.invoice_id = ?'; params.push(invoiceId); }
    if (studentId) {
      query += ' AND p.invoice_id IN (SELECT id FROM invoices WHERE student_id = ?)';
      params.push(studentId);
    }
    query += ' ORDER BY p.payment_date DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT p.*, u.name as received_by_name
       FROM payments p
       LEFT JOIN users u ON p.received_by = u.id
       WHERE p.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create({ invoice_id, amount, payment_method, reference, received_by }) {
    const [result] = await pool.query(
      'INSERT INTO payments (invoice_id, amount, payment_method, reference, received_by) VALUES (?, ?, ?, ?, ?)',
      [invoice_id, amount, payment_method, reference, received_by]
    );
    return { id: result.insertId };
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM payments WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Payment;