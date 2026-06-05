import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  deleteTeacher
} from '../controllers/teacherController.js';

const router = express.Router();

// All teacher routes require authentication
router.use(protect);

// Routes for /api/teachers
router.route('/')
  .get(authorize('admin', 'teacher'), getTeachers)   // Admin and teachers can view list
  .post(authorize('admin'), createTeacher);          // Only admin can create

// Routes for /api/teachers/:id
router.route('/:id')
  .get(authorize('admin', 'teacher'), getTeacherById)  // Admin and teachers can view a teacher
  .put(authorize('admin'), updateTeacher)              // Only admin can update
  .delete(authorize('admin'), deleteTeacher);          // Only admin can delete

export default router;