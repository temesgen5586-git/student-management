import pool from '../config/db.js';

export const getClasses = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
    `);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getClassById = async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT c.*, t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM classes c
      LEFT JOIN teachers t ON c.teacher_id = t.id
      WHERE c.id = ?
    `, [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ message: 'Class not found' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createClass = async (req, res) => {
  const { name, code, subject, schedule, room, teacher_id, academic_year } = req.body;
  try {
    const [result] = await pool.query(
      `INSERT INTO classes (name, code, subject, schedule, room, teacher_id, academic_year)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [name, code, subject, schedule, room, teacher_id, academic_year]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateClass = async (req, res) => {
  const { name, code, subject, schedule, room, teacher_id, academic_year } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE classes
       SET name = COALESCE(?, name),
           code = COALESCE(?, code),
           subject = COALESCE(?, subject),
           schedule = COALESCE(?, schedule),
           room = COALESCE(?, room),
           teacher_id = COALESCE(?, teacher_id),
           academic_year = COALESCE(?, academic_year)
       WHERE id = ?`,
      [name, code, subject, schedule, room, teacher_id, academic_year, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteClass = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM classes WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Class not found' });
    res.json({ message: 'Class deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};