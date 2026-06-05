import pool from '../config/db.js';

const InvoiceItem = {
  async getByInvoiceId(invoiceId) {
    const [rows] = await pool.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
    return rows;
  },

  async create({ invoice_id, description, amount }) {
    const [result] = await pool.query(
      'INSERT INTO invoice_items (invoice_id, description, amount) VALUES (?, ?, ?)',
      [invoice_id, description, amount]
    );
    return { id: result.insertId };
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM invoice_items WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async deleteByInvoiceId(invoiceId) {
    const [result] = await pool.query('DELETE FROM invoice_items WHERE invoice_id = ?', [invoiceId]);
    return result.affectedRows;
  }
};

export default InvoiceItem;