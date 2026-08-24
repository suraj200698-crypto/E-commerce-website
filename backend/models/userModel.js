import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    // ======================================================
    // USER NAME
    // ======================================================

    name: {
      type: String,
      required: true,
      trim: true,
    },

    // ======================================================
    // EMAIL
    // Email users ke liye required
    // Phone users ke liye optional
    // ======================================================

    email: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      default: null,
    },

    // ======================================================
    // PASSWORD
    // Email/password users ke liye available
    // Firebase phone users ke liye null
    // ======================================================

    password: {
      type: String,
      minlength: 6,
      default: null,
    },

    // ======================================================
    // PHONE NUMBER
    // Firebase phone authentication ke liye
    // ======================================================

    phoneNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    // ======================================================
    // FIREBASE UID
    // Firebase Authentication user ka unique ID
    // ======================================================

    firebaseUid: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      default: null,
    },

    // ======================================================
    // ADMIN
    // ======================================================

    isAdmin: {
      type: Boolean,
      default: false,
    },

    // ======================================================
    // VERIFICATION
    // Email OTP ya Firebase phone verification
    // successful hone ke baad true
    // ======================================================

    isVerified: {
      type: Boolean,
      default: false,
    },

    // ======================================================
    // EMAIL OTP
    // ======================================================

    otp: {
      type: String,
      default: null,
    },

    // ======================================================
    // OTP EXPIRY
    // ======================================================

    otpExpiry: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ======================================================
// MODEL
// ======================================================

const User = mongoose.model("User", userSchema);

export default User;