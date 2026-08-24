import React from "react";
import {
  Routes,
  Route,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import NotFoundPage from "./components/NotFoundPage";

import Home from "./pages/Home";
import Shop from "./pages/Shop";
import Cart from "./pages/Cart";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import VerifyOTP from "./pages/VerifyOTP";
import Payment from "./pages/Payment";
import Checkout from "./pages/Checkout";

// ======================================================
// NORMAL WEBSITE LAYOUT
// ======================================================

const WebsiteLayout = ({
  children,
}) => {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
};

// ======================================================
// APP
// ======================================================

const App = () => {
  return (
    <Routes>

      {/* ==================================================
          NORMAL WEBSITE
      ================================================== */}

      <Route
        path="/"
        element={
          <WebsiteLayout>
            <Home />
          </WebsiteLayout>
        }
      />

      <Route
        path="/shop"
        element={
          <WebsiteLayout>
            <Shop />
          </WebsiteLayout>
        }
      />

      <Route
        path="/cart"
        element={
          <WebsiteLayout>
            <Cart />
          </WebsiteLayout>
        }
      />

      <Route
        path="/checkout"
        element={
          <WebsiteLayout>
            <Checkout />
          </WebsiteLayout>
        }
      />

      <Route
        path="/payment"
        element={
          <WebsiteLayout>
            <Payment />
          </WebsiteLayout>
        }
      />

      <Route
        path="/login"
        element={
          <WebsiteLayout>
            <Login />
          </WebsiteLayout>
        }
      />

      <Route
        path="/signup"
        element={
          <WebsiteLayout>
            <Signup />
          </WebsiteLayout>
        }
      />

      <Route
        path="/verify-otp"
        element={
          <WebsiteLayout>
            <VerifyOTP />
          </WebsiteLayout>
        }
      />

      {/* ==================================================
          ADMIN DASHBOARD
          NO NORMAL NAVBAR
      ================================================== */}

      <Route
        path="/dashboard"
        element={<Dashboard />}
      />

      {/* ==================================================
          404
      ================================================== */}

      <Route
        path="*"
        element={<NotFoundPage />}
      />

    </Routes>
  );
};

export default App;