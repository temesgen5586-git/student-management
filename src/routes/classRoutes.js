import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getClasses,
  getClassById,
  createClass,
  updateClass,
  deleteClass
} from '../controllers/classController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(authorize('admin', 'teacher'), getClasses)
  .post(authorize('admin'), createClass);

router.route('/:id')
  .get(authorize('admin', 'teacher', 'student'), getClassById)
  .put(authorize('admin'), updateClass)
  .delete(authorize('admin'), deleteClass);

export default router;