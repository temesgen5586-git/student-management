import pool from '../config/db.js';
import InvoiceItem from './InvoiceItem.js';

const Invoice = {
  async getAll({ studentId, status } = {}) {
    let query = `
      SELECT i.*, u.name as student_name, s.first_name, s.last_name
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      JOIN users u ON s.id = u.id
      WHERE 1=1
    `;
    const params = [];
    if (studentId) { query += ' AND i.student_id = ?'; params.push(studentId); }
    if (status) { query += ' AND i.status = ?'; params.push(status); }
    query += ' ORDER BY i.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT i.*, u.name as student_name, s.first_name, s.last_name
      FROM invoices i
      JOIN students s ON i.student_id = s.id
      JOIN users u ON s.id = u.id
      WHERE i.id = ?
    `, [id]);
    if (!rows[0]) return null;
    const items = await InvoiceItem.getByInvoiceId(id);
    return { ...rows[0], items };
  },

  async create({ student_id, invoice_number, issue_date, due_date, total_amount, paid_amount, status, items }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [result] = await connection.query(
        `INSERT INTO invoices (student_id, invoice_number, issue_date, due_date, total_amount, paid_amount, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [student_id, invoice_number, issue_date, due_date, total_amount, paid_amount || 0, status || 'pending']
      );
      const invoiceId = result.insertId;
      if (items && items.length) {
        for (const item of items) {
          await connection.query(
            'INSERT INTO invoice_items (invoice_id, description, amount) VALUES (?, ?, ?)',
            [invoiceId, item.description, item.amount]
          );
        }
      }
      await connection.commit();
      return { id: invoiceId };
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  },

  async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE invoices SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM invoices WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Invoice;