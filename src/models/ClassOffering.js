import pool from '../config/db.js';

const ClassOffering = {
  async getAll({ courseId, semester, academicYear, teacherId, departmentId } = {}) {
    let query = `
      SELECT co.*, c.name as course_name, c.code as course_code,
             t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM class_offerings co
      JOIN courses c ON co.course_id = c.id
      LEFT JOIN teachers t ON co.teacher_id = t.id
      WHERE 1=1
    `;
    const params = [];
    if (courseId) { query += ' AND co.course_id = ?'; params.push(courseId); }
    if (semester) { query += ' AND co.semester = ?'; params.push(semester); }
    if (academicYear) { query += ' AND co.academic_year = ?'; params.push(academicYear); }
    if (teacherId) { query += ' AND co.teacher_id = ?'; params.push(teacherId); }
    if (departmentId) { query += ' AND c.department_id = ?'; params.push(departmentId); }
    query += ' ORDER BY co.academic_year DESC, co.semester, co.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT co.*, c.name as course_name, c.code as course_code,
             t.first_name as teacher_first_name, t.last_name as teacher_last_name
      FROM class_offerings co
      JOIN courses c ON co.course_id = c.id
      LEFT JOIN teachers t ON co.teacher_id = t.id
      WHERE co.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ course_id, semester, academic_year, section, teacher_id, schedule, room }) {
    const [result] = await pool.query(
      `INSERT INTO class_offerings (course_id, semester, academic_year, section, teacher_id, schedule, room)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [course_id, semester, academic_year, section, teacher_id, schedule, room]
    );
    return { id: result.insertId };
  },

  async update(id, { course_id, semester, academic_year, section, teacher_id, schedule, room }) {
    const [result] = await pool.query(
      `UPDATE class_offerings
       SET course_id = COALESCE(?, course_id),
           semester = COALESCE(?, semester),
           academic_year = COALESCE(?, academic_year),
           section = COALESCE(?, section),
           teacher_id = COALESCE(?, teacher_id),
           schedule = COALESCE(?, schedule),
           room = COALESCE(?, room)
       WHERE id = ?`,
      [course_id, semester, academic_year, section, teacher_id, schedule, room, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM class_offerings WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default ClassOffering;