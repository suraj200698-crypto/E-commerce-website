import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// ======================================================
// PUBLIC DASHBOARD STATS
// GET /api/private-data/public-stats
//
// IMPORTANT:
// Is route par kisi user ki private information nahi bheji jaati.
// Sirf public aggregate statistics return hoti hain.
// ======================================================

export const getPublicStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalProducts,
      totalOrders,
      pendingOrders,
      completedOrders,
    ] = await Promise.all([
      User.countDocuments(),

      Product.countDocuments(),

      Order.countDocuments(),

      Order.countDocuments({
        orderStatus: "Pending",
      }),

      Order.countDocuments({
        orderStatus: "Delivered",
      }),
    ]);

    return res.status(200).json({
      success: true,
      message: "Public dashboard stats fetched successfully",

      stats: {
        totalUsers,
        totalProducts,
        totalOrders,
        pendingOrders,
        completedOrders,
      },
    });
  } catch (error) {
    console.error(
      "Public Dashboard Stats Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Unable to fetch public dashboard stats",
    });
  }
};