import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ======================================================
// CREATE MAIL TRANSPORTER
// ======================================================

const transporter = nodemailer.createTransport({
  service: "gmail",

  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },
});

// ======================================================
// SEND OTP EMAIL
// ======================================================

export const sendOTPEmail = async (email, otp) => {
  try {
    if (!process.env.MAIL_USER || !process.env.MAIL_PASS) {
      return {
        success: false,
        error: "MAIL_USER or MAIL_PASS is missing in .env",
      };
    }

    const mailOptions = {
      from: `"EcoShop" <${process.env.MAIL_USER}>`,
      to: email,
      subject: "EcoShop - Email Verification OTP",

      html: `
        <div style="
          font-family: Arial, sans-serif;
          max-width: 600px;
          margin: auto;
          padding: 30px;
          border: 1px solid #ddd;
          border-radius: 10px;
        ">

          <h2 style="text-align: center;">
            EcoShop Email Verification
          </h2>

          <p>Hello,</p>

          <p>
            Thank you for registering with <strong>EcoShop</strong>.
            Use the OTP below to verify your email address.
          </p>

          <div style="
            text-align: center;
            margin: 30px 0;
          ">
            <span style="
              display: inline-block;
              padding: 15px 30px;
              background: #f2f2f2;
              border-radius: 8px;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
            ">
              ${otp}
            </span>
          </div>

          <p>
            This OTP is valid for <strong>10 minutes</strong>.
          </p>

          <p>
            If you did not create an EcoShop account, you can safely ignore
            this email.
          </p>

          <hr />

          <p style="font-size: 12px; color: #777;">
            This is an automated email from EcoShop. Please do not reply.
          </p>

        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    console.log("OTP email sent successfully:", info.messageId);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    console.error("OTP Email Error:", error);

    return {
      success: false,
      error: error.message,
    };
  }
};