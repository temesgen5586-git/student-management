import pool from '../config/db.js';

const Faculty = {
  async getAll() {
    const [rows] = await pool.query(`
      SELECT f.*, u.name as dean_name
      FROM faculties f
      LEFT JOIN users u ON f.dean_id = u.id
      ORDER BY f.id DESC
    `);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT f.*, u.name as dean_name
      FROM faculties f
      LEFT JOIN users u ON f.dean_id = u.id
      WHERE f.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ name, code, dean_id }) {
    const [result] = await pool.query(
      'INSERT INTO faculties (name, code, dean_id) VALUES (?, ?, ?)',
      [name, code, dean_id]
    );
    return { id: result.insertId };
  },

  async update(id, { name, code, dean_id }) {
    const [result] = await pool.query(
      `UPDATE faculties
       SET name = COALESCE(?, name),
           code = COALESCE(?, code),
           dean_id = COALESCE(?, dean_id)
       WHERE id = ?`,
      [name, code, dean_id, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM faculties WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Faculty;