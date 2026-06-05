import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getEnrollments,
  createEnrollment,
  updateEnrollment,
  deleteEnrollment
} from '../controllers/enrollmentController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getEnrollments)
  .post(authorize('admin'), createEnrollment);

router.route('/:id')
  .put(authorize('admin'), updateEnrollment)
  .delete(authorize('admin'), deleteEnrollment);

export default router;