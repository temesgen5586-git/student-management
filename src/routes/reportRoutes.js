import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { getStudentTranscript, exportStudentsExcel } from '../controllers/reportController.js';

const router = express.Router();

router.use(protect);

router.get('/transcript/:studentId', authorize('admin', 'teacher', 'student'), getStudentTranscript);
router.get('/students-excel', authorize('admin'), exportStudentsExcel);

export default router;