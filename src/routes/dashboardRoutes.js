import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import {
  getAdminDashboardStats,
  getDeanDashboardStats,
  getHodDashboardStats,
  getTeacherDashboardStats,
  getStudentDashboardStats
} from '../controllers/dashboardController.js';

const router = express.Router();

router.use(protect);

router.get('/admin', authorize('admin'), getAdminDashboardStats);
router.get('/dean', authorize('dean'), getDeanDashboardStats);
router.get('/hod', authorize('hod'), getHodDashboardStats);
router.get('/teacher', authorize('teacher'), getTeacherDashboardStats);
router.get('/student', authorize('student'), getStudentDashboardStats);

export default router;

