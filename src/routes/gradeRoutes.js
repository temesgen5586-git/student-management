import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getGrades,
  createGrade,
  updateGrade,
  deleteGrade
} from '../controllers/gradeController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('teacher', 'admin', 'student'), getGrades) // student can view own
  .post(authorize('teacher', 'admin'), createGrade);

router.route('/:id')
  .put(authorize('teacher', 'admin'), updateGrade)
  .delete(authorize('teacher', 'admin'), deleteGrade);

export default router;