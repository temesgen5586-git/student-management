import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';

import { authorize } from '../middleware/roleMiddleware.js';
import * as userController from '../controllers/userController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin'), userController.getUsers);

router.route('/:id')
  .get(authorize('admin'), userController.getUserById)
  .put(authorize('admin'), userController.updateUser)
  .delete(authorize('admin'), userController.deleteUser);

router.put('/:id/status', authorize('admin'), userController.updateUserStatus);
router.put('/:id/role', authorize('admin'), userController.updateUserRole);

export default router;