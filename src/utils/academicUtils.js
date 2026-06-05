import { GPA_MAP, GRADE_PERCENTAGE_RANGES, GRADE_OPTIONS } from './constants.js';

export const validateGrade = (grade) => {
  return GRADE_OPTIONS.includes(grade);
};

export const calculateGradeFromPercentage = (percentage) => {
  for (const range of GRADE_PERCENTAGE_RANGES) {
    if (percentage >= range.min) {
      return range.grade;
    }
  }
  return 'F';
};

export const calculateGPA = async (studentId, pool) => {
  const [rows] = await pool.query(
    `SELECT g.grade_letter, g.obtained_marks, g.max_marks, c.credits
     FROM grades g
     JOIN classes cl ON g.class_id = cl.id
     JOIN courses c ON cl.course_id = c.id
     WHERE g.student_id = ? AND g.grade_letter IS NOT NULL`,
    [studentId]
  );
  if (!rows.length) return 0;
  let totalPoints = 0, totalCredits = 0;
  for (const row of rows) {
    const gradePoint = GPA_MAP[row.grade_letter] || 0;
    totalPoints += gradePoint * row.credits;
    totalCredits += row.credits;
  }
  return totalCredits ? (totalPoints / totalCredits).toFixed(2) : 0;
};

export const calculateTranscriptGPA = async (studentId, pool) => {
  const gpa = await calculateGPA(studentId, pool);
  return {
    gpa: parseFloat(gpa),
    grade: calculateGradeFromPercentage(parseFloat(gpa) * 25), // Scale GPA to %
    status: gpa >= 2.0 ? 'Good Standing' : gpa >= 1.0 ? 'Probation' : 'Dismissal'
  };
};
