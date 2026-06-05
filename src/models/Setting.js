import pool from '../config/db.js';

const Setting = {
  /**
   * Get all settings
   */
  async getAll() {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM settings ORDER BY setting_key');
    return rows;
  },

  /**
   * Get setting by key
   */
  async get(key) {
    const [rows] = await pool.query('SELECT setting_value FROM settings WHERE setting_key = ?', [key]);
    return rows.length ? rows[0].setting_value : null;
  },

  /**
   * Set or update a setting
   */
  async set(key, value) {
    const [result] = await pool.query(
      `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
      [key, value]
    );
    return result.affectedRows > 0;
  },

  /**
   * Delete a setting
   */
  async delete(key) {
    const [result] = await pool.query('DELETE FROM settings WHERE setting_key = ?', [key]);
    return result.affectedRows > 0;
  },

  /**
   * Get multiple settings as an object
   */
  async getMultiple(keys) {
    if (!keys.length) return {};
    const placeholders = keys.map(() => '?').join(',');
    const [rows] = await pool.query(
      `SELECT setting_key, setting_value FROM settings WHERE setting_key IN (${placeholders})`,
      keys
    );
    const result = {};
    rows.forEach(row => result[row.setting_key] = row.setting_value);
    return result;
  }
};

export default Setting;