import pool from '../config/db.js';

const Student = {
async getAll(filters = {}) {
    let query = 'SELECT * FROM students WHERE 1=1';
    const values = [];
    if (filters.department_id) {
      query += ' AND department_id = ?';
      values.push(filters.department_id);
    }
    if (filters.batch) {
      query += ' AND batch = ?';
      values.push(filters.batch);
    }
    if (filters.search) {
      query += ' AND (firstName LIKE ? OR lastName LIKE ? OR studentId LIKE ?)';
      const term = `%${filters.search}%`;
      values.push(term, term, term);
    }
    query += ' ORDER BY lastName, firstName';
    const [rows] = await pool.query(query, values);
    return rows;
  },


  async findById(id) {
    const [rows] = await pool.query('SELECT * FROM students WHERE id = ?', [id]);
    return rows[0];
  },

  async findByEmailOrId({ email, studentId, excludeId }) {
    let query = 'SELECT * FROM students WHERE email = ? OR studentId = ?';
    const values = [email, studentId];
    if (excludeId) {
      query += ' AND id != ?';
      values.push(excludeId);
    }
    const [rows] = await pool.query(query, values);
    return rows[0];
  },

async create(data) {
    const { firstName, lastName, email, studentId, department_id, batch, dateOfBirth, createdBy } = data;

    const [result] = await pool.query(
      `INSERT INTO students 
       (firstName, lastName, email, studentId, department, dateOfBirth, createdBy) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [firstName, lastName, email, studentId, department, dateOfBirth, createdBy]
    );
    return this.findById(result.insertId);
  },

  async update(id, data) {
    // Build dynamic SET clause (only provided fields)
    const fields = [];
    const values = [];
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined && key !== 'id') {
        fields.push(`${key} = ?`);
        values.push(value);
      }
    }
    if (fields.length === 0) return this.findById(id);
    values.push(id);
    const query = `UPDATE students SET ${fields.join(', ')} WHERE id = ?`;
    await pool.query(query, values);
    return this.findById(id);
  },


  async delete(id) {
    const [result] = await pool.query('DELETE FROM students WHERE id = ?', [id]);
    return result.affectedRows > 0;
  },

  async getAcademicStatus(studentId) {
    // Example: fetch GPA, credits, and standing
    const [rows] = await pool.query(
      `SELECT 
        s.*,
        COALESCE(AVG(e.grade), 0) as gpa,
        COUNT(e.id) as coursesTaken
       FROM students s
       LEFT JOIN enrollments e ON s.id = e.student_id
       WHERE s.id = ?
       GROUP BY s.id`,
      [studentId]
    );
    const student = rows[0];
    if (!student) return null;
    return {
      ...student,
      standing: student.gpa >= 2.0 ? 'Good Standing' : 'Probation',
    };
  },

  async getTopStudents(limit = 10) {
    // Assuming a view or join with grades to compute GPA
    const [rows] = await pool.query(
      `SELECT 
        s.id, s.firstName, s.lastName, s.studentId, s.department,
        COALESCE(AVG(e.grade), 0) as gpa
       FROM students s
       LEFT JOIN enrollments e ON s.id = e.student_id
       GROUP BY s.id
       ORDER BY gpa DESC
       LIMIT ?`,
      [limit]
    );
    return rows;
  }
};

export default Student;