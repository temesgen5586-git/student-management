export const restrictToOwnDepartment = (req, res, next) => {
  if (req.user.role !== 'hod') return next();
  const requestedDept = req.params.departmentId || req.query.departmentId || req.body.department_id;
  if (requestedDept && requestedDept != req.user.department_id) {
    return res.status(403).json({ message: 'You can only access your own department' });
  }
  next();
};