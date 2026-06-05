import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import * as costSharingController from '../controllers/costSharingController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'finance', 'student'), costSharingController.getCostSharings)
  .post(authorize('admin', 'finance'), costSharingController.createCostSharing);

router.route('/:id')
  .get(authorize('admin', 'finance', 'student'), costSharingController.getCostSharingById)
  .put(authorize('admin', 'finance'), costSharingController.updateCostSharing)
  .delete(authorize('admin'), costSharingController.deleteCostSharing);

export default router;