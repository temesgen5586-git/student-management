import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import * as staffController from '../controllers/staffController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'hr', 'hod'), staffController.getStaff)
  .post(authorize('admin', 'hr'), staffController.createStaff);

router.route('/:id')
  .get(authorize('admin', 'hr', 'hod'), staffController.getStaffById)
  .put(authorize('admin', 'hr'), staffController.updateStaff)
  .delete(authorize('admin'), staffController.deleteStaff);

export default router;
