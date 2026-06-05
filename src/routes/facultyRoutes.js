import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import * as facultyController from '../controllers/facultyController.js';

const router = express.Router();

// All routes require authentication and active status
router.use(protect, checkActive);

// Routes for /api/faculties
router.route('/')
  .get(authorize('admin', 'dean', 'hod'), facultyController.getFaculties)
  .post(authorize('admin', 'dean'), facultyController.createFaculty);

router.route('/:id')
  .get(authorize('admin', 'dean', 'hod'), facultyController.getFacultyById)
  .put(authorize('admin', 'dean'), facultyController.updateFaculty)
  .delete(authorize('admin'), facultyController.deleteFaculty);

export default router;