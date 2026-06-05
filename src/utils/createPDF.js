import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

export const generateStudentTranscript = (student, grades, res) => {
  const doc = new PDFDocument();
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=transcript-${student.id}.pdf`);
  doc.pipe(res);

  doc.fontSize(20).text('Student Transcript', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Name: ${student.first_name} ${student.last_name}`);
  doc.text(`Email: ${student.email}`);
  doc.text(`Enrollment Date: ${student.enrollment_date}`);
  doc.moveDown();
  doc.text('Grades:');
  grades.forEach(g => {
    doc.text(`${g.exam_name} (${g.class_name}): ${g.obtained_marks}/${g.max_marks} - ${g.grade_letter}`);
  });
  doc.end();
};