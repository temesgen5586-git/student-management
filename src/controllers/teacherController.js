import pool from '../config/db.js';
import bcrypt from 'bcryptjs';

// @desc    Get all teachers with pagination, search, filter
// @route   GET /api/teachers
export const getTeachers = async (req, res) => {
  try {
    let { page = 1, limit = 10, search } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);
    const offset = (page - 1) * limit;

    let query = `
      SELECT t.*, u.name, u.email, u.profile_pic
      FROM teachers t
      JOIN users u ON t.id = u.id
      WHERE 1=1
    `;
    const countQuery = `SELECT COUNT(*) as total FROM teachers t JOIN users u ON t.id = u.id WHERE 1=1`;
    const params = [];
    const countParams = [];

    if (search) {
      query += ` AND (t.first_name LIKE ? OR t.last_name LIKE ? OR u.email LIKE ?)`;
      countQuery += ` AND (t.first_name LIKE ? OR t.last_name LIKE ? OR u.email LIKE ?)`;
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
      countParams.push(searchTerm, searchTerm, searchTerm);
    }

    query += ` ORDER BY t.id DESC LIMIT ? OFFSET ?`;
    params.push(limit, offset);

    const [rows] = await pool.query(query, params);
    const [totalRows] = await pool.query(countQuery, countParams);
    const total = totalRows[0].total;

    res.json({
      teachers: rows,
      total,
      page,
      pages: Math.ceil(total / limit)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Get single teacher by ID
// @route   GET /api/teachers/:id
export const getTeacherById = async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT t.*, u.name, u.email, u.profile_pic
       FROM teachers t
       JOIN users u ON t.id = u.id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Create a teacher (must also create user)
// @route   POST /api/teachers
export const createTeacher = async (req, res) => {
  const { name, email, password, ...teacherData } = req.body;
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    // Check email
    const [existing] = await connection.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const [userResult] = await connection.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'teacher']
    );
    const userId = userResult.insertId;

    // Create teacher record
    await connection.query(
      `INSERT INTO teachers (id, first_name, last_name, phone, qualification, hire_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, teacherData.first_name || name.split(' ')[0], teacherData.last_name || name.split(' ')[1] || '',
       teacherData.phone, teacherData.qualification, teacherData.hire_date || new Date()]
    );

    await connection.commit();
    res.status(201).json({ id: userId, ...teacherData, email, name });
  } catch (err) {
    await connection.rollback();
    res.status(500).json({ message: err.message });
  } finally {
    connection.release();
  }
};

// @desc    Update a teacher
// @route   PUT /api/teachers/:id
export const updateTeacher = async (req, res) => {
  const teacherId = req.params.id;
  const { first_name, last_name, phone, qualification, hire_date } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE teachers
       SET first_name = COALESCE(?, first_name),
           last_name = COALESCE(?, last_name),
           phone = COALESCE(?, phone),
           qualification = COALESCE(?, qualification),
           hire_date = COALESCE(?, hire_date)
       WHERE id = ?`,
      [first_name, last_name, phone, qualification, hire_date, teacherId]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc    Delete a teacher (cascades to user)
// @route   DELETE /api/teachers/:id
export const deleteTeacher = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Teacher not found' });
    res.json({ message: 'Teacher deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};