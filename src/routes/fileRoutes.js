import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../middleware/uploadMiddleware.js';
import { uploadProfilePic } from '../controllers/fileController.js';

const router = express.Router();

router.post('/profile-pic', protect, upload.single('profile_pic'), uploadProfilePic);

export default router;