import express from "express";

import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/paymentController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// ================= CREATE RAZORPAY ORDER =================

router.post(
  "/create-order",
  authMiddleware,
  createRazorpayOrder
);

// ================= VERIFY PAYMENT =================

router.post(
  "/verify-payment",
  authMiddleware,
  verifyRazorpayPayment
);

export default router;