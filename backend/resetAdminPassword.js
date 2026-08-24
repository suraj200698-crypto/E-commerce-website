import dotenv from "dotenv";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "./models/userModel.js";
import connectDB from "./db/cannect.js";

dotenv.config();

const resetAdminPassword = async () => {
  try {
    await connectDB();

    const hashedPassword = await bcrypt.hash("Admin@123456", 10);

    const user = await User.findOneAndUpdate(
      { email: "test@gmail.com" },
      {
        password: hashedPassword,
        isAdmin: true,
      },
      { new: true }
    );

    if (!user) {
      console.log("Admin user not found");
      process.exit(1);
    }

    console.log("Admin password reset successfully");
    console.log("Email:", user.email);
    console.log("Password: Admin@123456");
    console.log("isAdmin:", user.isAdmin);

    process.exit(0);
  } catch (error) {
    console.error("Reset Admin Password Error:", error);
    process.exit(1);
  }
};

resetAdminPassword();