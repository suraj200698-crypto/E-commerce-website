const adminMiddleware = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    if (!req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Admin access denied",
      });
    }

    next();
  } catch (error) {
    console.error("Admin Middleware Error:", error);

    return res.status(403).json({
      success: false,
      message: "Admin access denied",
    });
  }
};

export default adminMiddleware;