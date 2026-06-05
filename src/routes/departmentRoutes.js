import express from 'express';
import { protect } from '../middleware/authMiddleware.js';

import { authorize } from '../middleware/roleMiddleware.js';
import { checkActive } from '../middleware/statusMiddleware.js';
import { restrictToOwnDepartment } from '../middleware/departmentMiddleware.js';
import * as departmentController from '../controllers/departmentController.js';

const router = express.Router();

router.use(protect, checkActive);

router.route('/')
  .get(authorize('admin', 'dean', 'hod'), departmentController.getDepartments)
  .post(authorize('admin', 'dean'), departmentController.createDepartment);

router.route('/:id')
  .get(authorize('admin', 'dean', 'hod'), departmentController.getDepartmentById)
  .put(authorize('admin', 'dean'), departmentController.updateDepartment)
  .delete(authorize('admin'), departmentController.deleteDepartment);

export default router;