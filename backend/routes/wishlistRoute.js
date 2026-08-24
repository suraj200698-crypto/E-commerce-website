import express from "express";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "../controllers/wishlistController.js";

import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// Add product to wishlist
router.post("/add", authMiddleware, addToWishlist);

// Get user's wishlist
router.get("/", authMiddleware, getWishlist);

// Remove product from wishlist
router.delete("/remove/:productId", authMiddleware, removeFromWishlist);

// Clear entire wishlist
router.delete("/clear", authMiddleware, clearWishlist);

export default router;  