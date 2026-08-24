import express from "express";

import {
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
} from "../controllers/cartController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add product to cart
router.post("/add", authMiddleware, addToCart);

// Get user's cart
router.get("/", authMiddleware, getCart);

// Update cart quantity
router.put("/update/:productId", authMiddleware, updateCartQuantity);

// Remove product from cart
router.delete("/remove/:productId", authMiddleware, removeFromCart);

// Clear entire cart
router.delete("/clear", authMiddleware, clearCart);

export default router;
