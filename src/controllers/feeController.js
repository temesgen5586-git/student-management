import Fee from '../models/Fee.js';
import { logAudit } from './auditController.js';

export const getFees = async (req, res) => {
  try {
    const { departmentId, academicYear } = req.query;
    // If hod, restrict to their department
    let effectiveDept = departmentId;
    if (req.user.role === 'hod') {
      effectiveDept = req.user.department_id;
    }
    const fees = await Fee.getAll({ departmentId: effectiveDept, academicYear });
    res.json(fees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFeeById = async (req, res) => {
  try {
    const fee = await Fee.findById(req.params.id);
    if (!fee) return res.status(404).json({ message: 'Fee not found' });
    res.json(fee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFee = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await Fee.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'fee',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFee = async (req, res) => {
  if (!['admin', 'finance'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const updated = await Fee.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Fee not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'fee',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Fee updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFee = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Fee.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Fee not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'fee',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Fee deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};