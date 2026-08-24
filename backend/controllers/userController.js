import User from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendOTPEmail } from "../emailVerify/verifyEmail.js";
import admin from "../config/firebaseAdmin.js";

// ======================================================
// CREATE JWT
// ======================================================

const createToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

// ======================================================
// REGISTER USER
// ======================================================

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      name,
      email,
      password,
    } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    const fullName =
      name ||
      `${firstName || ""} ${lastName || ""}`.trim();

    if (!fullName || !normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    let user = await User.findOne({
      email: normalizedEmail,
    });

    // ==================================================
    // EXISTING UNVERIFIED USER
    // ==================================================

    if (user) {
      if (user.isVerified) {
        return res.status(400).json({
          success: false,
          message: "User already exists and is verified",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const otp = Math.floor(
        100000 + Math.random() * 900000
      ).toString();

      const otpExpiry = new Date(
        Date.now() + 10 * 60 * 1000
      );

      user.name = fullName;
      user.password = hashedPassword;
      user.otp = otp;
      user.otpExpiry = otpExpiry;

      await user.save();

      const emailResult = await sendOTPEmail(
        normalizedEmail,
        otp
      );

      if (!emailResult.success) {
        return res.status(500).json({
          success: false,
          message: "Unable to send OTP email",
          error: emailResult.error,
        });
      }

      return res.status(200).json({
        success: true,
        message: "OTP sent to your email",
        email: normalizedEmail,
      });
    }

    // ==================================================
    // NEW USER
    // ==================================================

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user = await User.create({
      name: fullName,
      email: normalizedEmail,
      password: hashedPassword,
      isVerified: false,
      otp,
      otpExpiry,
      isAdmin: false,
    });

    const emailResult = await sendOTPEmail(
      normalizedEmail,
      otp
    );

    if (!emailResult.success) {
      await User.findByIdAndDelete(user._id);

      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email",
        error: emailResult.error,
      });
    }

    return res.status(201).json({
      success: true,
      message:
        "Registration successful. OTP sent to your email.",
      email: user.email,
    });
  } catch (error) {
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// VERIFY OTP
// ======================================================

export const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    if (
      !user.otpExpiry ||
      new Date() > new Date(user.otpExpiry)
    ) {
      return res.status(400).json({
        success: false,
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    user.isVerified = true;
    user.otp = null;
    user.otpExpiry = null;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Email verified successfully. You can now login.",
    });
  } catch (error) {
    console.error("Verify OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// RESEND OTP
// ======================================================

export const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        success: false,
        message: "Email is already verified",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    const otpExpiry = new Date(
      Date.now() + 10 * 60 * 1000
    );

    user.otp = otp;
    user.otpExpiry = otpExpiry;

    await user.save();

    const emailResult = await sendOTPEmail(
      normalizedEmail,
      otp
    );

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: "Unable to send OTP email",
        error: emailResult.error,
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
      email: normalizedEmail,
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// EMAIL + PASSWORD LOGIN
// ======================================================

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (!user.isVerified) {
      return res.status(403).json({
        success: false,
        message:
          "Please verify your email with OTP before login",
        requiresVerification: true,
        email: user.email,
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordMatch = await bcrypt.compare(
      String(password),
      String(user.password)
    );

    console.log("LOGIN DEBUG:", {
      email: user.email,
      isVerified: user.isVerified,
      isAdmin: user.isAdmin,
      passwordExists: !!user.password,
      passwordMatch: isPasswordMatch,
    });

    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber || null,
        isAdmin: user.isAdmin === true,
        isVerified: user.isVerified === true,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ======================================================
// FIREBASE PHONE AUTH
// ======================================================

export const firebasePhoneAuth = async (req, res) => {
  try {
    const { idToken, name } = req.body;

    if (!idToken) {
      return res.status(400).json({
        success: false,
        message: "Firebase ID token is required",
      });
    }

    const decodedToken =
      await admin.auth().verifyIdToken(idToken);

    const firebaseUid = decodedToken.uid;
    const phoneNumber = decodedToken.phone_number;

    if (!phoneNumber) {
      return res.status(400).json({
        success: false,
        message: "Phone number not found in Firebase token",
      });
    }

    let user = await User.findOne({
      $or: [
        { firebaseUid },
        { phoneNumber },
      ],
    });

    if (!user) {
      user = await User.create({
        name: name?.trim() || "EcoShop User",
        email: null,
        password: null,
        phoneNumber,
        firebaseUid,
        isVerified: true,
        isAdmin: false,
      });
    } else {
      user.firebaseUid = firebaseUid;
      user.phoneNumber = phoneNumber;
      user.isVerified = true;

      if (
        name?.trim() &&
        (!user.name || user.name === "EcoShop User")
      ) {
        user.name = name.trim();
      }

      await user.save();
    }

    const token = createToken(user._id);

    return res.status(200).json({
      success: true,
      message: "Phone authentication successful",

      token,

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber: user.phoneNumber,
        isAdmin: user.isAdmin === true,
        isVerified: user.isVerified === true,
      },
    });
  } catch (error) {
    console.error(
      "Firebase Phone Auth Error:",
      error
    );

    return res.status(401).json({
      success: false,
      message: "Invalid or expired Firebase token",
      error: error.message,
    });
  }
};

// ======================================================
// GET PROFILE
// ======================================================

export const getProfile = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Profile fetched successfully",
      user: req.user,
    });
  } catch (error) {
    console.error("Profile Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// ======================================================
// RESET TEST ADMIN PASSWORD
// ======================================================

export const resetTestAdminPassword = async (
  req,
  res
) => {
  try {
    const { email, newPassword } = req.body;

    const normalizedEmail =
      email?.trim().toLowerCase();

    if (!normalizedEmail || !newPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Email and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const hashedPassword =
      await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.isAdmin = true;

    await user.save();

    return res.status(200).json({
      success: true,
      message:
        "Test admin password reset successfully",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    console.error(
      "Reset Password Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};