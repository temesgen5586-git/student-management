import pool from '../config/db.js';

const Certificate = {
  async getAll({ studentId, type } = {}) {
    let query = `
      SELECT c.*, u.name as student_name, s.first_name, s.last_name, issuer.name as issued_by_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.id = u.id
      LEFT JOIN users issuer ON c.issued_by = issuer.id
      WHERE 1=1
    `;
    const params = [];
    if (studentId) { query += ' AND c.student_id = ?'; params.push(studentId); }
    if (type) { query += ' AND c.certificate_type = ?'; params.push(type); }
    query += ' ORDER BY c.issue_date DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT c.*, u.name as student_name, s.first_name, s.last_name, issuer.name as issued_by_name
      FROM certificates c
      JOIN students s ON c.student_id = s.id
      JOIN users u ON s.id = u.id
      LEFT JOIN users issuer ON c.issued_by = issuer.id
      WHERE c.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ student_id, certificate_type, issue_date, certificate_number, file_path, issued_by }) {
    const [result] = await pool.query(
      `INSERT INTO certificates (student_id, certificate_type, issue_date, certificate_number, file_path, issued_by)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [student_id, certificate_type, issue_date, certificate_number, file_path, issued_by]
    );
    return { id: result.insertId };
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM certificates WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Certificate;