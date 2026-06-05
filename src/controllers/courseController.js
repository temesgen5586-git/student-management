import Course from '../models/Course.js';
import { logAudit } from './auditController.js';

export const getCourses = async (req, res) => {
  try {
    const { departmentId, search } = req.query;
    // If user is hod, restrict to their department
    let effectiveDept = departmentId;
    if (req.user.role === 'hod') {
      effectiveDept = req.user.department_id;
    }
    const courses = await Course.getAll({ departmentId: effectiveDept, search });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    // If hod, ensure course belongs to their department
    if (req.user.role === 'hod' && course.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createCourse = async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  // If hod, force department_id to their own
  if (req.user.role === 'hod') {
    req.body.department_id = req.user.department_id;
  }
  try {
    const result = await Course.create(req.body);
    await logAudit({
      userId: req.user.id,
      action: 'CREATE',
      entity: 'course',
      entityId: result.id,
      ipAddress: req.ip
    });
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateCourse = async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const existing = await Course.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Course not found' });
    // If hod, ensure they are updating a course in their department and not changing department
    if (req.user.role === 'hod') {
      if (existing.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'You can only update courses in your department' });
      }
      if (req.body.department_id && req.body.department_id !== req.user.department_id) {
        return res.status(403).json({ message: 'Cannot move course to another department' });
      }
    }
    const updated = await Course.update(req.params.id, req.body);
    if (!updated) return res.status(404).json({ message: 'Course not found' });
    await logAudit({
      userId: req.user.id,
      action: 'UPDATE',
      entity: 'course',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Course updated' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteCourse = async (req, res) => {
  if (!['admin', 'hod'].includes(req.user.role)) {
    return res.status(403).json({ message: 'Forbidden' });
  }
  try {
    const existing = await Course.findById(req.params.id);
    if (!existing) return res.status(404).json({ message: 'Course not found' });
    // If hod, ensure course is in their department
    if (req.user.role === 'hod' && existing.department_id !== req.user.department_id) {
      return res.status(403).json({ message: 'You can only delete courses in your department' });
    }
    const deleted = await Course.delete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Course not found' });
    await logAudit({
      userId: req.user.id,
      action: 'DELETE',
      entity: 'course',
      entityId: req.params.id,
      ipAddress: req.ip
    });
    res.json({ message: 'Course deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};