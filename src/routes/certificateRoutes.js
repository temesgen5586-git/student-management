import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';

import { authorize } from '../middleware/roleMiddleware.js';
import * as certificateController from '../controllers/certificateController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'registrar', 'student'), certificateController.getCertificates)
  .post(authorize('admin', 'registrar'), certificateController.issueCertificate);

router.route('/:id')
  .get(authorize('admin', 'registrar', 'student'), certificateController.getCertificateById)
  .delete(authorize('admin'), certificateController.revokeCertificate);

export default router;