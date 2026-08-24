import User from "../models/userModel.js";
import Order from "../models/orderModel.js";
import Product from "../models/productModel.js";

// ======================================================
// ADMIN CHECK
// ======================================================

const checkAdmin = (req, res) => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: "Authentication required",
    });

    return false;
  }

  if (req.user.isAdmin !== true) {
    res.status(403).json({
      success: false,
      message: "Admin access denied",
    });

    return false;
  }

  return true;
};

// ======================================================
// GET ALL USERS
// GET /api/admin/users
// ======================================================

export const getAllUsers = async (req, res) => {
  try {
    // Extra security check
    if (!checkAdmin(req, res)) {
      return;
    }

    const users = await User.find()
      .select(
        "-password -otp -otpExpiry"
      )
      .sort({
        createdAt: -1,
      })
      .lean();

    return res.status(200).json({
      success: true,
      message:
        "All users fetched successfully",
      users,
    });
  } catch (error) {
    console.error(
      "Get All Users Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch users",
    });
  }
};

// ======================================================
// DELETE USER
// DELETE /api/admin/users/:userId
// ======================================================

export const deleteUser = async (req, res) => {
  try {
    // Extra security check
    if (!checkAdmin(req, res)) {
      return;
    }

    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    const user =
      await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Never allow deleting admin
    if (user.isAdmin === true) {
      return res.status(403).json({
        success: false,
        message:
          "Admin user cannot be deleted",
      });
    }

    await User.findByIdAndDelete(
      userId
    );

    console.log(
      "USER DELETED:",
      user.email
    );

    return res.status(200).json({
      success: true,
      message:
        "User deleted successfully",
    });
  } catch (error) {
    console.error(
      "Delete User Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to delete user",
    });
  }
};

// ======================================================
// GET ALL ORDERS
// GET /api/admin/orders
// ======================================================

export const getAllOrders = async (
  req,
  res
) => {
  try {
    // Extra security check
    if (!checkAdmin(req, res)) {
      return;
    }

    const orders =
      await Order.find()
        .populate(
          "user",
          "name email"
        )
        .populate(
          "items.product"
        )
        .sort({
          createdAt: -1,
        })
        .lean();

    return res.status(200).json({
      success: true,
      message:
        "All orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error(
      "Get All Orders Error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to fetch orders",
    });
  }
};

// ======================================================
// UPDATE ORDER STATUS
//
// PUT /api/admin/orders/:orderId
// ======================================================

export const updateOrderStatus =
  async (req, res) => {
    try {
      // Extra security check
      if (!checkAdmin(req, res)) {
        return;
      }

      const { orderId } =
        req.params;

      const { orderStatus } =
        req.body;

      if (!orderId) {
        return res.status(400).json({
          success: false,
          message:
            "Order ID is required",
        });
      }

      if (!orderStatus) {
        return res.status(400).json({
          success: false,
          message:
            "orderStatus is required",
        });
      }

      const allowedStatuses = [
        "Pending",
        "Confirmed",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ];

      if (
        !allowedStatuses.includes(
          orderStatus
        )
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid order status",
          allowedStatuses,
        });
      }

      const order =
        await Order.findById(
          orderId
        );

      if (!order) {
        return res.status(404).json({
          success: false,
          message:
            "Order not found",
        });
      }

      order.orderStatus =
        orderStatus;

      await order.save();

      const updatedOrder =
        await Order.findById(
          order._id
        )
          .populate(
            "user",
            "name email"
          )
          .populate(
            "items.product"
          );

      return res.status(200).json({
        success: true,
        message:
          "Order status updated successfully",
        order: updatedOrder,
      });
    } catch (error) {
      console.error(
        "Update Order Status Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to update order status",
      });
    }
  };

// ======================================================
// GET DASHBOARD STATS
//
// GET /api/admin/dashboard
// ======================================================

export const getDashboardStats =
  async (req, res) => {
    try {
      // Extra security check
      if (!checkAdmin(req, res)) {
        return;
      }

      const [
        totalUsers,
        totalProducts,
        totalOrders,
      ] = await Promise.all([
        User.countDocuments(),

        Product.countDocuments(),

        Order.countDocuments(),
      ]);

      // Cancelled orders revenue mein
      // include nahi honge.
      const revenueOrders =
        await Order.find({
          orderStatus: {
            $ne: "Cancelled",
          },
        })
          .select(
            "totalAmount paymentStatus orderStatus"
          )
          .lean();

      const totalRevenue =
        revenueOrders.reduce(
          (total, order) => {
            return (
              total +
              Number(
                order.totalAmount || 0
              )
            );
          },
          0
        );

      return res.status(200).json({
        success: true,
        message:
          "Dashboard stats fetched successfully",

        stats: {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue,
        },
      });
    } catch (error) {
      console.error(
        "Dashboard Stats Error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Unable to fetch dashboard stats",
      });
    }
  };