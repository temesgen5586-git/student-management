import CostSharing from '../models/CostSharing.js';
import { logAudit } from './auditController.js';

export const getCostSharings = async (req, res) => {
  try {
    const { studentId, status } = req.query;
    // Students can only see their own
    if (req.user.role === 'student' && studentId != req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const plans = await CostSharing.getAll({ studentId, status });
    res.json(plans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCostSharingById = async (req, res) => {
  try {
    const plan = await CostSharing.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Cost sharing plan not found' });
    // Students can only see their own
    if (req.user.role === 'student' && plan.student_id !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(plan);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCostSharing = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await CostSharing.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'costSharing',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCostSharing = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const updated = await CostSharing.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Cost sharing plan not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'costSharing',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Cost sharing plan updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCostSharing = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await CostSharing.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Cost sharing plan not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'costSharing',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Cost sharing plan deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};