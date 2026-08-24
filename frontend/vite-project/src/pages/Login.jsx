import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";

const API_URL = "http://localhost:8000";

const Login = () => {
  const navigate = useNavigate();

  // ======================================================
  // FORM STATE
  // IMPORTANT:
  // Refresh ke baad dono fields blank rahengi
  // ======================================================

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showPassword, setShowPassword] = useState(false);

  // ======================================================
  // IMPORTANT:
  // Login page open/refresh hone par form blank
  // ======================================================

  useEffect(() => {
    setEmail("");
    setPassword("");
    setError("");
    setSuccess("");
  }, []);

  // ======================================================
  // LOGIN
  // ======================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const cleanEmail = email.trim().toLowerCase();

    if (!cleanEmail) {
      setError("Please enter your email.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/users/login`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            email: cleanEmail,
            password,
          }),
        }
      );

      const data = await response.json();

      console.log("LOGIN STATUS:", response.status);
      console.log("LOGIN RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Login failed."
        );
      }

      // ==================================================
      // TOKEN
      // ==================================================

      const token =
        data.token ||
        data.accessToken ||
        data.user?.token ||
        null;

      if (!token) {
        throw new Error(
          "Login successful but authentication token was not received."
        );
      }

      // ==================================================
      // USER
      // ==================================================

      const loggedInUser =
        data.user ||
        data.userData ||
        null;

      if (!loggedInUser) {
        throw new Error(
          "Login successful but user information was not received."
        );
      }

      // ==================================================
      // SAVE ONLY AUTH DATA
      // ==================================================

      localStorage.setItem("token", token);

      localStorage.removeItem("authToken");

      localStorage.setItem(
        "user",
        JSON.stringify(loggedInUser)
      );

      console.log(
        "TOKEN SAVED:",
        token
      );

      console.log(
        "USER SAVED:",
        JSON.stringify(loggedInUser)
      );

      // ==================================================
      // FORM CLEAR
      // Login complete hone ke baad bhi credentials
      // state se remove
      // ==================================================

      setEmail("");
      setPassword("");

      setSuccess("Login successful!");

      // ==================================================
      // ADMIN / CUSTOMER REDIRECT
      // ==================================================

      if (loggedInUser.isAdmin === true) {
        setTimeout(() => {
          navigate("/dashboard", {
            replace: true,
          });
        }, 300);

        return;
      }

      // Normal customer
      setTimeout(() => {
        navigate("/", {
          replace: true,
        });
      }, 300);

    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error.message ||
          "Something went wrong while logging in."
      );

      // Failed login par password clear
      setPassword("");

    } finally {
      setLoading(false);
    }
  };

  // ======================================================
  // FORGOT PASSWORD
  // ======================================================

  const handleForgotPassword = () => {
    navigate("/forgot-password");
  };

  // ======================================================
  // UI
  // ======================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eef2ff] via-white to-[#fff1ed] flex items-center justify-center px-4 py-10">

      <div className="w-full max-w-md">

        {/* ==================================================
            CARD
        ================================================== */}

        <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">

          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="bg-gradient-to-r from-[#4c5f9f] to-[#33457f] px-7 py-8 text-center">

            <div className="mx-auto w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg">

              <span className="text-4xl font-black text-[#ff7358]">
                E
              </span>

            </div>

            <h1 className="text-2xl font-extrabold text-white mt-4">
              Eco<span className="text-[#ff7358]">Shop</span>
            </h1>

            <p className="text-blue-100 text-sm mt-1">
              Welcome back! Login to continue.
            </p>

          </div>

          {/* ==================================================
              FORM
          ================================================== */}

          <form
            onSubmit={handleLogin}
            autoComplete="off"
            className="p-7"
          >

            {/* ERROR */}

            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {/* SUCCESS */}

            {success && (
              <div className="mb-5 bg-green-50 border border-green-200 text-green-700 rounded-xl px-4 py-3 text-sm">
                {success}
              </div>
            )}

            {/* ==================================================
                EMAIL
            ================================================== */}

            <div className="mb-5">

              <label className="block text-sm font-bold text-[#30385d] mb-2">
                Email Address
              </label>

              <input

                type="email"
                name="login-email"
                id="login-email"
                required
                
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                placeholder="Enter your email"
                autoCapitalize="none"
                spellCheck="false"
                disabled={loading}
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3.5 outline-none text-[#30385d] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#6678b4] focus:border-transparent disabled:opacity-60"
              />

            </div>

            {/* ==================================================
                PASSWORD
            ================================================== */}

            <div className="mb-3">

              <label className="block text-sm font-bold text-[#30385d] mb-2">
                Password
              </label>

              <div className="relative">

                <input
                  type={
                    showPassword
                      ? "text"
                      : "password"
                  }
                  name="login-password"
                  id="login-password"
                  value={password}
                  onChange={(e) =>
                    setPassword(e.target.value)
                  }
                  placeholder="Enter your password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3.5 pr-12 outline-none text-[#30385d] bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#6678b4] focus:border-transparent disabled:opacity-60"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      !showPassword
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#4c5f9f]"
                >
                  {showPassword
                    ? "🙈"
                    : "👁️"}
                </button>

              </div>

            </div>

            {/* ==================================================
                FORGOT PASSWORD
            ================================================== */}

            <div className="flex justify-end mb-6">

              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-semibold text-[#ff7358] hover:underline"
              >
                Forgot Password?
              </button>

            </div>

            {/* ==================================================
                LOGIN BUTTON
            ================================================== */}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#4c5f9f] to-[#33457f] text-white py-3.5 rounded-xl font-bold text-base shadow-lg hover:shadow-xl hover:opacity-95 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Login"
              )}
            </button>

            {/* ==================================================
                SIGNUP
            ================================================== */}

            <div className="text-center mt-6">

              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link
                  to="/signup"
                  className="font-bold text-[#ff7358] hover:underline"
                >
                  Create Account
                </Link>
              </p>

            </div>

          </form>

        </div>

        {/* ==================================================
            SECURITY NOTE
        ================================================== */}

        <p className="text-center text-xs text-gray-400 mt-5">
          🔒 Your account information is securely handled.
        </p>

      </div>

    </div>
  );
};

export default Login;