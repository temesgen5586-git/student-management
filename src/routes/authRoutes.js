import express from 'express';
import { protect} from '../middleware/authMiddleware.js';
import {  authorize } from '../middleware/roleMiddleware.js';
import { registerUser, loginUser, refreshToken, forgotPassword, resetPassword, logoutUser, getProfile } from "../controllers/authController.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/refresh', refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/profile', protect, getProfile);
router.post('/logout', protect, logoutUser);

export default router;
