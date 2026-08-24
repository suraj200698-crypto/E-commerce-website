import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);

  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();

    if (search.trim()) {
      navigate(`/shop?search=${encodeURIComponent(search)}`);
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4">

        <div className="h-20 flex items-center justify-between gap-6">

          {/* LOGO */}
          <Link
            to="/"
            className="flex items-center gap-2 flex-shrink-0"
          >
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
              E
            </div>

            <span className="text-2xl font-bold text-gray-800">
              Eco<span className="text-blue-600">Shop</span>
            </span>
          </Link>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-7">

            <Link
              to="/"
              className="text-gray-700 font-medium hover:text-blue-600 transition"
            >
              Home
            </Link>

            <Link
              to="/shop"
              className="text-gray-700 font-medium hover:text-blue-600 transition"
            >
              Shop
            </Link>

            <Link
              to="/dashboard"
              className="text-gray-700 font-medium hover:text-blue-600 transition"
            >
              Dashboard
            </Link>

            <Link
              to="/cart"
              className="text-gray-700 font-medium hover:text-blue-600 transition"
            >
              🛒 Cart
            </Link>

          </div>

          {/* SEARCH */}
          <form
            onSubmit={handleSearch}
            className="hidden md:flex flex-1 max-w-md"
          >
            <div className="relative w-full">

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-full py-2.5 pl-5 pr-12 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-9 h-9 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                🔍
              </button>

            </div>
          </form>

          {/* AUTH BUTTONS */}
          <div className="hidden md:flex items-center gap-3">

            <Link
              to="/login"
              className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:border-blue-600 hover:text-blue-600 transition"
            >
              Login
            </Link>

            <Link
              to="/signup"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition shadow-sm"
            >
              Sign Up
            </Link>

          </div>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="lg:hidden text-2xl text-gray-700"
          >
            ☰
          </button>

        </div>

        {/* MOBILE MENU */}
        {menuOpen && (
          <div className="lg:hidden pb-5 space-y-3">

            {/* Mobile Search */}
            <form onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </form>

            <Link
              to="/"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              Home
            </Link>

            <Link
              to="/shop"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              Shop
            </Link>

            <Link
              to="/dashboard"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              Dashboard
            </Link>

            <Link
              to="/cart"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 hover:bg-gray-100 rounded-lg"
            >
              🛒 Cart
            </Link>

            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 border rounded-lg text-center"
            >
              Login
            </Link>

            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              className="block px-4 py-2 bg-blue-600 text-white rounded-lg text-center"
            >
              Sign Up
            </Link>

          </div>
        )}

      </div>
    </nav>
  );
};

export default Navbar;