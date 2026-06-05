import ClassOffering from '../models/ClassOffering.js';
import Course from '../models/Course.js';
import { logAudit } from './auditController.js';

export const getOfferings = async (req, res) => {
  try {
    const { courseId, semester, academicYear, teacherId, departmentId } = req.query;
    // If user is hod, restrict to their department
    let effectiveDept = departmentId;
    if (req.user.role === 'hod') {
      effectiveDept = req.user.department_id;
    }
    const offerings = await ClassOffering.getAll({
      courseId,
      semester,
      academicYear,
      teacherId,
      departmentId: effectiveDept
    });
    res.json(offerings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getOfferingById = async (req, res) => {
  try {
    const offering = await ClassOffering.findById(req.params.id);
    if (!offering) return res.status(404).json({ message: 'Offering not found' });
    // If hod, ensure the associated course is in their department
    if (req.user.role === 'hod') {
      const course = await Course.findById(offering.course_id);
      if (course.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
    }
    res.json(offering);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createOffering = async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    // If hod, ensure the course belongs to their department
    if (req.user.role === 'hod') {
      const course = await Course.findById(req.body.course_id);
      if (!course || course.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'You can only create offerings for courses in your department' });
      }
    }
    const result = await ClassOffering.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'classOffering',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateOffering = async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const existing = await ClassOffering.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Offering not found' });
    // If hod, ensure the course is in their department
    if (req.user.role === 'hod') {
      const course = await Course.findById(existing.course_id);
      if (course.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'You can only update offerings in your department' });
      }
      // Also if they change course_id, check new course is also in their department
      if (req.body.course_id) {
        const newCourse = await Course.findById(req.body.course_id);
        if (!newCourse || newCourse.department_id !== req.user.department_id) {
          return res.status(403).json({ message: 'Cannot assign offering to a course outside your department' });
        }
      }
    }
    const updated = await ClassOffering.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Offering not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'classOffering',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Offering updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteOffering = async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const existing = await ClassOffering.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Offering not found' });
    // If hod, ensure the course is in their department
    if (req.user.role === 'hod') {
      const course = await Course.findById(existing.course_id);
      if (course.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'You can only delete offerings in your department' });
      }
    }
    const deleted = await ClassOffering.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Offering not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'classOffering',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Offering deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};