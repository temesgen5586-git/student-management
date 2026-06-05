import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import { restrictToOwnDepartment } from '../middleware/departmentMiddleware.js';
import * as classOfferingController from '../controllers/classOfferingController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'dean', 'hod', 'teacher', 'student'), classOfferingController.getOfferings)
  .post(authorize('admin', 'hod'), classOfferingController.createOffering);

router.route('/:id')
  .get(authorize('admin', 'dean', 'hod', 'teacher', 'student'), classOfferingController.getOfferingById)
  .put(authorize('admin', 'hod'), classOfferingController.updateOffering)
  .delete(authorize('admin', 'hod'), classOfferingController.deleteOffering);

export default router;