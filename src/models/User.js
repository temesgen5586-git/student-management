import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

const User = {
  async findByEmail(email) {
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await pool.query(
      'SELECT id, name, email, role, profile_pic, status, createdAt FROM users WHERE id = ?',
      [id]
    );
    return rows[0];
  },

  async create({ name, email, password, role }) {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashed, role || 'student']
    );
    return result.insertId;
  },

  async update(id, fields) {
    const { name, email, password, role, profile_pic, status } = fields;
    const updates = [];
    const values = [];
    if (name) { updates.push('name = ?'); values.push(name); }
    if (email) { updates.push('email = ?'); values.push(email); }
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      updates.push('password = ?');
      values.push(hashed);
    }
    if (role) { updates.push('role = ?'); values.push(role); }
    if (profile_pic !== undefined) { updates.push('profile_pic = ?'); values.push(profile_pic); }
    if (status) { updates.push('status = ?'); values.push(status); }
    if (updates.length === 0) return false;
    const query = `UPDATE users SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getAll({ role, status } = {}) {
    let query = 'SELECT id, name, email, role, status, createdAt FROM users WHERE 1=1';
    const params = [];
    if (role) { query += ' AND role = ?'; params.push(role); }
    if (status) { query += ' AND status = ?'; params.push(status); }
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async updateStatus(id, status) {
    const [result] = await pool.query('UPDATE users SET status = ? WHERE id = ?', [status, id]);
    return result.affectedRows > 0;
  },

  async updateRole(id, role) {
    const [result] = await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, id]);
    return result.affectedRows > 0;
  },

  async comparePassword(plain, hashed) {
    return bcrypt.compare(plain, hashed);
  }
};

export default User;
