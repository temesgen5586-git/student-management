import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import * as paymentController from '../controllers/paymentController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'finance', 'student'), paymentController.getPayments)
  .post(authorize('admin', 'finance'), paymentController.recordPayment);

router.route('/:id')
  .get(authorize('admin', 'finance', 'student'), paymentController.getPaymentById)
  .delete(authorize('admin'), paymentController.deletePayment);

export default router;