import jwt from "jsonwebtoken";
import User from "../models/userModel.js";

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Token check
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.substring(7).trim();

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token missing",
      });
    }

    // Verify JWT
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    console.log("AUTH DECODED:", decoded);

    // IMPORTANT:
    // Login token me userId save ho raha hai
    const userId = decoded.userId || decoded.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Invalid token: user ID missing",
      });
    }

    // Find user from MongoDB
    const user = await User.findById(userId).select(
      "-password -otp -otpExpiry"
    );

    if (!user) {
      console.log("AUTH USER NOT FOUND:", userId);

      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    console.log("AUTH USER:", {
      id: user._id,
      email: user.email,
      isAdmin: user.isAdmin,
    });

    // User request ke andar save
    req.user = user;

    next();

  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);

    return res.status(401).json({
      success: false,
      message:
        error.name === "TokenExpiredError"
          ? "Token expired. Please login again."
          : "Invalid or expired token",
    });
  }
};

export default authMiddleware;