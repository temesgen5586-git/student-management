import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

import { getAuditLogs } from '../controllers/auditController.js';

const router = express.Router();

// All audit routes require authentication and admin role
router.use(protect, authorize('admin'));

router.get('/', getAuditLogs);

export default router;