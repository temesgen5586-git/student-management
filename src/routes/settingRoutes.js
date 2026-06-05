import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import { 
  getAllSettings,
  getSetting,
  createOrUpdateSetting,
  deleteSetting
 } from '../controllers/settingController.js';

const router = express.Router();

router.use(protect, checkActive);

// Admin only for write
router.route('/')
  .get(getAllSettings)
  .post(authorize('admin'), createOrUpdateSetting);

router.route('/:key')
  .get(getSetting)
  .delete(authorize('admin'), deleteSetting)
  .put(authorize('admin'), createOrUpdateSetting);

export default router;
