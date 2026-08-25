import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

// ======================================================
// LIVE BACKEND URL
// ======================================================

const API_URL = "https://e-commerce-website-i3qw.onrender.com";

const VerifyOTP = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // ======================================================
  // VERIFY OTP
  // ======================================================

  const handleVerifyOTP = async (e) => {
    e.preventDefault();

    if (!email) {
      alert("Email information is missing. Please signup again.");
      navigate("/signup");
      return;
    }

    if (otp.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/users/verify-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
            otp,
          }),
        }
      );

      const data = await response.json();

      console.log("VERIFY OTP STATUS:", response.status);
      console.log("VERIFY OTP RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "OTP verification failed.");
        return;
      }

      alert("🎉 Email verified successfully! You can now login.");

      navigate("/login");
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);

      alert(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // RESEND OTP
  // ======================================================

  const handleResendOTP = async () => {
    if (!email) {
      alert("Email information is missing.");
      navigate("/signup");
      return;
    }

    setResending(true);

    try {
      const response = await fetch(
        `${API_URL}/api/users/resend-otp`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email,
          }),
        }
      );

      const data = await response.json();

      console.log("RESEND OTP STATUS:", response.status);
      console.log("RESEND OTP RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to resend OTP.");
        return;
      }

      alert("📧 New OTP has been sent to your email.");
    } catch (error) {
      console.error("RESEND OTP ERROR:", error);

      alert(
        "Unable to connect to server. Please try again."
      );
    } finally {
      setResending(false);
    }
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">

        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-8">

          <div className="w-14 h-14 mx-auto bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            E
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Verify Your Email
          </h1>

          <p className="text-gray-500 mt-2">
            Enter the OTP sent to your email
          </p>

        </div>

        {/* ==================================================
            EMAIL
        ================================================== */}

        <div className="bg-blue-50 rounded-xl p-4 mb-6 text-center">

          <p className="text-sm text-gray-500">
            OTP sent to
          </p>

          <p className="font-semibold text-blue-600 break-all">
            {email || "Email not available"}
          </p>

        </div>

        {/* ==================================================
            VERIFY OTP FORM
        ================================================== */}

        <form
          onSubmit={handleVerifyOTP}
          className="space-y-5"
        >

          <div>

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Enter 6-Digit OTP
            </label>

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => {
                const value = e.target.value
                  .replace(/\D/g, "")
                  .slice(0, 6);

                setOtp(value);
              }}
              placeholder="Enter OTP"
              disabled={loading}
              className="w-full border border-gray-300 rounded-xl px-4 py-4 text-center text-2xl tracking-[8px] outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
              required
            />

          </div>

          {/* VERIFY BUTTON */}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        {/* ==================================================
            RESEND OTP
        ================================================== */}

        <div className="text-center mt-6">

          <p className="text-gray-500 text-sm mb-3">
            Didn't receive the OTP?
          </p>

          <button
            type="button"
            onClick={handleResendOTP}
            disabled={resending}
            className="text-blue-600 font-semibold hover:underline disabled:opacity-50"
          >
            {resending
              ? "Sending..."
              : "Resend OTP"}
          </button>

        </div>

        {/* ==================================================
            BACK TO SIGNUP
        ================================================== */}

        <button
          type="button"
          onClick={() => navigate("/signup")}
          className="w-full mt-6 border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50"
        >
          ← Back to Signup
        </button>

      </div>

    </div>
  );
};

export default VerifyOTP;