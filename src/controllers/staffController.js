import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { logAudit } from './auditController.js';

export const getStaff = async (req, res) => {
  try {
    const { departmentId } = req.query;
    // If hod, restrict to their department
    let effectiveDept = departmentId;
    if (req.user.role === 'hod') {
      effectiveDept = req.user.department_id;
    }
    const staff = await Staff.getAll({ departmentId: effectiveDept });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) return res.status(404).json({ message: 'Staff record not found' });
    res.json(staff);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createStaff = async (req, res) => {
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const { id, employee_id, ...data } = req.body;
    // Check if user exists
    const user = await User.findById(id);
    if (!user) return res.status(400).json({ message: 'User does not exist' });
    const result = await Staff.create({ id, employee_id, ...data });
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'staff',
      entityId: id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateStaff = async (req, res) => {
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const updated = await Staff.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Staff record not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'staff',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Staff record updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteStaff = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Staff.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Staff record not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'staff',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Staff record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};