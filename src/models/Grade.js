import pool from '../config/db.js';

const Grade = {
  async getAll({ studentId, classId } = {}) {
    let whereClause = ' WHERE 1=1';
    const params = [];

    if (studentId) {
      whereClause += ' AND g.student_id = ?';
      params.push(studentId);
    }
    if (classId) {
      whereClause += ' AND g.class_id = ?';
      params.push(classId);
    }

    const query = `
      SELECT g.*, s.first_name, s.last_name, c.name as class_name
      FROM grades g
      JOIN students s ON g.student_id = s.id
      JOIN classes c ON g.class_id = c.id
      ${whereClause}
      ORDER BY g.exam_date DESC, g.id DESC
    `;
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(
      `SELECT g.*, s.first_name, s.last_name, c.name as class_name
       FROM grades g
       JOIN students s ON g.student_id = s.id
       JOIN classes c ON g.class_id = c.id
       WHERE g.id = ?`,
      [id]
    );
    return rows[0];
  },

  async create(gradeData) {
    const { student_id, class_id, exam_name, max_marks, obtained_marks, grade_letter, exam_date } = gradeData;
    const [result] = await pool.query(
      `INSERT INTO grades (student_id, class_id, exam_name, max_marks, obtained_marks, grade_letter, exam_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [student_id, class_id, exam_name, max_marks, obtained_marks, grade_letter, exam_date || new Date()]
    );
    return { id: result.insertId };
  },

  async update(id, fields) {
    const { exam_name, max_marks, obtained_marks, grade_letter, exam_date } = fields;
    const updates = [];
    const values = [];

    if (exam_name) { updates.push('exam_name = ?'); values.push(exam_name); }
    if (max_marks !== undefined) { updates.push('max_marks = ?'); values.push(max_marks); }
    if (obtained_marks !== undefined) { updates.push('obtained_marks = ?'); values.push(obtained_marks); }
    if (grade_letter) { updates.push('grade_letter = ?'); values.push(grade_letter); }
    if (exam_date) { updates.push('exam_date = ?'); values.push(exam_date); }

    if (updates.length === 0) return false;

    const query = `UPDATE grades SET ${updates.join(', ')} WHERE id = ?`;
    values.push(id);
    const [result] = await pool.query(query, values);
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM grades WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Grade;