import express from "express";

import {
  getPublicStats,
} from "../controllers/privateDataController.js";

const router = express.Router();

// ======================================================
// PUBLIC DASHBOARD
// ======================================================

// GET /api/private-data/public-stats
//
// Login required nahi hai.
// Sirf aggregate statistics milengi.

router.get(
  "/public-stats",
  getPublicStats
);

export default router;