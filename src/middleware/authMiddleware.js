import jwt from 'jsonwebtoken';
import pool from '../config/db.js';

export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1]?.trim();

  if (!authHeader || !token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  if (!authHeader.toLowerCase().startsWith('bearer ')) {
    return res.status(401).json({ message: 'Not authorized, invalid token format' });
  }

  if (!process.env.JWT_SECRET) {
    console.error('Auth middleware: JWT_SECRET environment variable not set');
    return res.status(500).json({ message: 'Server configuration error - missing JWT_SECRET' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from DB - include status and department_id
    const [rows] = await pool.query(
      'SELECT id, name, email, role, profile_pic, isActive, department_id FROM users WHERE id = ?',
      [decoded.id]
    );
    
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Not authorized, user not found' });
    }
    
    req.user = rows[0];
    next();
  } catch (error) {
    console.error('Auth middleware JWT Error:', error.name, error.message, 'Token preview:', token.substring(0, 20) + '...');
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Not authorized, invalid token' });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Not authorized, token expired. Please login again' });
    }
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};
