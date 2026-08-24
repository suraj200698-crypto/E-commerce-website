import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [processing, setProcessing] = useState(false);

  // ================= LOAD BUY NOW PRODUCT =================
  useEffect(() => {
    const savedProduct =
      localStorage.getItem("buyNowProduct");

    if (!savedProduct) {
      navigate("/shop");
      return;
    }

    try {
      setProduct(JSON.parse(savedProduct));
    } catch (error) {
      console.error("Product loading error:", error);
      navigate("/shop");
    }
  }, [navigate]);

  // ================= PAYMENT =================
  const handlePayment = () => {
    if (!product) return;

    setProcessing(true);

    // Demo payment processing
    setTimeout(() => {

      // Existing cart
      const existingCart =
        JSON.parse(localStorage.getItem("cartItems")) || [];

      // Check whether product already exists
      const existingProduct = existingCart.find(
        (item) => item.id === product.id
      );

      let updatedCart;

      if (existingProduct) {
        updatedCart = existingCart.map((item) =>
          item.id === product.id
            ? {
                ...item,
                quantity:
                  Number(item.quantity || 1) +
                  Number(product.quantity || 1),
              }
            : item
        );
      } else {
        updatedCart = [
          ...existingCart,
          {
            ...product,
            quantity: Number(product.quantity || 1),
          },
        ];
      }

      // Save cart
      localStorage.setItem(
        "cartItems",
        JSON.stringify(updatedCart)
      );

      // Navbar update
      window.dispatchEvent(new Event("cartUpdated"));

      // BuyNow temporary data remove
      localStorage.removeItem("buyNowProduct");

      alert("🎉 Payment Successful!\nProduct added to your cart.");

      setProcessing(false);

      // Cart page
      navigate("/cart");

    }, 1500);
  };

  // ================= LOADING =================
  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-semibold text-gray-600">
          Loading payment...
        </p>
      </div>
    );
  }

  // ================= TOTAL =================
  const price =
    Number(product.price || 0) *
    Number(product.quantity || 1);

  const shipping = price >= 4999 ? 0 : 99;

  const tax = Math.round(price * 0.12);

  const total = price + shipping + tax;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">

      <div className="max-w-5xl mx-auto">

        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Secure Payment
          </h1>

          <p className="text-gray-500 mt-2">
            Complete your payment to place your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* ================= PRODUCT ================= */}
          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-5">
              Your Product
            </h2>

            <div className="flex gap-5 items-center">

              <div className="w-28 h-28 rounded-xl bg-gray-100 overflow-hidden flex items-center justify-center">

                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-5xl">
                    🛍️
                  </span>
                )}

              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {product.name}
                </h3>

                <p className="text-gray-500 mt-1">
                  Quantity: {product.quantity}
                </p>

                <p className="text-blue-600 font-bold text-xl mt-2">
                  ${Number(product.price).toFixed(2)}
                </p>
              </div>

            </div>

            {/* PRICE */}
            <div className="border-t mt-6 pt-5 space-y-3">

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Product Price
                </span>

                <span className="font-semibold">
                  ${price.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  Shipping
                </span>

                <span className="font-semibold">
                  {shipping === 0
                    ? "FREE"
                    : `$${shipping.toFixed(2)}`}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">
                  GST (12%)
                </span>

                <span className="font-semibold">
                  ${tax.toFixed(2)}
                </span>
              </div>

              <div className="border-t pt-4 flex justify-between">

                <span className="text-xl font-bold">
                  Total
                </span>

                <span className="text-2xl font-bold text-blue-600">
                  ${total.toFixed(2)}
                </span>

              </div>

            </div>

          </div>

          {/* ================= PAYMENT ================= */}
          <div className="bg-white rounded-2xl shadow-md p-6">

            <h2 className="text-xl font-bold text-gray-800 mb-6">
              Select Payment Method
            </h2>

            {/* UPI */}
            <label className="flex items-center gap-3 border rounded-xl p-4 mb-3 cursor-pointer hover:border-blue-500">

              <input
                type="radio"
                value="upi"
                checked={paymentMethod === "upi"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <span className="font-semibold">
                📱 UPI
              </span>

            </label>

            {/* CARD */}
            <label className="flex items-center gap-3 border rounded-xl p-4 mb-3 cursor-pointer hover:border-blue-500">

              <input
                type="radio"
                value="card"
                checked={paymentMethod === "card"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <span className="font-semibold">
                💳 Credit / Debit Card
              </span>

            </label>

            {/* COD */}
            <label className="flex items-center gap-3 border rounded-xl p-4 mb-6 cursor-pointer hover:border-blue-500">

              <input
                type="radio"
                value="cod"
                checked={paymentMethod === "cod"}
                onChange={(e) =>
                  setPaymentMethod(e.target.value)
                }
              />

              <span className="font-semibold">
                💵 Cash on Delivery
              </span>

            </label>

            {/* PAYMENT INPUT */}
            {paymentMethod === "upi" && (
              <input
                type="text"
                placeholder="Enter UPI ID"
                className="w-full border border-gray-300 rounded-xl px-4 py-3 mb-5 outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}

            {paymentMethod === "card" && (
              <div className="space-y-3 mb-5">

                <input
                  type="text"
                  placeholder="Card Number"
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                />

                <div className="grid grid-cols-2 gap-3">

                  <input
                    type="text"
                    placeholder="MM / YY"
                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                  <input
                    type="password"
                    placeholder="CVV"
                    className="border border-gray-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
                  />

                </div>

              </div>
            )}

            {/* PAY BUTTON */}
            <button
              onClick={handlePayment}
              disabled={processing}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:bg-gray-400"
            >
              {processing
                ? "Processing Payment..."
                : `Pay $${total.toFixed(2)}`}
            </button>

            <p className="text-center text-gray-500 text-sm mt-4">
              🔒 Your payment information is secure.
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Payment;