import pool from '../config/db.js';

/**
 * Create an audit log entry
 * @param {Object} data - { userId, action, entity, entityId, ipAddress }
 * @returns {Promise<void>}
 */
export const logAudit = async ({ userId, action, entity, entityId, ipAddress }) => {
  try {
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, entity_id, ip_address) VALUES (?, ?, ?, ?, ?)',
      [userId, action, entity, entityId, ipAddress]
    );
  } catch (err) {
    console.error('Failed to log audit:', err);
  }
};

// @desc    Get audit logs with filtering and pagination
// @route   GET /api/audit
// @access  Admin only
export const getAuditLogs = async (req, res) => {
  try {
    let { page = 1, limit = 20, userId, entity, action, fromDate, toDate } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = `
      SELECT a.*, u.name as user_name, u.email as user_email
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      WHERE 1=1
    `;
    const countQuery = `SELECT COUNT(*) as total FROM audit_logs a WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (userId) {
      query += ' AND a.user_id = ?';
      countQuery += ' AND user_id = ?';
      params.push(userId);
      countParams.push(userId);
    }
    if (entity) {
      query += ' AND a.entity = ?';
      countQuery += ' AND entity = ?';
      params.push(entity);
      countParams.push(entity);
    }
    if (action) {
      query += ' AND a.action = ?';
      countQuery += ' AND action = ?';
      params.push(action);
      countParams.push(action);
    }
    if (fromDate) {
      query += ' AND a.created_at >= ?';
      countQuery += ' AND created_at >= ?';
      params.push(fromDate);
      countParams.push(fromDate);
    }
    if (toDate) {
      query += ' AND a.created_at <= ?';
      countQuery += ' AND created_at <= ?';
      params.push(toDate);
      countParams.push(toDate);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [totalRows] = await pool.query(countQuery, countParams);
    const total = totalRows[0].total;

    res.json({
      logs: rows,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
