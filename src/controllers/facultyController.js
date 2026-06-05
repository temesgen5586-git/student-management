import Faculty from '../models/Faculty.js';
import { logAudit } from './auditController.js';

export const getFaculties = async (req, res) => {
  try {
    const faculties = await Faculty.getAll();
    res.json(faculties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getFacultyById = async (req, res) => {
  try {
    const faculty = await Faculty.findById(req.params.id);
    if (!faculty) return res.status(404).json({ message: 'Faculty not found' });
    res.json(faculty);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createFaculty = async (req, res) => {
  if (!['admin', 'dean'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const result = await Faculty.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'faculty',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateFaculty = async (req, res) => {
  if (!['admin', 'dean'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const updated = await Faculty.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Faculty not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'faculty',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Faculty updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteFaculty = async (req, res) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
  try {
    const deleted = await Faculty.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Faculty not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'faculty',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Faculty deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};