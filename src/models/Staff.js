import pool from '../config/db.js';

const Staff = {
  async getAll({ departmentId } = {}) {
    let query = `
      SELECT s.*, u.name, u.email, u.role, d.name as department_name, supervisor.name as supervisor_name
      FROM staff s
      JOIN users u ON s.id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN users supervisor ON s.supervisor_id = supervisor.id
      WHERE 1=1
    `;
    const params = [];
    if (departmentId) { query += ' AND s.department_id = ?'; params.push(departmentId); }
    query += ' ORDER BY s.id DESC';
    const [rows] = await pool.query(query, params);
    return rows;
  },

  async findById(id) {
    const [rows] = await pool.query(`
      SELECT s.*, u.name, u.email, u.role, d.name as department_name, supervisor.name as supervisor_name
      FROM staff s
      JOIN users u ON s.id = u.id
      LEFT JOIN departments d ON s.department_id = d.id
      LEFT JOIN users supervisor ON s.supervisor_id = supervisor.id
      WHERE s.id = ?
    `, [id]);
    return rows[0];
  },

  async create({ id, employee_id, position, salary, hire_date, contract_type, department_id, supervisor_id }) {
    const [result] = await pool.query(
      `INSERT INTO staff (id, employee_id, position, salary, hire_date, contract_type, department_id, supervisor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, employee_id, position, salary, hire_date, contract_type, department_id, supervisor_id]
    );
    return { id };
  },

  async update(id, { employee_id, position, salary, hire_date, contract_type, department_id, supervisor_id }) {
    const [result] = await pool.query(
      `UPDATE staff
       SET employee_id = COALESCE(?, employee_id),
           position = COALESCE(?, position),
           salary = COALESCE(?, salary),
           hire_date = COALESCE(?, hire_date),
           contract_type = COALESCE(?, contract_type),
           department_id = COALESCE(?, department_id),
           supervisor_id = COALESCE(?, supervisor_id)
       WHERE id = ?`,
      [employee_id, position, salary, hire_date, contract_type, department_id, supervisor_id, id]
    );
    return result.affectedRows > 0;
  },

  async delete(id) {
    const [result] = await pool.query('DELETE FROM staff WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
};

export default Staff;