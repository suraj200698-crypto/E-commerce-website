// src/pages/Cart.jsx

import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8000";

const Cart = () => {
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(false);

  // =========================================================
  // GET TOKEN
  // =========================================================

  const getToken = () => {
    return localStorage.getItem("token");
  };

  // =========================================================
  // CONVERT BACKEND CART TO FRONTEND CART
  // =========================================================

  const formatCartItems = (backendItems = []) => {
    return backendItems.map((item) => {
      const product = item.product || {};

      return {
        id: product._id || product.id || item.product,
        _id: product._id || product.id || item.product,

        productId: product._id || product.id || item.product,

        name: product.name || "Product",

        price: Number(product.price || 0),

        quantity: Number(item.quantity || 1),

        image:
          product.image ||
          product.imageUrl ||
          product.thumbnail ||
          product.images?.[0] ||
          "🛍️",

        size: product.size || item.size || "",
      };
    });
  };

  // =========================================================
  // GET BACKEND CART
  // =========================================================

  const fetchBackendCart = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);

      try {
        const savedCart = localStorage.getItem("cartItems");

        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (error) {
        console.error("Local cart error:", error);
      }

      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("BACKEND CART RESPONSE:", data);

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to fetch cart");
      }

      const backendItems = data.cart?.items || [];

      if (backendItems.length === 0) {
        await syncLocalCartToBackend();
        return;
      }

      const formattedItems = formatCartItems(backendItems);

      setCartItems(formattedItems);

      localStorage.setItem("cartItems", JSON.stringify(formattedItems));

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Fetch Cart Error:", error);

      try {
        const savedCart = localStorage.getItem("cartItems");

        if (savedCart) {
          setCartItems(JSON.parse(savedCart));
        }
      } catch (localError) {
        console.error("Local cart fallback error:", localError);
      }
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // SYNC LOCAL CART -> BACKEND
  // =========================================================

  const syncLocalCartToBackend = async () => {
    const token = getToken();

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const savedCart = localStorage.getItem("cartItems");

      if (!savedCart) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      const localItems = JSON.parse(savedCart);

      if (!Array.isArray(localItems) || localItems.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      console.log("SYNCING LOCAL CART TO BACKEND:", localItems);

      for (const item of localItems) {
        const productId = item.productId || item._id || item.id;

        if (!productId) {
          console.warn(
            "Skipping cart item because product ID is missing:",
            item,
          );

          continue;
        }

        const quantity = Number(item.quantity || 1);

        const response = await fetch(`${API_URL}/api/cart/add`, {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },

          body: JSON.stringify({
            productId,
            quantity,
          }),
        });

        const data = await response.json();

        console.log(`SYNC PRODUCT ${productId}:`, data);

        if (!response.ok || !data.success) {
          console.error("Failed to sync product:", item, data);
        }
      }

      const response = await fetch(`${API_URL}/api/cart`, {
        method: "GET",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("CART AFTER SYNC:", data);

      if (response.ok && data.success) {
        const formattedItems = formatCartItems(data.cart?.items || []);

        setCartItems(formattedItems);

        localStorage.setItem("cartItems", JSON.stringify(formattedItems));

        window.dispatchEvent(new Event("cartUpdated"));
      }
    } catch (error) {
      console.error("Sync Local Cart Error:", error);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD CART
  // =========================================================

  useEffect(() => {
    fetchBackendCart();
  }, []);

  // =========================================================
  // SAVE LOCAL CART
  // =========================================================

  useEffect(() => {
    if (!loading) {
      localStorage.setItem("cartItems", JSON.stringify(cartItems));

      window.dispatchEvent(new Event("cartUpdated"));
    }
  }, [cartItems, loading]);

  // =========================================================
  // CALCULATIONS
  // =========================================================

  const subtotal = cartItems.reduce(
    (total, item) =>
      total + Number(item.price || 0) * Number(item.quantity || 1),
    0,
  );

  // =========================================================
  // ₹1 TEST PAYMENT
  // =========================================================
  // Testing ke liye shipping FREE rakhi gayi hai.

  const shipping = 0;

  // Testing ke liye GST 0 rakha gaya hai.

  const tax = 0;

  const discount = couponApplied ? Math.round(subtotal * 0.1) : 0;

  const total = Math.max(0, subtotal + shipping + tax - discount);

  const totalItems = cartItems.reduce(
    (total, item) => total + Number(item.quantity || 1),
    0,
  );

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateQuantity = async (item, newQuantity) => {
    if (newQuantity < 1) return;

    const token = getToken();

    const productId = item.productId || item._id || item.id;

    if (!token || !productId) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/update/${productId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({
          quantity: newQuantity,
        }),
      });

      const data = await response.json();

      console.log("UPDATE CART RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to update quantity");

        return;
      }

      const formattedItems = formatCartItems(data.cart?.items || []);

      setCartItems(formattedItems);
    } catch (error) {
      console.error("Update Quantity Error:", error);

      alert("Unable to update cart.");
    }
  };

  // =========================================================
  // INCREASE
  // =========================================================

  const increaseQuantity = (item) => {
    updateQuantity(item, Number(item.quantity || 1) + 1);
  };

  // =========================================================
  // DECREASE
  // =========================================================

  const decreaseQuantity = (item) => {
    const currentQuantity = Number(item.quantity || 1);

    if (currentQuantity <= 1) {
      return;
    }

    updateQuantity(item, currentQuantity - 1);
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeItem = async (item) => {
    const token = getToken();

    const productId = item.productId || item._id || item.id;

    if (!token || !productId) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/remove/${productId}`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("REMOVE CART RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to remove product");

        return;
      }

      const formattedItems = formatCartItems(data.cart?.items || []);

      setCartItems(formattedItems);
    } catch (error) {
      console.error("Remove Item Error:", error);

      alert("Unable to remove product.");
    }
  };

  // =========================================================
  // CLEAR CART
  // =========================================================

  const clearCart = async () => {
    const confirmClear = window.confirm(
      "Are you sure you want to clear your cart?",
    );

    if (!confirmClear) {
      return;
    }

    const token = getToken();

    if (!token) {
      setCartItems([]);

      localStorage.removeItem("cartItems");

      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/cart/clear`, {
        method: "DELETE",

        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      console.log("CLEAR CART RESPONSE:", data);

      if (!response.ok || !data.success) {
        alert(data.message || "Unable to clear cart");

        return;
      }

      setCartItems([]);

      localStorage.removeItem("cartItems");

      window.dispatchEvent(new Event("cartUpdated"));
    } catch (error) {
      console.error("Clear Cart Error:", error);

      alert("Unable to clear cart.");
    }
  };

  // =========================================================
  // COUPON
  // =========================================================

  const applyCoupon = () => {
    const code = coupon.trim().toUpperCase();

    if (code === "SAVE10") {
      setCouponApplied(true);

      alert("🎉 10% discount applied!");
    } else {
      setCouponApplied(false);

      alert("❌ Invalid coupon. Try SAVE10");
    }
  };

  // =========================================================
  // REMOVE COUPON
  // =========================================================

  const removeCoupon = () => {
    setCoupon("");
    setCouponApplied(false);
  };

  // =========================================================
  // CHECKOUT
  // =========================================================

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert("Your cart is empty.");
      return;
    }

    navigate("/checkout", {
      state: {
        cartItems,
        subtotal,
        shipping,
        tax,
        discount,
        total,
      },
    });
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-2xl shadow text-center">
          <div className="text-4xl mb-4">🛒</div>

          <h2 className="text-xl font-bold text-gray-800">Loading Cart...</h2>

          <p className="text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY CART
  // =========================================================

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-10 md:p-16 text-center max-w-lg w-full">
          <div className="w-28 h-28 mx-auto mb-6 bg-blue-50 rounded-full flex items-center justify-center">
            <span className="text-6xl">🛒</span>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-3">
            Your Cart is Empty
          </h1>

          <p className="text-gray-500 mb-8 leading-relaxed">
            You haven't added any products to your cart yet. Explore our shop
            and find something you love.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center justify-center bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-blue-700 transition shadow-lg"
          >
            🛍️ Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  // =========================================================
  // MAIN CART
  // =========================================================

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* HEADER */}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
              Shopping Cart
            </h1>

            <p className="text-gray-500 mt-2">
              {totalItems} {totalItems === 1 ? "item" : "items"} in your cart
            </p>
          </div>

          <Link
            to="/shop"
            className="text-blue-600 font-semibold hover:text-blue-800 transition"
          >
            ← Continue Shopping
          </Link>
        </div>

        {/* MAIN GRID */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* PRODUCTS */}

          <div className="lg:col-span-2 space-y-5">
            {cartItems.map((item) => {
              const productId = item.productId || item._id || item.id;

              return (
                <div
                  key={productId}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-6 hover:shadow-md transition"
                >
                  <div className="flex flex-col sm:flex-row gap-5">
                    {/* IMAGE */}

                    <div className="w-full sm:w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0">
                      {typeof item.image === "string" &&
                      (item.image.startsWith("http") ||
                        item.image.startsWith("/") ||
                        item.image.startsWith("data:")) ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-5xl">{item.image || "🛍️"}</span>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="flex-1">
                      <div className="flex justify-between gap-4">
                        <div>
                          <h2 className="text-lg font-bold text-gray-800">
                            {item.name}
                          </h2>

                          {item.size && (
                            <p className="text-sm text-gray-500 mt-1">
                              Size: {item.size}
                            </p>
                          )}

                          <p className="text-blue-600 font-bold text-lg mt-2">
                            ₹{Number(item.price || 0).toLocaleString("en-IN")}
                          </p>
                        </div>

                        <button
                          onClick={() => removeItem(item)}
                          className="text-red-500 hover:text-red-700 text-sm font-semibold"
                        >
                          Remove
                        </button>
                      </div>

                      {/* BOTTOM */}

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-5">
                        {/* QUANTITY */}

                        <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden w-fit">
                          <button
                            onClick={() => decreaseQuantity(item)}
                            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 transition"
                          >
                            −
                          </button>

                          <span className="w-12 text-center font-bold">
                            {item.quantity || 1}
                          </span>

                          <button
                            onClick={() => increaseQuantity(item)}
                            className="w-10 h-10 flex items-center justify-center text-xl hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                        </div>

                        {/* ITEM TOTAL */}

                        <div>
                          <span className="text-sm text-gray-500">
                            Item Total
                          </span>

                          <p className="font-bold text-gray-800 text-lg">
                            ₹
                            {(
                              Number(item.price || 0) *
                              Number(item.quantity || 1)
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* CLEAR */}

            <div className="flex justify-end">
              <button
                onClick={clearCart}
                className="text-red-500 hover:text-red-700 font-semibold text-sm"
              >
                🗑️ Clear Cart
              </button>
            </div>
          </div>

          {/* SUMMARY */}

          <div>
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                Order Summary
              </h2>

              {/* COUPON */}

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Have a Coupon?
                </label>

                {!couponApplied ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coupon}
                      onChange={(e) => setCoupon(e.target.value)}
                      placeholder="Enter SAVE10"
                      className="flex-1 min-w-0 border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                    />

                    <button
                      onClick={applyCoupon}
                      className="bg-gray-800 text-white px-4 py-2 rounded-lg font-semibold hover:bg-black transition"
                    >
                      Apply
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
                    <span className="text-green-700 font-semibold text-sm">
                      ✓ SAVE10 Applied
                    </span>

                    <button
                      onClick={removeCoupon}
                      className="text-red-500 text-sm font-semibold"
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>

              {/* PRICE */}

              <div className="space-y-4 border-b border-gray-200 pb-5">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>

                  <span className="font-semibold text-gray-800">
                    ₹{subtotal.toLocaleString("en-IN")}
                  </span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>

                  <span className="font-semibold text-gray-800">FREE</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>GST (Test)</span>

                  <span className="font-semibold text-gray-800">₹0</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>

                    <span className="font-semibold">
                      -₹
                      {discount.toLocaleString("en-IN")}
                    </span>
                  </div>
                )}
              </div>

              {/* TOTAL */}

              <div className="flex justify-between items-center mt-5 mb-6">
                <span className="text-xl font-bold text-gray-800">Total</span>

                <span className="text-2xl font-bold text-blue-600">
                  ₹{total.toLocaleString("en-IN")}
                </span>
              </div>

              {/* CHECKOUT */}

              <button
                onClick={handleCheckout}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-100"
              >
                Proceed to Checkout →
              </button>

              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 mt-4">
                🔒 Secure Checkout
              </div>

              <div className="mt-5 pt-5 border-t">
                <p className="text-xs text-gray-500 text-center mb-3">
                  We Accept
                </p>

                <div className="flex justify-center gap-3 text-xl">
                  💳 📱 🏦 💵
                </div>
              </div>

              <Link
                to="/shop"
                className="block text-center text-blue-600 font-semibold text-sm mt-5 hover:underline"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};  

export default Cart;
