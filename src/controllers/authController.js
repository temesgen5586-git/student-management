import pool from '../config/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendEmail } from '../utils/sendEmail.js';

// @desc    Register a new user
// @route   POST /api/auth/register
export const registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  try {
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role || 'student']
    );

    // Generate token - consistent payload { id }
    const token = jwt.sign(
      { id: result.insertId },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      id: result.insertId,
      name,
      email,
      role: role || 'student',
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    // Find user
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const user = rows[0];

    // Check if user is active
    if (user.status !== 'active') {
      return res.status(403).json({ message: 'Account is not active. Please contact administrator.' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      profile_pic: user.profile_pic,
      token
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get current user profile (for token validation)
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const [rows] = await pool.query(
      'SELECT id, name, email, role, profile_pic, status FROM users WHERE id = ?',
      [userId]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(rows[0]);
  } catch (err) {
    console.error('Get profile error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Refresh token (optional)
export const refreshToken = (req, res) => {
  res.status(501).json({ message: 'Refresh token not implemented. Use login endpoint.' });
};

// @desc    Forgot password (send reset email)
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    // Check if user exists
    const [rows] = await pool.query('SELECT id, name FROM users WHERE email = ?', [email]);
    if (rows.length === 0) {
      return res.json({ message: 'If that email exists, a reset link will be sent.' });
    }

    const user = rows[0];

    // Generate reset token
    const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Delete old tokens for this email
    await pool.query('DELETE FROM reset_tokens WHERE email = ?', [email]);

    // Insert new token
    await pool.query(
      'INSERT INTO reset_tokens (email, token, expires_at) VALUES (?, ?, ?)',
      [email, token, expiresAt]
    );

    // Send email
    const resetLink = `${req.headers.origin || 'http://localhost:5173'}/reset-password?token=${token}`;
    const html = `
      <h2>Password Reset Request</h2>
      <p>Hello ${user.name},</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <a href="${resetLink}">Reset Password</a>
      <p>If you did not request this, ignore this email.</p>
    `;

    await sendEmail(email, 'Password Reset - Student Management System', html);

    res.json({ message: 'Password reset email sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Reset password using token
export const resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password required' });
    }

    // Find token
    const [rows] = await pool.query(
      'SELECT * FROM reset_tokens WHERE token = ? AND used = FALSE AND expires_at > NOW()',
      [token]
    );
    if (rows.length === 0) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const resetToken = rows[0];

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await pool.query('UPDATE users SET password = ? WHERE email = ?', [hashedPassword, resetToken.email]);

    // Mark token as used
    await pool.query('UPDATE reset_tokens SET used = TRUE WHERE id = ?', [resetToken.id]);

    res.json({ message: 'Password reset successful. Please login with new password.' });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Logout user (log audit trail)
export const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const ipAddress = req.ip || req.connection.remoteAddress || 'unknown';

    // Log audit trail
    await pool.query(
      'INSERT INTO audit_logs (user_id, action, entity, ip_address) VALUES (?, "logout", "session", ?)',
      [userId, ipAddress]
    );

    res.json({ success: true, message: 'Logged out successfully' });
  } catch (err) {
    console.error('Logout audit error:', err);
    res.status(500).json({ message: 'Server error during logout' });
  }
};


