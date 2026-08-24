import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-12">

      <div className="max-w-7xl mx-auto px-6 py-10">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* About */}
          <div>
            <h2 className="text-xl font-bold mb-4">
              E-Commerce
            </h2>

            <p className="text-gray-400">
              Welcome to our online shopping store.
              Find quality products at the best prices.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2">

              <Link
                to="/"
                className="text-gray-400 hover:text-white"
              >
                Home
              </Link>

              <Link
                to="/shop"
                className="text-gray-400 hover:text-white"
              >
                Shop
              </Link>

              <Link
                to="/cart"
                className="text-gray-400 hover:text-white"
              >
                Cart
              </Link>

            </div>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-4">
              Contact Us
            </h3>

            <p className="text-gray-400">
              Email: support@ecommerce.com
            </p>

            <p className="text-gray-400 mt-2">
              Phone: +91 9876543210
            </p>
          </div>

        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center">

          <p className="text-gray-400">
            © 2026 E-Commerce. All Rights Reserved.
          </p>

        </div>

      </div>

    </footer>
  );
};

export default Footer;