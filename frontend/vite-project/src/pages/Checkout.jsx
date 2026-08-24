import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

// QR image inside:
// frontend/public/WhatsApp Image 2026-08-21 at 10.01.26 PM.jpeg
const PHONEPE_QR = "/WhatsApp Image 2026-08-21 at 10.01.26 PM.jpeg";

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // CART
  // =====================================================

  const getCheckoutCart = () => {
    try {
      if (
        location.state?.cartItems &&
        Array.isArray(location.state.cartItems) &&
        location.state.cartItems.length > 0
      ) {
        return location.state.cartItems;
      }

      const sessionCart = sessionStorage.getItem("checkoutCartItems");

      if (sessionCart) {
        const parsed = JSON.parse(sessionCart);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      const localCart = localStorage.getItem("cartItems");

      if (localCart) {
        const parsed = JSON.parse(localCart);

        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }

      return [];
    } catch (error) {
      console.error("Checkout cart error:", error);
      return [];
    }
  };

  const [cartItems] = useState(getCheckoutCart);

  // =====================================================
  // PRICE
  // =====================================================

  const subtotal =
    location.state?.subtotal !== undefined
      ? Number(location.state.subtotal)
      : cartItems.reduce(
          (total, item) =>
            total +
            Number(item.price || item.product?.price || 0) *
              Number(item.quantity || 1),
          0,
        );

  const shipping =
    location.state?.shipping !== undefined
      ? Number(location.state.shipping)
      : subtotal >= 4999
        ? 0
        : 99;

  const tax =
    location.state?.tax !== undefined
      ? Number(location.state.tax)
      : Math.round(subtotal * 0.12);

  const discount =
    location.state?.discount !== undefined
      ? Number(location.state.discount)
      : 0;

  const total =
    location.state?.total !== undefined
      ? Number(location.state.total)
      : Math.max(0, subtotal + shipping + tax - discount);

  // =====================================================
  // FORM
  // =====================================================

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "Delhi",
    pincode: "",
    paymentMethod: "UPI",
  });

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [showPhonePeQR, setShowPhonePeQR] = useState(false);

  // =====================================================
  // INPUT
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // =====================================================
  // PRODUCT HELPERS
  // =====================================================

  const getProductId = (item) => {
    return item?._id || item?.id || item?.product?._id || item?.product?.id;
  };

  const getProductName = (item) => {
    return (
      item?.name || item?.product?.name || item?.product?.title || "Product"
    );
  };

  const getProductImage = (item) => {
    return (
      item?.image ||
      item?.product?.image ||
      item?.product?.images?.[0] ||
      item?.product?.thumbnail ||
      item?.product?.photo ||
      ""
    );
  };

  // =====================================================
  // CLEAR CART
  // =====================================================

  const clearCart = () => {
    localStorage.removeItem("cartItems");
    sessionStorage.removeItem("checkoutCartItems");

    window.dispatchEvent(new Event("cartUpdated"));
  };

  // =====================================================
  // LOAD RAZORPAY
  // =====================================================

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }

      const script = document.createElement("script");

      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);

      document.body.appendChild(script);
    });
  };

  // =====================================================
  // CREATE COD ORDER
  // =====================================================

  const createCODOrder = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          paymentMethod: "COD",
        }),
      });

      const data = await response.json();

      console.log("COD ORDER RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create COD order.");
        return false;
      }

      clearCart();

      alert("🎉 Order placed successfully!");

      navigate("/orders");

      return true;
    } catch (error) {
      console.error("COD Order Error:", error);

      alert("Unable to place COD order.");

      return false;
    }
  };

  // =====================================================
  // CREATE DATABASE ONLINE ORDER
  // =====================================================

  const createDatabaseOnlineOrder = async (token) => {
    try {
      const response = await fetch(`${API_URL}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shippingAddress: {
            fullName: formData.name,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            pincode: formData.pincode,
          },
          paymentMethod: "ONLINE",
        }),
      });

      const data = await response.json();

      console.log("DATABASE ONLINE ORDER RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create online order.");
        return null;
      }

      const databaseOrder =
        data.order || data.createdOrder || data.databaseOrder;

      if (!databaseOrder) {
        console.error("Database order missing:", data);

        alert("Database order was not returned by server.");

        return null;
      }

      const databaseOrderId = databaseOrder._id || databaseOrder.id;

      if (!databaseOrderId) {
        alert("Database Order ID was not received.");

        return null;
      }

      return {
        ...databaseOrder,
        id: databaseOrderId,
      };
    } catch (error) {
      console.error("Database Online Order Error:", error);

      alert("Unable to create online order.");

      return null;
    }
  };

  // =====================================================
  // CREATE RAZORPAY ORDER
  // =====================================================

  const createRazorpayOrder = async (token, databaseOrderId) => {
    try {
      const response = await fetch(`${API_URL}/api/payment/create-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: databaseOrderId,
        }),
      });

      const data = await response.json();

      console.log("RAZORPAY ORDER RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Failed to create Razorpay order.");

        return null;
      }

      if (!data.order || !data.order.id) {
        alert("Razorpay Order ID was not received.");

        return null;
      }

      return data;
    } catch (error) {
      console.error("Razorpay Order Error:", error);

      alert("Unable to create Razorpay order.");

      return null;
    }
  };

  // =====================================================
  // VERIFY PAYMENT
  // =====================================================

  const verifyPayment = async (token, databaseOrderId, razorpayResponse) => {
    try {
      const response = await fetch(`${API_URL}/api/payment/verify-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          orderId: databaseOrderId,
          razorpay_order_id: razorpayResponse.razorpay_order_id,
          razorpay_payment_id: razorpayResponse.razorpay_payment_id,
          razorpay_signature: razorpayResponse.razorpay_signature,
        }),
      });

      const data = await response.json();

      console.log("PAYMENT VERIFY RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Payment verification failed.");

        setPaymentLoading(false);

        return false;
      }

      clearCart();

      alert("🎉 Payment Successful! Your order has been placed.");

      navigate("/orders");

      return true;
    } catch (error) {
      console.error("Payment Verification Error:", error);

      alert("Payment completed, but verification failed.");

      setPaymentLoading(false);

      return false;
    }
  };

  // =====================================================
  // OPEN RAZORPAY
  // =====================================================

  const openRazorpayCheckout = async (
    token,
    databaseOrderId,
    razorpayOrder,
  ) => {
    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

    if (!razorpayKey) {
      console.error("VITE_RAZORPAY_KEY_ID is missing");

      alert("Razorpay Key ID frontend .env mein missing hai.");

      setPaymentLoading(false);

      return;
    }

    const razorpayLoaded = await loadRazorpay();

    if (!razorpayLoaded || !window.Razorpay) {
      alert("Razorpay checkout load nahi ho paya.");

      setPaymentLoading(false);

      return;
    }

    const options = {
      key: razorpayKey,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency || "INR",

      name: "EcoShop",

      description: "EcoShop Online Order",

      order_id: razorpayOrder.id,

      prefill: {
        name: formData.name,
        email: formData.email,
        contact: formData.phone,
      },

      notes: {
        databaseOrderId,
      },

      theme: {
        color: "#2563eb",
      },

      handler: async function (razorpayResponse) {
        console.log("RAZORPAY SUCCESS:", razorpayResponse);

        await verifyPayment(token, databaseOrderId, razorpayResponse);
      },

      modal: {
        ondismiss: function () {
          console.log("Razorpay window closed");

          setPaymentLoading(false);
        },
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("RAZORPAY PAYMENT FAILED:", response);

      setPaymentLoading(false);

      alert(response.error?.description || "Payment failed. Please try again.");
    });

    razorpay.open();
  };

  // =====================================================
  // OPEN YOUR OWN QR
  // =====================================================

  const openPhonePeQR = async () => {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before placing an order.");

      navigate("/login");

      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty.");

      navigate("/shop");

      return;
    }

    try {
      setPaymentLoading(true);

      const databaseOrder = await createDatabaseOnlineOrder(token);

      if (!databaseOrder) {
        setPaymentLoading(false);

        return;
      }

      setPaymentLoading(false);

      setShowPhonePeQR(true);
    } catch (error) {
      console.error("PhonePe QR Error:", error);

      setPaymentLoading(false);

      alert("Unable to open QR.");
    }
  };

  // =====================================================
  // PHONEPE / CUSTOM QR PAYMENT DONE
  // =====================================================

  const handlePhonePePaymentDone = () => {
    alert(
      "QR payment backend se automatically verify nahi hota. Razorpay verified payment ke liye UPI option use karein.",
    );
  };

  // =====================================================
  // MAIN PAYMENT
  // =====================================================

  const handlePayment = async (e) => {
    e.preventDefault();

    console.log("PAY BUTTON CLICKED");

    if (cartItems.length === 0) {
      alert("Your cart is empty.");

      navigate("/shop");

      return;
    }

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.pincode.trim()
    ) {
      alert("Please fill all delivery details.");

      return;
    }

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Please login before placing an order.");

      navigate("/login");

      return;
    }

    try {
      setPaymentLoading(true);

      if (formData.paymentMethod === "COD") {
        await createCODOrder(token);

        setPaymentLoading(false);

        return;
      }

      if (
        formData.paymentMethod === "UPI" ||
        formData.paymentMethod === "PhonePe"
      ) {
        await openPhonePeQR();

        return;
      }

      const databaseOrder = await createDatabaseOnlineOrder(token);

      if (!databaseOrder) {
        setPaymentLoading(false);

        return;
      }

      const databaseOrderId = databaseOrder.id;

      const razorpayData = await createRazorpayOrder(token, databaseOrderId);

      if (!razorpayData) {
        setPaymentLoading(false);

        return;
      }

      await openRazorpayCheckout(token, databaseOrderId, razorpayData.order);
    } catch (error) {
      console.error("Payment Error:", error);

      alert("Unable to start payment. Please try again.");

      setPaymentLoading(false);
    }
  };

  // =====================================================
  // EMPTY CART
  // =====================================================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <div className="text-6xl mb-4">🛒</div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Your Cart is Empty
          </h1>

          <button
            onClick={() => navigate("/shop")}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700"
          >
            Go Shopping
          </button>
        </div>
      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-4">
        {/* HEADER */}

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Checkout
          </h1>

          <p className="text-gray-500 mt-2">
            Complete your order and make payment
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* =====================================================
              DELIVERY FORM
          ===================================================== */}

          <div className="lg:col-span-2">
            <form
              onSubmit={handlePayment}
              className="bg-white rounded-2xl shadow-sm p-6 md:p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                📦 Delivery Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* NAME */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>

                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* EMAIL */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>

                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PHONE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Phone Number
                  </label>

                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* PINCODE */}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pincode
                  </label>

                  <input
                    type="text"
                    name="pincode"
                    value={formData.pincode}
                    onChange={handleChange}
                    placeholder="Enter pincode"
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* ADDRESS */}

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Delivery Address
                </label>

                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Enter complete address"
                  rows="4"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* CITY */}

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  City
                </label>

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* STATE */}

              <div className="mt-5">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  State
                </label>

                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="Enter state"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* =====================================================
                  PAYMENT METHOD
              ===================================================== */}

              <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-800 mb-4">
                  💳 Payment Method
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* UPI */}

                  <label
                    className={`border rounded-xl p-4 cursor-pointer ${
                      formData.paymentMethod === "UPI"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="UPI"
                      checked={formData.paymentMethod === "UPI"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    📱 UPI
                  </label>

                  {/* CARD */}

                  <label
                    className={`border rounded-xl p-4 cursor-pointer ${
                      formData.paymentMethod === "Card"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="Card"
                      checked={formData.paymentMethod === "Card"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    💳 Card
                  </label>

                  {/* PHONEPE */}

                  <label
                    className={`border rounded-xl p-4 cursor-pointer ${
                      formData.paymentMethod === "PhonePe"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="PhonePe"
                      checked={formData.paymentMethod === "PhonePe"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    📲 PhonePe
                  </label>

                  {/* COD */}

                  <label
                    className={`border rounded-xl p-4 cursor-pointer ${
                      formData.paymentMethod === "COD"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={formData.paymentMethod === "COD"}
                      onChange={handleChange}
                      className="mr-2"
                    />
                    💵 COD
                  </label>
                </div>

                <p className="text-sm text-gray-500 mt-3">
                  UPI/PhonePe se tumhara QR code open hoga. Card se Razorpay
                  payment page open hoga.
                </p>
              </div>

              {/* =====================================================
                  PAY BUTTON
              ===================================================== */}

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full mt-8 bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paymentLoading
                  ? "Processing..."
                  : formData.paymentMethod === "COD"
                    ? `Place Order ₹${total.toLocaleString("en-IN")}`
                    : formData.paymentMethod === "PhonePe"
                      ? `Pay with PhonePe ₹${total.toLocaleString("en-IN")}`
                      : formData.paymentMethod === "UPI"
                        ? `Pay with UPI ₹${total.toLocaleString("en-IN")}`
                        : `Pay ₹${total.toLocaleString("en-IN")} →`}
              </button>

              <p className="text-center text-sm text-gray-500 mt-4">
                🔒 Your payment information is secure
              </p>
            </form>
          </div>

          {/* =====================================================
              ORDER SUMMARY
          ===================================================== */}

          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-800 mb-5">
                Order Summary
              </h2>

              <div className="space-y-4">
                {cartItems.map((item, index) => {
                  const image = getProductImage(item);

                  const productName = getProductName(item);

                  const price = Number(item.price || item.product?.price || 0);

                  const quantity = Number(item.quantity || 1);

                  return (
                    <div
                      key={`${getProductId(item)}-${index}`}
                      className="flex items-center gap-3 border-b pb-4"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                        {image &&
                        typeof image === "string" &&
                        (image.startsWith("http") ||
                          image.startsWith("/") ||
                          image.startsWith("data:")) ? (
                          <img
                            src={image}
                            alt={productName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-3xl">{image || "🛍️"}</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800 text-sm">
                          {productName}
                        </h3>

                        <p className="text-xs text-gray-500">Qty: {quantity}</p>
                      </div>

                      <span className="font-bold text-gray-800">
                        ₹{(price * quantity).toLocaleString("en-IN")}
                      </span>
                    </div>
                  );
                })}
              </div>

              <div className="space-y-3 mt-6 pt-5 border-t">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>

                  <span className="font-semibold">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>

                  <span className="font-semibold">
                    {shipping === 0 ? "FREE" : `₹${shipping}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600">GST</span>

                  <span className="font-semibold">
                    ₹{tax.toLocaleString("en-IN")}
                  </span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>

                    <span>
                      -₹
                      {discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-between border-t mt-5 pt-5">
                <span className="text-xl font-bold">Total</span>

                <span className="text-xl font-bold text-blue-600">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =====================================================
          YOUR QR MODAL
      ===================================================== */}

      {showPhonePeQR && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-3">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl p-5 sm:p-6 text-center">
            {/* HEADER */}

            <h2 className="text-2xl font-bold text-gray-800">📲 Scan & Pay</h2>

            <p className="text-sm text-gray-500 mt-1">
              Scan this QR code using any UPI app
            </p>

            {/* QR CODE */}

            <div className="flex justify-center mt-4">
              <div className="w-52 h-52 sm:w-60 sm:h-60">
                <img
                  src={PHONEPE_QR}
                  alt="UPI QR Code"
                  className="w-full h-full object-contain rounded-xl border-2 border-gray-200"
                />
              </div>
            </div>

            {/* AMOUNT */}

            <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 mt-4">
              <p className="text-sm text-gray-600">Amount to Pay</p>

              <p className="text-3xl font-bold text-blue-600 mt-1">
                ₹{total.toLocaleString("en-IN")}
              </p>
            </div>

            {/* INSTRUCTION */}

            <p className="text-xs text-gray-500 mt-3">
              Payment karne ke baad <b>I Have Paid</b> dabayein.
            </p>

            {/* BUTTONS */}

            <div className="grid grid-cols-2 gap-3 mt-4">
              {/* I HAVE PAID */}

              <button
                type="button"
                onClick={handlePhonePePaymentDone}
                disabled={paymentLoading}
                className="bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3.5 rounded-xl font-bold transition disabled:opacity-60 disabled:cursor-not-allowed"
              >
                ✅ I Have Paid
              </button>

              {/* CANCEL */}

              <button
                type="button"
                onClick={() => setShowPhonePeQR(false)}
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-100 active:bg-gray-200 py-3.5 rounded-xl font-bold transition"
              >
                ✕ Cancel
              </button>
            </div>

            {/* SECURITY NOTE */}

            <p className="text-[11px] text-gray-400 mt-3">🔒 Secure payment</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
