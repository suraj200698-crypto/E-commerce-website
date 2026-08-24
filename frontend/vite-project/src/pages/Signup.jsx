import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";

import { auth } from "../firebase";

const Signup = () => {
  const navigate = useNavigate();

  // ======================================================
  // LOAD SAVED SIGNUP DATA
  // ======================================================

  const getSavedSignupData = () => {
    try {
      const savedData = localStorage.getItem("signupFormData");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        return {
          firstName: parsedData.firstName || "",
          lastName: parsedData.lastName || "",
          email: parsedData.email || "",
          password: "",
          confirmPassword: "",
        };
      }
    } catch (error) {
      console.error("Saved signup data error:", error);
    }

    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    };
  };

  // ======================================================
  // EMAIL SIGNUP
  // ======================================================

  const [formData, setFormData] = useState(getSavedSignupData);

  const [loading, setLoading] = useState(false);

  // ======================================================
  // PASSWORD SHOW / HIDE
  // ======================================================

  const [showPassword, setShowPassword] = useState(false);

  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ======================================================
  // PHONE SIGNUP
  // ======================================================

  const getSavedPhoneData = () => {
    try {
      const savedData = localStorage.getItem("signupPhoneData");

      if (savedData) {
        const parsedData = JSON.parse(savedData);

        return {
          phoneName: parsedData.phoneName || "",
          phone: parsedData.phone || "",
        };
      }
    } catch (error) {
      console.error("Saved phone signup data error:", error);
    }

    return {
      phoneName: "",
      phone: "",
    };
  };

  const savedPhoneData = getSavedPhoneData();

  const [phoneMode, setPhoneMode] = useState(false);

  const [phone, setPhone] = useState(savedPhoneData.phone);

  const [phoneOTP, setPhoneOTP] = useState("");

  const [phoneOTPSent, setPhoneOTPSent] = useState(false);

  const [phoneLoading, setPhoneLoading] = useState(false);

  const [confirmationResult, setConfirmationResult] = useState(null);

  const [phoneName, setPhoneName] = useState(savedPhoneData.phoneName);

  // ======================================================
  // HANDLE EMAIL INPUT
  // ======================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // ====================================================
    // SAVE ONLY SAFE SIGNUP DETAILS
    // PASSWORD NEVER SAVED
    // ====================================================

    if (name === "firstName" || name === "lastName" || name === "email") {
      const updatedData = {
        ...formData,
        [name]: value,
      };

      localStorage.setItem(
        "signupFormData",
        JSON.stringify({
          firstName: updatedData.firstName,
          lastName: updatedData.lastName,
          email: updatedData.email,
        }),
      );
    }
  };

  // ======================================================
  // EMAIL SIGNUP
  // ======================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Password match
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    // Password length
    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();

      const response = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          name: fullName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      console.log("REGISTER RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Registration failed.");
        return;
      }

      // Keep name/email data saved.
      // Password is NOT saved.

      localStorage.setItem(
        "signupFormData",
        JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
        }),
      );

      alert("Account created successfully! OTP has been sent to your email.");

      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      alert(
        "Unable to connect to server. Please make sure backend is running.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FIREBASE RECAPTCHA
  // ======================================================

  const setupRecaptcha = () => {
    if (window.recaptchaVerifier) {
      return window.recaptchaVerifier;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(
      auth,
      "signup-recaptcha-container",
      {
        size: "normal",

        callback: () => {
          console.log("Signup reCAPTCHA verified");
        },

        "expired-callback": () => {
          console.log("Signup reCAPTCHA expired");
        },
      },
    );

    return window.recaptchaVerifier;
  };

  // ======================================================
  // PHONE NAME CHANGE
  // ======================================================

  const handlePhoneNameChange = (e) => {
    const value = e.target.value;

    setPhoneName(value);

    localStorage.setItem(
      "signupPhoneData",
      JSON.stringify({
        phoneName: value,
        phone,
      }),
    );
  };

  // ======================================================
  // PHONE CHANGE
  // ======================================================

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 10);

    setPhone(value);

    localStorage.setItem(
      "signupPhoneData",
      JSON.stringify({
        phoneName,
        phone: value,
      }),
    );
  };

  // ======================================================
  // SEND PHONE OTP
  // ======================================================

  const sendPhoneOTP = async () => {
    if (!phoneName.trim()) {
      alert("Please enter your name.");
      return;
    }

    if (!phone) {
      alert("Please enter your phone number.");
      return;
    }

    if (!/^\d{10}$/.test(phone)) {
      alert("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    try {
      setPhoneLoading(true);

      const fullPhoneNumber = `+91${phone}`;

      console.log("Sending Firebase OTP to:", fullPhoneNumber);

      const appVerifier = setupRecaptcha();

      const result = await signInWithPhoneNumber(
        auth,
        fullPhoneNumber,
        appVerifier,
      );

      setConfirmationResult(result);

      setPhoneOTPSent(true);

      alert("OTP sent successfully to your phone.");
    } catch (error) {
      console.error("PHONE SIGNUP OTP ERROR:", error);

      alert(error.message || "Unable to send OTP. Please try again.");

      if (window.recaptchaVerifier) {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    } finally {
      setPhoneLoading(false);
    }
  };

  // ======================================================
  // VERIFY PHONE OTP + BACKEND LOGIN/SIGNUP
  // ======================================================

  const verifyPhoneOTP = async () => {
    if (!phoneOTP) {
      alert("Please enter OTP.");
      return;
    }

    if (phoneOTP.length !== 6) {
      alert("Please enter a valid 6-digit OTP.");
      return;
    }

    if (!confirmationResult) {
      alert("Please send OTP first.");
      return;
    }

    try {
      setPhoneLoading(true);

      const result = await confirmationResult.confirm(phoneOTP);

      const firebaseUser = result.user;

      console.log("FIREBASE PHONE USER:", firebaseUser);

      const firebaseToken = await firebaseUser.getIdToken();

      console.log("Firebase ID Token received");

      // ==================================================
      // SEND FIREBASE TOKEN TO ECOSHOP BACKEND
      // ==================================================

      const response = await fetch(
        "http://localhost:8000/api/users/firebase-phone",
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            idToken: firebaseToken,
            name: phoneName.trim(),
          }),
        },
      );

      const data = await response.json();

      console.log("FIREBASE PHONE SIGNUP RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Phone signup failed.");
        return;
      }

      // ==================================================
      // SAVE ECOSHOP LOGIN DATA
      // ==================================================

      localStorage.setItem("token", data.token);

      localStorage.setItem("user", JSON.stringify(data.user));

      localStorage.setItem("firebaseToken", firebaseToken);

      localStorage.setItem("firebasePhone", firebaseUser.phoneNumber || "");

      // Keep phone signup details
      localStorage.setItem(
        "signupPhoneData",
        JSON.stringify({
          phoneName,
          phone,
        }),
      );

      alert("Phone signup successful! Welcome to EcoShop.");

      navigate("/");
    } catch (error) {
      console.error("PHONE OTP VERIFY ERROR:", error);

      alert("Invalid OTP or phone authentication failed. Please try again.");
    } finally {
      setPhoneLoading(false);
    }
  };

  // ======================================================
  // SWITCH TO PHONE
  // ======================================================

  const switchToPhone = () => {
    setPhoneMode(true);
  };

  // ======================================================
  // SWITCH TO EMAIL
  // ======================================================

  const switchToEmail = () => {
    setPhoneMode(false);

    setPhoneOTPSent(false);

    setPhoneOTP("");

    setConfirmationResult(null);

    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
      window.recaptchaVerifier = null;
    }
  };

  // ======================================================
  // CLEAR SAVED SIGNUP DATA
  // ======================================================

  const clearSavedSignupData = () => {
    localStorage.removeItem("signupFormData");
    localStorage.removeItem("signupPhoneData");

    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

    setPhoneName("");
    setPhone("");
    setPhoneOTP("");
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-[80vh] bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
        {/* ==================================================
            HEADER
        ================================================== */}

        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto bg-blue-600 text-white rounded-xl flex items-center justify-center text-2xl font-bold">
            E
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Create Account
          </h1>

          <p className="text-gray-500 mt-2">Join EcoShop today</p>
        </div>

        {/* ==================================================
            PHONE SIGNUP MODE
        ================================================== */}

        {phoneMode ? (
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-5">
              Sign Up with Phone
            </h2>

            {/* NAME */}

            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Your Name
              </label>

              <input
                type="text"
                value={phoneName}
                onChange={handlePhoneNameChange}
                placeholder="Enter your name"
                disabled={phoneOTPSent || phoneLoading}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PHONE */}

            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Phone Number
            </label>

            <div className="flex gap-2 mb-4">
              <div className="border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 font-semibold">
                +91
              </div>

              <input
                type="tel"
                value={phone}
                onChange={handlePhoneChange}
                placeholder="Enter 10-digit number"
                disabled={phoneOTPSent || phoneLoading}
                className="flex-1 border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* RECAPTCHA */}

            <div id="signup-recaptcha-container" className="mb-4"></div>

            {/* SEND OTP */}

            {!phoneOTPSent && (
              <button
                type="button"
                onClick={sendPhoneOTP}
                disabled={phoneLoading}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60"
              >
                {phoneLoading ? "Sending OTP..." : "Send OTP"}
              </button>
            )}

            {/* OTP */}

            {phoneOTPSent && (
              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter OTP
                </label>

                <input
                  type="text"
                  value={phoneOTP}
                  onChange={(e) =>
                    setPhoneOTP(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="Enter 6-digit OTP"
                  maxLength={6}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center tracking-widest text-lg outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={verifyPhoneOTP}
                  disabled={phoneLoading}
                  className="w-full mt-4 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition disabled:opacity-60"
                >
                  {phoneLoading
                    ? "Creating Account..."
                    : "Verify & Create Account"}
                </button>
              </div>
            )}

            {/* BACK TO EMAIL */}

            <button
              type="button"
              onClick={switchToEmail}
              className="w-full mt-5 text-blue-600 font-semibold hover:underline"
            >
              ← Sign Up with Email & Password
            </button>
          </div>
        ) : (
          /* ==================================================
             EMAIL SIGNUP MODE
          ================================================== */

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* FIRST + LAST NAME */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  First Name
                </label>

                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                  disabled={loading}
                  autoComplete="given-name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Last Name
                </label>

                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                  disabled={loading}
                  autoComplete="family-name"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* EMAIL */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                required
                disabled={loading}
                autoComplete="email"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* PASSWORD */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 text-xl"
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD */}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Confirm Password
              </label>

              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm password"
                  required
                  minLength={6}
                  disabled={loading}
                  autoComplete="new-password"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600 text-xl"
                >
                  {showConfirmPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* TERMS */}

            <label className="flex gap-2 text-sm text-gray-600">
              <input type="checkbox" required disabled={loading} />I agree to
              the Terms & Conditions
            </label>

            {/* CREATE ACCOUNT */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>
        )}

        {/* ==================================================
            OTHER SIGNUP OPTION
        ================================================== */}

        {!phoneMode && (
          <>
            <div className="flex items-center gap-3 my-6">
              <div className="flex-1 h-px bg-gray-200"></div>

              <span className="text-sm text-gray-400">OR</span>

              <div className="flex-1 h-px bg-gray-200"></div>
            </div>

            <button
              type="button"
              onClick={switchToPhone}
              className="w-full border border-gray-300 py-3 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              📱 Sign Up with Phone
            </button>
          </>
        )}

        {/* ==================================================
            CLEAR SAVED DATA
        ================================================== */}

        {(formData.firstName ||
          formData.lastName ||
          formData.email ||
          phoneName ||
          phone) && (
          <button
            type="button"
            onClick={clearSavedSignupData}
            disabled={loading || phoneLoading}
            className="w-full mt-4 text-sm text-gray-500 hover:text-red-600 hover:underline"
          >
            Clear saved details
          </button>
        )}

        {/* ==================================================
            LOGIN
        ================================================== */}

        <p className="text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 font-semibold hover:underline"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
