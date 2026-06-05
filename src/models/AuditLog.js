import pool from '../config/db.js';

const AuditLog = {
  /**
   * Create a new audit log entry
   */
  async create(logData) {
    const { user_id, action, entity, entity_id, ip_address } = logData;
    const [result] = await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [user_id, action, entity, entity_id, ip_address]
    );
    return { id: result.insertId };
  },

  /**
   * Get audit logs with filters and pagination
   */
  async getAll({ page = 1, limit = 50, userId, entity, action, fromDate, toDate } = {}) {
    const offset = (page - 1) * limit;
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (userId) {
      whereClause += ' AND a.user_id = ?';
      params.push(userId);
    }
    if (entity) {
      whereClause += ' AND a.entity = ?';
      params.push(entity);
    }
    if (action) {
      whereClause += ' AND a.action = ?';
      params.push(action);
    }
    if (fromDate) {
      whereClause += ' AND a.created_at >= ?';
      params.push(fromDate);
    }
    if (toDate) {
      whereClause += ' AND a.created_at <= ?';
      params.push(toDate);
    }

    const query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ${whereClause}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?
    `;
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs a ${whereClause}`;

    const [rows] = await pool.query(query, [...params, limit, offset]);
    const [totalRows] = await pool.query(countQuery, params);
    return { logs: rows, total: totalRows[0].total, page, pages: Math.ceil(totalRows[0].total / limit) };
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT a.*, u.name as user_name, u.email as user_email
       FROM audit_logs a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.id = ?`,
      [id]
    );
    return rows[0];
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM audit_logs WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async deleteOlderThan(days) {
    const [result] = await pool.query(
      'DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL ? DAY',
      [days]
    );
    return result.affectedRows;
  }
};

export default AuditLog;