const authorize = (role) => {
  return (req, res, next) => {
    // Check if user role matches the required role
    if (req.user.role !== role) {
      return res.status(403).json({
        message:
          "Access denied. You are not authorized to access this resource.",
      });
    }

    // Continue to the next middleware or route handler
    next();
  };
};

export default authorize;
