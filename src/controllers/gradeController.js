import pool from '../config/db.js';
import { validateGrade } from '../utils/academicUtils.js';

export const getGrades = async (req, res) => {
  try {
    const { student_id, class_id } = req.query;
    let query = `
      SELECT g.*, s.first_name, s.last_name, c.name as class_name
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN classes c ON g.class_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (student_id) {
      query += ' AND g.student_id = ?';
      params.push(student_id);
    }
    if (class_id) {
      query += ' AND g.class_id = ?';
      params.push(class_id);
    }
    const [rows] = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createGrade = async (req, res) => {
const { student_id, class_id, exam_name, max_marks, obtained_marks, grade_letter, exam_date } = req.body;
  if (grade_letter && !validateGrade(grade_letter)) {
    return res.status(400).json({ message: 'Invalid grade. Use: A+, A, A-, B+, B, B-, C+, C, C-, D, F' });
  }
  if (obtained_marks && max_marks && obtained_marks > max_marks) {
    return res.status(400).json({ message: 'Obtained marks cannot exceed max marks' });
  }
  try {
    const [result] = await pool.query(
      `INSERT INTO grades (student_id, class_id, exam_name, max_marks, obtained_marks, grade_letter, exam_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, class_id, exam_name, max_marks, obtained_marks, grade_letter, exam_date]
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateGrade = async (req, res) => {
  const { exam_name, max_marks, obtained_marks, grade_letter, exam_date } = req.body;
  try {
    const [result] = await pool.query(
      `UPDATE grades
       SET exam_name = COALESCE(?, exam_name),
           max_marks = COALESCE(?, max_marks),
           obtained_marks = COALESCE(?, obtained_marks),
           grade_letter = COALESCE(?, grade_letter),
           exam_date = COALESCE(?, exam_date)
       WHERE id = ?`,
      [exam_name, max_marks, obtained_marks, grade_letter, exam_date, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Grade not found' });
    res.json({ message: 'Grade updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteGrade = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM grades WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Grade not found' });
    res.json({ message: 'Grade deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};