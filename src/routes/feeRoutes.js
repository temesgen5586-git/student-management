import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import * as feeController from '../controllers/feeController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'finance', 'hod'), feeController.getFees)
  .post(authorize('admin', 'finance'), feeController.createFee);

router.route('/:id')
  .get(authorize('admin', 'finance', 'hod'), feeController.getFeeById)
  .put(authorize('admin', 'finance'), feeController.updateFee)
  .delete(authorize('admin'), feeController.deleteFee);

export default router;