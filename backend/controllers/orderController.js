import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ================= CREATE ORDER =================

export const createOrder = async (req, res) => {
  try {
    const userId = req.user._id;

    const { shippingAddress, paymentMethod = "COD" } = req.body;

    // ================= CHECK SHIPPING ADDRESS =================

    if (
      !shippingAddress ||
      !shippingAddress.fullName ||
      !shippingAddress.phone ||
      !shippingAddress.address ||
      !shippingAddress.city ||
      !shippingAddress.state ||
      !shippingAddress.pincode
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete shipping address is required",
      });
    }

    // ================= CHECK PAYMENT METHOD =================

    if (!["COD", "ONLINE"].includes(paymentMethod)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment method",
      });
    }

    // ================= FIND CART =================

    const cart = await Cart.findOne({
      user: userId,
    }).populate("items.product");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    // ================= PREPARE ORDER =================

    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const product = item.product;

      // Product check
      if (!product) {
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });
      }

      // Stock check
      if (!product.inStock || product.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `${product.name} is out of stock or has insufficient stock`,
        });
      }

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.price,
      });

      subtotal += Number(product.price) * Number(item.quantity);
    }

    // ====================================================
    // SHIPPING + GST CALCULATION
    // ====================================================

    let shipping;
    let gst;
    let totalAmount;

    // ====================================================
    // TEMPORARY RAZORPAY TEST MODE
    // ONLINE PAYMENT = EXACTLY ₹1
    // ====================================================

    if (paymentMethod === "ONLINE") {
      shipping = 0;
      gst = 0;
      totalAmount = 1;
    } else {
      // ================= NORMAL COD CALCULATION =================

      shipping = 99;
      gst = Math.round(subtotal * 0.12);

      totalAmount = subtotal + shipping + gst;
    }

    // ====================================================
    // CREATE ORDER
    // ====================================================

    const order = await Order.create({
      user: userId,
      items: orderItems,

      // ONLINE = ₹1 TEST PAYMENT
      // COD = NORMAL TOTAL
      totalAmount,

      shippingAddress,
      paymentMethod,
      paymentStatus: "Pending",
      orderStatus: "Pending",
    });

    // ====================================================
    // COD PAYMENT
    // ====================================================

    if (paymentMethod === "COD") {
      // Reduce stock
      for (const item of cart.items) {
        const product = await Product.findById(item.product._id);

        if (product) {
          product.stock -= item.quantity;

          if (product.stock <= 0) {
            product.stock = 0;
            product.inStock = false;
          }

          await product.save();
        }
      }

      // Clear cart
      cart.items = [];
      await cart.save();

      const populatedOrder = await Order.findById(order._id).populate(
        "items.product",
      );

      return res.status(201).json({
        success: true,
        message: "Order created successfully",

        priceSummary: {
          subtotal,
          shipping,
          gst,
          total: totalAmount,
        },

        order: populatedOrder,
      });
    }

    // ====================================================
    // ONLINE PAYMENT
    // ====================================================

    // IMPORTANT:
    // Stock is NOT reduced here.
    //
    // Stock will be reduced only after
    // Razorpay payment is successfully verified.

    const populatedOrder = await Order.findById(order._id).populate(
      "items.product",
    );

    return res.status(201).json({
      success: true,
      message: "Online test order created. Razorpay payment amount is ₹1.",

      priceSummary: {
        subtotal,
        shipping,
        gst,
        total: totalAmount,
      },

      order: populatedOrder,
    });
  } catch (error) {
    console.error("Create Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET MY ORDERS =================

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({
      user: userId,
    })
      .populate("items.product")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      message: "Orders fetched successfully",
      orders,
    });
  } catch (error) {
    console.error("Get My Orders Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= GET SINGLE ORDER =================

export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    }).populate("items.product");

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Order fetched successfully",
      order,
    });
  } catch (error) {
    console.error("Get Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};

// ================= CANCEL ORDER =================

export const cancelOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user._id;

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    // Only pending/confirmed orders can be cancelled
    if (!["Pending", "Confirmed"].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: "Order cannot be cancelled now",
      });
    }

    // ================= ONLINE PAYMENT =================

    if (order.paymentMethod === "ONLINE" && order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Paid online order cannot be cancelled from this API",
      });
    }

    // ================= RESTORE STOCK =================

    for (const item of order.items) {
      const product = await Product.findById(item.product);

      if (product) {
        product.stock += item.quantity;
        product.inStock = true;

        await product.save();
      }
    }

    // ================= CANCEL ORDER =================

    order.orderStatus = "Cancelled";

    await order.save();

    const updatedOrder = await Order.findById(order._id).populate(
      "items.product",
    );

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Cancel Order Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};
