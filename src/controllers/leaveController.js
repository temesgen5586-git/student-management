import Leave from '../models/Leave.js';
import Staff from '../models/Staff.js';
import User from '../models/User.js';
import { logAudit } from './auditController.js';

export const getLeaves = async (req, res) => {
  try {
    const { staffId, status } = req.query;
    const leaves = await Leave.getAll({ staffId, status });
    res.json(leaves);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave record not found' });
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createLeave = async (req, res) => {
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const { staff_id, type, start_date, end_date, days } = req.body;
    // Check if staff exists
    const staff = await Staff.findById(staff_id);
    if (!staff) return res.status(400).json({ message: 'Staff not found' });
    const result = await Leave.create({ staff_id, type, start_date, end_date, days });
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'leave',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateLeave = async (req, res) => {
  if (!['admin', 'hr'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const updated = await Leave.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Leave record not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'leave',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Leave record updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteLeave = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Leave.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Leave record not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'leave',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Leave record deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

