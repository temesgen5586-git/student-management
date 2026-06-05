import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import * as invoiceController from '../controllers/invoiceController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'finance', 'student'), invoiceController.getInvoices)
  .post(authorize('admin', 'finance'), invoiceController.createInvoice);

router.route('/:id')
  .get(authorize('admin', 'finance', 'student'), invoiceController.getInvoiceById)
  .put(authorize('admin', 'finance'), invoiceController.updateInvoiceStatus)
  .delete(authorize('admin'), invoiceController.deleteInvoice);

export default router;