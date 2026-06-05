import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import { restrictToOwnDepartment } from '../middleware/departmentMiddleware.js';
import * as courseController from '../controllers/courseController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'dean', 'hod', 'teacher', 'student'), courseController.getCourses)
  .post(authorize('admin', 'hod'), courseController.createCourse);

router.route('/:id')
  .get(authorize('admin', 'dean', 'hod', 'teacher', 'student'), courseController.getCourseById)
  .put(authorize('admin', 'hod'), courseController.updateCourse)
  .delete(authorize('admin', 'hod'), courseController.deleteCourse);

export default router;