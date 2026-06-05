import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import * as leaveController from '../controllers/leaveController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'hr', 'hod'), leaveController.getLeaves)
  .post(authorize('admin', 'hr'), leaveController.createLeave);

router.route('/:id')
  .get(authorize('admin', 'hr'), leaveController.getLeaveById)
  .put(authorize('admin', 'hr'), leaveController.updateLeave)
  .delete(authorize('admin'), leaveController.deleteLeave);

export default router;

