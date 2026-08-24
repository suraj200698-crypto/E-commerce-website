import crypto from "crypto";

import razorpay from "../config/razorpay.js";
import Order from "../models/orderModel.js";
import Cart from "../models/cartModel.js";
import Product from "../models/productModel.js";

// ======================================================
// CREATE RAZORPAY ORDER
// ======================================================

export const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const userId = req.user._id;

    // ==================================================
    // CHECK ORDER ID
    // ==================================================

    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required",
      });
    }

    // ==================================================
    // CHECK RAZORPAY KEY
    // ==================================================

    if (!process.env.RZP_TEST_KEY) {
      console.error(
        "RZP_TEST_KEY is missing in .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "Razorpay configuration error: RZP_TEST_KEY is missing",
      });
    }

    if (!process.env.RZP_TEST_SECRET) {
      console.error(
        "RZP_TEST_SECRET is missing in .env"
      );

      return res.status(500).json({
        success: false,
        message:
          "Razorpay configuration error: RZP_TEST_SECRET is missing",
      });
    }

    // ==================================================
    // FIND DATABASE ORDER
    // ==================================================

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

    // ==================================================
    // CHECK PAYMENT METHOD
    // ==================================================

    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message:
          "This order is not an online payment order",
      });
    }

    // ==================================================
    // CHECK PAYMENT STATUS
    // ==================================================

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message: "Order is already paid",
      });
    }

    // ==================================================
    // CHECK AMOUNT
    // ==================================================

    if (
      !order.totalAmount ||
      Number(order.totalAmount) <= 0
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid order amount",
      });
    }

    // ==================================================
    // RAZORPAY OPTIONS
    // ==================================================

    const options = {
      amount: Math.round(
        Number(order.totalAmount) * 100
      ),

      currency: "INR",

      receipt: `order_${order._id}`,
    };

    console.log(
      "Creating Razorpay order with options:",
      options
    );

    // ==================================================
    // CREATE RAZORPAY ORDER
    // ==================================================

    const razorpayOrder =
      await razorpay.orders.create(options);

    console.log(
      "Razorpay order created:",
      razorpayOrder
    );

    // ==================================================
    // SAVE RAZORPAY ORDER ID
    // ==================================================

    order.razorpayOrderId =
      razorpayOrder.id;

    await order.save();

    // ==================================================
    // SEND RESPONSE
    // ==================================================

    return res.status(201).json({
      success: true,

      message:
        "Razorpay order created successfully",

      // IMPORTANT:
      // Frontend Razorpay Checkout ko key_id chahiye.
      order: {
        id: razorpayOrder.id,

        entity: razorpayOrder.entity,

        amount: razorpayOrder.amount,

        amount_paid:
          razorpayOrder.amount_paid,

        amount_due:
          razorpayOrder.amount_due,

        currency:
          razorpayOrder.currency,

        receipt:
          razorpayOrder.receipt,

        status:
          razorpayOrder.status,

        key_id:
          process.env.RZP_TEST_KEY,
      },

      databaseOrder: {
        id: order._id,

        totalAmount:
          order.totalAmount,

        paymentMethod:
          order.paymentMethod,

        paymentStatus:
          order.paymentStatus,
      },
    });
  } catch (error) {
    console.error(
      "Razorpay Order Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Failed to create Razorpay order",

      error:
        error.message,
    });
  }
};

// ======================================================
// VERIFY RAZORPAY PAYMENT
// ======================================================

export const verifyRazorpayPayment = async (
  req,
  res
) => {
  try {
    const {
      orderId,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const userId = req.user._id;

    // ==================================================
    // VALIDATE DATA
    // ==================================================

    if (
      !orderId ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Order ID and payment details are required",
      });
    }

    // ==================================================
    // FIND DATABASE ORDER
    // ==================================================

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

    // ==================================================
    // CHECK ONLINE PAYMENT
    // ==================================================

    if (order.paymentMethod !== "ONLINE") {
      return res.status(400).json({
        success: false,
        message:
          "This order is not an online payment order",
      });
    }

    // ==================================================
    // CHECK ALREADY PAID
    // ==================================================

    if (order.paymentStatus === "Paid") {
      return res.status(400).json({
        success: false,
        message:
          "Order payment is already completed",
      });
    }

    // ==================================================
    // CHECK RAZORPAY ORDER ID
    // ==================================================

    if (
      order.razorpayOrderId &&
      order.razorpayOrderId !==
        razorpay_order_id
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay order does not match database order",
      });
    }

    // ==================================================
    // FETCH RAZORPAY ORDER
    // ==================================================

    const razorpayOrder =
      await razorpay.orders.fetch(
        razorpay_order_id
      );

    if (!razorpayOrder) {
      return res.status(400).json({
        success: false,
        message:
          "Razorpay order not found",
      });
    }

    // ==================================================
    // CHECK AMOUNT
    // ==================================================

    const expectedAmount =
      Math.round(
        Number(order.totalAmount) * 100
      );

    if (
      Number(razorpayOrder.amount) !==
      expectedAmount
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment amount does not match order amount",
      });
    }

    // ==================================================
    // GENERATE SIGNATURE
    // ==================================================

    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RZP_TEST_SECRET
        )
        .update(
          `${razorpay_order_id}|${razorpay_payment_id}`
        )
        .digest("hex");

    // ==================================================
    // CHECK SIGNATURE LENGTH
    // ==================================================

    if (
      generatedSignature.length !==
      razorpay_signature.length
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed",
      });
    }

    // ==================================================
    // COMPARE SIGNATURE
    // ==================================================

    const signatureMatch =
      crypto.timingSafeEqual(
        Buffer.from(
          generatedSignature
        ),
        Buffer.from(
          razorpay_signature
        )
      );

    if (!signatureMatch) {
      return res.status(400).json({
        success: false,
        message:
          "Payment verification failed",
      });
    }

    // ==================================================
    // CHECK STOCK AGAIN
    // ==================================================

    for (const item of order.items) {
      const product =
        await Product.findById(
          item.product
        );

      if (!product) {
        return res.status(404).json({
          success: false,
          message:
            "Product not found",
        });
      }

      if (
        !product.inStock ||
        product.stock < item.quantity
      ) {
        return res.status(400).json({
          success: false,
          message:
            `${product.name} is out of stock or has insufficient stock`,
        });
      }
    }

    // ==================================================
    // REDUCE STOCK
    // ==================================================

    for (const item of order.items) {
      const product =
        await Product.findById(
          item.product
        );

      if (product) {
        product.stock -=
          item.quantity;

        if (product.stock <= 0) {
          product.stock = 0;

          product.inStock = false;
        }

        await product.save();
      }
    }

    // ==================================================
    // UPDATE ORDER
    // ==================================================

    order.paymentStatus = "Paid";

    order.orderStatus =
      "Confirmed";

    order.razorpayOrderId =
      razorpay_order_id;

    order.razorpayPaymentId =
      razorpay_payment_id;

    await order.save();

    // ==================================================
    // CLEAR CART
    // ==================================================

    const cart =
      await Cart.findOne({
        user: userId,
      });

    if (cart) {
      cart.items = [];

      await cart.save();
    }

    // ==================================================
    // GET UPDATED ORDER
    // ==================================================

    const updatedOrder =
      await Order.findById(
        order._id
      ).populate(
        "items.product"
      );

    // ==================================================
    // SUCCESS
    // ==================================================

    return res.status(200).json({
      success: true,

      message:
        "Payment verified successfully",

      payment: {
        razorpay_order_id:
          razorpay_order_id,

        razorpay_payment_id:
          razorpay_payment_id,
      },

      order: updatedOrder,
    });
  } catch (error) {
    console.error(
      "Razorpay Payment Verification Error:",
      error
    );

    return res.status(500).json({
      success: false,

      message:
        "Payment verification failed",

      error:
        error.message,
    });
  }
};