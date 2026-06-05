import ExcelJS from 'exceljs';

export const generateStudentListExcel = async (students, res) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Students');

  worksheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'First Name', key: 'first_name', width: 20 },
    { header: 'Last Name', key: 'last_name', width: 20 },
    { header: 'Email', key: 'email', width: 30 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Status', key: 'status', width: 10 },
  ];

  students.forEach(student => worksheet.addRow(student));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=students.xlsx');
  await workbook.xlsx.write(res);
  res.end();
};