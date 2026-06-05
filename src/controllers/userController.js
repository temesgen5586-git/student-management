import User from '../models/User.js';
import { logAudit } from './auditController.js';

export const getUsers = async (req, res) => {
  try {
    const { role, departmentId, status } = req.query;
    const users = await User.getAll({ role, departmentId, status });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const updated = await User.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    await logAudit({ userId: req.user.id, action: 'UPDATE', entity: 'user', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'User updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const deleted = await User.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'User not found' });
    await logAudit({ userId: req.user.id, action: 'DELETE', entity: 'user', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserStatus = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { status } = req.body;
  if (!['active', 'inactive', 'suspended'].includes(status)) {
    return res.status(400).json({ message: 'Invalid status' });
  }
  try {
    const updated = await User.updateStatus(req.params.id, status);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    await logAudit({ userId: req.user.id, action: 'UPDATE_STATUS', entity: 'user', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'User status updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateUserRole = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  const { role } = req.body;
  const validRoles = ['admin', 'teacher', 'student', 'hod', 'dean', 'finance', 'hr', 'registrar', 'cost_sharing_officer'];
  if (!validRoles.includes(role)) return res.status(400).json({ message: 'Invalid role' });
  try {
    const updated = await User.updateRole(req.params.id, role);
    if (!updated) return res.status(404).json({ message: 'User not found' });
    await logAudit({ userId: req.user.id, action: 'UPDATE_ROLE', entity: 'user', entityId: req.params.id, ipAddress: req.ip });
    res.json({ message: 'User role updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};