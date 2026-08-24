import express from "express";

import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
} from "../controllers/orderController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Order
router.post("/", authMiddleware, createOrder);

// Get My Orders
router.get("/", authMiddleware, getMyOrders);

// Get Single Order
router.get("/:orderId", authMiddleware, getOrderById);

// Cancel Order
router.put("/cancel/:orderId", authMiddleware, cancelOrder);

export default router;