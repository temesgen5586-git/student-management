import pool from '../config/db.js';
import path from 'path';
import fs from 'fs';

// @desc    Upload profile picture
// @route   POST /api/files/profile-pic
export const uploadProfilePic = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  const userId = req.user.id;
  const filePath = `/uploads/${req.file.filename}`;
  try {
    // If old pic exists, delete it
    const [rows] = await pool.query('SELECT profile_pic FROM users WHERE id = ?', [userId]);
    if (rows.length > 0 && rows[0].profile_pic) {
      const oldPath = path.join('uploads', path.basename(rows[0].profile_pic));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    await pool.query('UPDATE users SET profile_pic = ? WHERE id = ?', [filePath, userId]);
    res.json({ profile_pic: filePath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};