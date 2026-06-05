// models/index.js (defensive version – same exports)
import User from './User.js';
import Student from './Student.js';
import Teacher from './Teacher.js';
import Faculty from './Faculty.js';
import Department from './Department.js';
import Course from './Course.js';
import ClassOffering from './ClassOffering.js';
import Enrollment from './Enrollment.js';
import Attendance from './Attendance.js';
import Grade from './Grade.js';
import CostSharing from './CostSharing.js';
import Certificate from './Certificate.js';
import Fee from './Fee.js';
import Invoice from './Invoice.js';
import InvoiceItem from './InvoiceItem.js';
import Payment from './Payment.js';
import Staff from './Staff.js';
import AuditLog from './AuditLog.js';
import Setting from './Setting.js';
import Leave from './Leave.js';

const models = {
  User, Student, Teacher, Faculty, Department, Course,
  ClassOffering, Enrollment, Attendance, Grade, CostSharing,
  Certificate, Fee, Invoice, InvoiceItem, Payment, Staff,
  AuditLog, Leave, Setting
};

// Optional: log missing models (for debugging)
Object.entries(models).forEach(([name, mdl]) => {
  if (!mdl) console.warn(`⚠️ Model "${name}" failed to load`);
});

export default models;
export {
  User, Student, Teacher, Faculty, Department, Course,
  ClassOffering, Enrollment, Attendance, Grade, CostSharing,
  Certificate, Fee, Invoice, InvoiceItem, Payment, Staff,
  AuditLog, Leave, Setting
};