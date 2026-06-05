import Department from '../models/Department.js';
import { logAudit } from './auditController.js';

export const getDepartments = async (req, res) => {
  try {
    const { facultyId } = req.query;
    const departments = await Department.getAll({ facultyId });
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getDepartmentById = async (req, res) => {
  try {
    const dept = await Department.findById(req.params.id);
    if (!dept) return res.status(404).json({ message: 'Department not found' });
    res.json(dept);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createDepartment = async (req, res) => {
  if (!['admin', 'dean'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await Department.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'department',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateDepartment = async (req, res) => {
  if (!['admin', 'dean'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const updated = await Department.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Department not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'department',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Department updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteDepartment = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Department.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Department not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'department',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Department deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};