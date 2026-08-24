import React from "react";
import { useNavigate } from "react-router-dom";

const ProductCard = ({
  id,
  name,
  price,
  originalPrice,
  image,
  rating,
  reviews,
  discount,
  isNew,
  isBestSeller,
  inStock = true,
  isWishlisted,
  onToggleWishlist,
}) => {
  const navigate = useNavigate();

  // ================= ADD TO CART =================
  const addToCart = () => {
    if (!inStock) {
      alert("❌ This product is out of stock.");
      return;
    }

    const existingCart =
      JSON.parse(localStorage.getItem("cartItems")) || [];

    const product = {
      id,
      name,
      price: Number(price),
      image,
      quantity: 1,
      size: "Standard",
    };

    const existingProduct = existingCart.find(
      (item) => item.id === id
    );

    let updatedCart;

    if (existingProduct) {
      updatedCart = existingCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number(item.quantity || 1) + 1,
            }
          : item
      );
    } else {
      updatedCart = [...existingCart, product];
    }

    localStorage.setItem(
      "cartItems",
      JSON.stringify(updatedCart)
    );

    window.dispatchEvent(new Event("cartUpdated"));

    alert("🛒 Product added to cart!");
  };

  // ================= BUY NOW =================
  const handleBuyNow = () => {
    if (!inStock) {
      alert("❌ This product is out of stock.");
      return;
    }

    const product = {
      id,
      name,
      price: Number(price),
      image,
      quantity: 1,
      size: "Standard",
    };

    localStorage.setItem(
      "buyNowProduct",
      JSON.stringify(product)
    );

    navigate("/payment");
  };

  // ================= PRODUCT DETAILS =================
  const handleProductClick = () => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition duration-300 group">

      {/* ================= IMAGE ================= */}
      <div className="relative">

        <div
          className="h-64 bg-gray-100 overflow-hidden cursor-pointer"
          onClick={handleProductClick}
        >
          <img
            src={image}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
        </div>

        {/* NEW BADGE */}
        {isNew && (
          <span className="absolute top-3 left-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            NEW
          </span>
        )}

        {/* BEST SELLER BADGE */}
        {isBestSeller && (
          <span className="absolute top-3 right-3 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
            BEST SELLER
          </span>
        )}

        {/* OUT OF STOCK */}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold">
              OUT OF STOCK
            </span>
          </div>
        )}
      </div>

      {/* ================= DETAILS ================= */}
      <div className="p-5">

        {/* PRODUCT NAME */}
        <h2
          onClick={handleProductClick}
          className="text-lg font-bold text-gray-800 min-h-[56px] cursor-pointer hover:text-blue-600 transition"
        >
          {name}
        </h2>

        {/* ================= RATING ================= */}
        <div className="flex items-center gap-2 mt-2">
          <span className="text-yellow-500">
            ★★★★★
          </span>

          <span className="text-sm text-gray-500">
            ({reviews || 0})
          </span>
        </div>

        {/* ================= PRICE ================= */}
        <div className="flex items-center gap-3 mt-3 flex-wrap">

          <span className="text-xl font-bold text-blue-600">
            ${Number(price).toFixed(2)}
          </span>

          {originalPrice && (
            <span className="text-sm text-gray-400 line-through">
              ${Number(originalPrice).toFixed(2)}
            </span>
          )}

          {discount && (
            <span className="text-xs font-bold text-green-600">
              {discount}% OFF
            </span>
          )}

        </div>

        {/* ================= BUTTONS ================= */}
        <div className="grid grid-cols-2 gap-3 mt-5">

          {/* ADD CART */}
          <button
            onClick={addToCart}
            disabled={!inStock}
            className="border-2 border-blue-600 text-blue-600 py-3 rounded-xl font-bold hover:bg-blue-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            🛒 Add Cart
          </button>

          {/* BUY NOW */}
          <button
            onClick={handleBuyNow}
            disabled={!inStock}
            className="bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            ⚡ Buy Now
          </button>

        </div>

        {/* ================= WISHLIST ================= */}
        <button
          onClick={onToggleWishlist}
          className={`w-full mt-3 py-2 transition ${
            isWishlisted
              ? "text-red-500 font-semibold"
              : "text-gray-500 hover:text-red-500"
          }`}
        >
          {isWishlisted
            ? "❤️ Wishlisted"
            : "♡ Add to Wishlist"}
        </button>

      </div>
    </div>
  );
};

export default ProductCard;