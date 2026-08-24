import express from "express";

import {
  registerUser,
  loginUser,
  getProfile,
  verifyOTP,
  resendOTP,
  resetTestAdminPassword,
} from "../controllers/userController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= REGISTER =================

router.post("/register", registerUser);

// ================= VERIFY OTP =================

router.post("/verify-otp", verifyOTP);

// ================= RESEND OTP =================

router.post("/resend-otp", resendOTP);

// ================= LOGIN =================

router.post("/login", loginUser);

// ================= RESET PASSWORD =================

router.put(
  "/reset-test-password",
  resetTestAdminPassword
);

// ================= PROFILE =================

router.get(
  "/profile",
  authMiddleware,
  getProfile
);

export default router;