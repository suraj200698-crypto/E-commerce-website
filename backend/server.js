import express from "express";
import dotenv from "dotenv";
import cors from "cors";

// ======================================================
// FIREBASE ADMIN
// ======================================================

import "./config/firebaseAdmin.js";

// ======================================================
// DATABASE
// ======================================================

import connectDB from "./db/cannect.js";

// ======================================================
// MODELS
// ======================================================

import User from "./models/userModel.js";
import Product from "./models/productModel.js";
import Order from "./models/orderModel.js";

// ======================================================
// ROUTES
// ======================================================

import productRoute from "./routes/productRoute.js";
import userRoute from "./routes/userRoute.js";
import cartRoute from "./routes/cartRoute.js";
import wishlistRoute from "./routes/wishlistRoute.js";
import orderRoute from "./routes/orderRoute.js";
import paymentRoute from "./routes/paymentRoute.js";
import adminRoute from "./routes/adminRoute.js";
import privateDataRoute from "./routes/privateDataRoute.js";

// ======================================================
// DOTENV
// ======================================================

dotenv.config();

// ======================================================
// APP
// ======================================================

const app = express();

// ======================================================
// ENV CHECK
// ======================================================

console.log("==========================================");
console.log("ENV CHECK");
console.log("==========================================");

console.log(
  "MAIL_USER loaded:",
  !!process.env.MAIL_USER
);

console.log(
  "MAIL_PASS loaded:",
  !!process.env.MAIL_PASS
);

console.log(
  "JWT_SECRET loaded:",
  !!process.env.JWT_SECRET
);

console.log("==========================================");

// ======================================================
// CORS
// ======================================================

const allowedOrigins = [
  // ====================================================
  // LOCAL DEVELOPMENT
  // ====================================================

  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:5176",

  "http://127.0.0.1:5173",
  "http://127.0.0.1:5174",
  "http://127.0.0.1:5175",
  "http://127.0.0.1:5176",

  // ====================================================
  // PRODUCTION FRONTEND - RENDER
  // ====================================================

  "https://ecoshop-frontend-6cje.onrender.com",
];

// ======================================================
// CORS MIDDLEWARE
// ======================================================

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without Origin
      // Example: Postman / curl / server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        console.log("CORS ALLOWED:", origin);

        return callback(null, true);
      }

      console.log("CORS BLOCKED ORIGIN:", origin);

      return callback(
        new Error("Not allowed by CORS")
      );
    },

    credentials: true,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    optionsSuccessStatus: 204,
  })
);

// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "10mb",
  })
);

// ======================================================
// DATABASE
// ======================================================

console.log("Connecting to MongoDB...");

connectDB();

// ======================================================
// BASIC SERVER TEST
// ======================================================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "EcoShop Backend API is running",
  });
});

// ======================================================
// ADMIN SERVER TEST
// ======================================================

app.get("/api/admin-test", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Backend server is working",
  });
});

// ======================================================
// PUBLIC DASHBOARD STATS
// ======================================================

app.get(
  "/api/private-data/public-stats",
  async (req, res) => {
    try {
      const [
        totalProducts,
        totalOrders,
      ] = await Promise.all([
        Product.countDocuments(),
        Order.countDocuments(),
      ]);

      const [
        pendingOrders,
        completedOrders,
      ] = await Promise.all([
        Order.countDocuments({
          orderStatus: "Pending",
        }),

        Order.countDocuments({
          orderStatus: {
            $in: [
              "Completed",
              "Delivered",
            ],
          },
        }),
      ]);

      return res.status(200).json({
        success: true,

        stats: {
          totalProducts,
          totalOrders,
          pendingOrders,
          completedOrders,
        },
      });
    } catch (error) {
      console.error(
        "PUBLIC DASHBOARD ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to load dashboard statistics",
      });
    }
  }
);

// ======================================================
// USER ROUTES
// ======================================================

app.use(
  "/api/users",
  userRoute
);

// ======================================================
// PRODUCT ROUTES
// ======================================================

app.use(
  "/api/products",
  productRoute
);

// ======================================================
// CART ROUTES
// ======================================================

app.use(
  "/api/cart",
  cartRoute
);

// ======================================================
// WISHLIST ROUTES
// ======================================================

app.use(
  "/api/wishlist",
  wishlistRoute
);

// ======================================================
// ORDER ROUTES
// ======================================================

app.use(
  "/api/orders",
  orderRoute
);

// ======================================================
// PAYMENT ROUTES
// ======================================================

app.use(
  "/api/payment",
  paymentRoute
);

// ======================================================
// ADMIN ROUTES
// ======================================================

console.log("Loading Admin Routes...");

app.use(
  "/api/admin",
  adminRoute
);

console.log("Admin Routes Loaded");

// ======================================================
// PRIVATE DATA DEBUG TEST
// ======================================================

app.get(
  "/api/private-data-debug",
  (req, res) => {
    return res.status(200).json({
      success: true,
      message:
        "Private data system is connected correctly",
    });
  }
);

// ======================================================
// PRIVATE DATA ROUTES
// ======================================================

console.log(
  "Loading Private Data Routes..."
);

app.use(
  "/api/private-data",
  privateDataRoute
);

console.log(
  "Private Data Routes Loaded"
);

// ======================================================
// 404 HANDLER
// ======================================================

app.use((req, res) => {
  console.log(
    "404 REQUEST:",
    req.method,
    req.originalUrl
  );

  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (err, req, res, next) => {
    console.error(
      "SERVER ERROR:",
      err.message
    );

    if (
      err.message ===
      "Not allowed by CORS"
    ) {
      return res.status(403).json({
        success: false,
        message:
          "CORS: Origin not allowed",
      });
    }

    return res.status(500).json({
      success: false,
      message:
        "Internal server error",
    });
  }
);

// ======================================================
// SERVER
// ======================================================

const PORT =
  process.env.PORT || 8000;

app.listen(PORT, () => {
  console.log(
    "=========================================="
  );

  console.log(
    "EcoShop Backend Server Running"
  );

  console.log(
    `PORT: ${PORT}`
  );

  console.log(
    `API URL: http://localhost:${PORT}`
  );

  console.log(
    `Admin API: http://localhost:${PORT}/api/admin`
  );

  console.log(
    `Private Data API: http://localhost:${PORT}/api/private-data`
  );

  console.log(
    `Public Stats API: http://localhost:${PORT}/api/private-data/public-stats`
  );

  console.log(
    `Private Debug API: http://localhost:${PORT}/api/private-data-debug`
  );

  console.log(
    `Admin Test: http://localhost:${PORT}/api/admin-test`
  );

  console.log(
    "=========================================="
  );
});