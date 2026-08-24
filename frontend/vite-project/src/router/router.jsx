import { createBrowserRouter } from "react-router-dom";

import App from "../App";

import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Cart from "../pages/Cart";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import VerifyOTP from "../pages/VerifyOTP";
import Payment from "../pages/Payment";
import Checkout from "../pages/Checkout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,

    children: [
      {
        index: true,
        element: <Home />,
      },

      {
        path: "shop",
        element: <Shop />,
      },

      {
        path: "cart",
        element: <Cart />,
      },

      {
        path: "checkout",
        element: <Checkout />,
      },

      {
        path: "payment",
        element: <Payment />,
      },

      {
        path: "login",
        element: <Login />,
      },

      {
        path: "signup",
        element: <Signup />,
      },

      {
        path: "verify-otp",
        element: <VerifyOTP />,
      },

      {
        path: "dashboard",
        element: <Dashboard />,
      },
    ],
  },
]);

export default router;