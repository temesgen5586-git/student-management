import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { notFound, errorHandler } from './middleware/errorMiddleware.js';

// Import all route modules
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import teacherRoutes from './routes/teacherRoutes.js';
import facultyRoutes from './routes/facultyRoutes.js';
import departmentRoutes from './routes/departmentRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import classOfferingRoutes from './routes/classOfferingRoutes.js';
import enrollmentRoutes from './routes/enrollmentRoutes.js';
import attendanceRoutes from './routes/attendanceRoutes.js';
import gradeRoutes from './routes/gradeRoutes.js';
import costSharingRoutes from './routes/costSharingRoutes.js';
import certificateRoutes from './routes/certificateRoutes.js';
import feeRoutes from './routes/feeRoutes.js';
import invoiceRoutes from './routes/invoiceRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import staffRoutes from './routes/staffRoutes.js';
import leaveRoutes from './routes/leaveRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import fileRoutes from './routes/fileRoutes.js';
import settingRoutes from './routes/settingRoutes.js';

dotenv.config();
const app = express();
// Security middleware
app.use(helmet());
// CORS configuration – allow frontend origin
app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000'], 
  credentials: true 
}));

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('dev'));

// Rate limiting (apply to all /api routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);
// Static folder for uploaded files
app.use('/uploads', express.static('uploads'));
// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/faculties', facultyRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/class-offerings', classOfferingRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/cost-sharing', costSharingRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit', auditRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/settings', settingRoutes);
// Health check endpoint (optional)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', message: 'Server is running' });
});
// Error handling middleware (must be last)
app.use(notFound);
app.use(errorHandler);
export default app;

