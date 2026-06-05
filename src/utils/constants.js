export const ROLES = {
  ADMIN: 'admin',
  DEAN: 'dean',
  HOD: 'hod',
  TEACHER: 'teacher',
  STUDENT: 'student',
  REGISTRAR: 'registrar',
  FINANCE: 'finance',
  HR: 'hr'
};

export const GRADE_OPTIONS = [
  'A+', 'A', 'A-',
  'B+', 'B', 'B-',
  'C+', 'C', 'C-',
  'D', 'F'
];

export const GPA_MAP = {
  'A+': 4.0,
  'A': 4.0,
  'A-': 3.7,
  'B+': 3.3,
  'B': 3.0,
  'B-': 2.7,
  'C+': 2.3,
  'C': 2.0,
  'C-': 1.7,
  'D': 1.0,
  'F': 0.0
};

export const GRADE_PERCENTAGE_RANGES = [
  { grade: 'A+', min: 90 },
  { grade: 'A', min: 85 },
  { grade: 'A-', min: 80 },
  { grade: 'B+', min: 77 },
  { grade: 'B', min: 74 },
  { grade: 'B-', min: 70 },
  { grade: 'C+', min: 67 },
  { grade: 'C', min: 64 },
  { grade: 'C-', min: 60 },
  { grade: 'D', min: 50 },
  { grade: 'F', min: 0 }
];

export const ATTENDANCE_STATUS = ['present', 'absent', 'late', 'excused'];
export const ENROLLMENT_STATUS = ['enrolled', 'dropped', 'completed'];
export const STUDENT_STATUS = ['active', 'inactive', 'graduated', 'suspended'];

export const LEAVE_TYPES = ['annual', 'sick', 'maternity', 'paternity', 'bereavement', 'other'];
