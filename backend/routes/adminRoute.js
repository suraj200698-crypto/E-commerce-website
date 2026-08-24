import express from "express";

import {
  getAllUsers,
  getAllOrders,
  updateOrderStatus,
  deleteUser,
  getDashboardStats,
} from "../controllers/adminController.js";

import authMiddleware from "../middleware/authMiddleware.js";
import adminMiddleware from "../middleware/adminMiddleware.js";

const router = express.Router();

// ======================================================
// ALL ADMIN ROUTES ARE PROTECTED
// ======================================================

router.use(authMiddleware);
router.use(adminMiddleware);

// ======================================================
// DASHBOARD
// GET /api/admin/dashboard
// ======================================================

router.get(
  "/dashboard",
  getDashboardStats
);

// ======================================================
// USERS
// GET /api/admin/users
// ======================================================

router.get(
  "/users",
  getAllUsers
);

// ======================================================
// DELETE USER
// DELETE /api/admin/users/:userId
// ======================================================

router.delete(
  "/users/:userId",
  deleteUser
);

// ======================================================
// ORDERS
// GET /api/admin/orders
// ======================================================

router.get(
  "/orders",
  getAllOrders
);

// ======================================================
// UPDATE ORDER STATUS
// PUT /api/admin/orders/:orderId
// ======================================================

router.put(
  "/orders/:orderId",
  updateOrderStatus
);

export default router;