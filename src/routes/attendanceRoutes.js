import express from 'express';
import { protect} from '../middleware/authMiddleware.js';
import {  authorize } from '../middleware/roleMiddleware.js';
import { markAttendance, getAttendance } from '../controllers/attendanceController.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('teacher', 'admin'), markAttendance)
  .get(authorize('teacher', 'admin', 'student'), getAttendance); // student can view own

export default router;