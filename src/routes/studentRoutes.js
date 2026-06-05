import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { restrictToOwnDepartment } from '../middleware/departmentMiddleware.js';
// ✅ Correct import for named exports
import * as studentController from '../controllers/studentController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'dean', 'hod', 'teacher'), restrictToOwnDepartment, studentController.getStudents)
  .post(authorize('admin', 'registrar'), studentController.createStudent);

router.route('/:id')
  .get(authorize('admin', 'dean', 'hod', 'teacher', 'student'), studentController.getStudentById)
  .put(authorize('admin', 'registrar'), studentController.updateStudent)
  .delete(authorize('admin'), studentController.deleteStudent);

router.get('/:id/academic-status', authorize('admin', 'hod', 'teacher', 'student'), studentController.getAcademicStatus);
router.get('/top/students', authorize('admin', 'dean', 'hod'), studentController.getTopStudents);

export default router;