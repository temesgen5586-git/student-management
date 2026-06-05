export const checkActive = (req, res, next) => {
  // Check if user isActive is false (account disabled)
  if (req.user.isActive === 0 || req.user.isActive === false) {
    return res.status(403).json({ message: 'Account is not active. Please contact administrator.' });
  }
  next();
};
