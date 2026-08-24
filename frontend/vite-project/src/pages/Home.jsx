import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import HeroSection from "../components/HeroSection";
import ProductGrid from "../components/ProductGrid";
import NewsletterSection from "../components/NewsletterSection";

const Home = () => {
  const navigate = useNavigate();

  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  // ================= LOAD PRODUCTS FROM BACKEND =================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch("http://localhost:8000/api/products");

        const data = await response.json();

        if (data.success) {
          // MongoDB _id ko frontend id mein convert kar rahe hain
          const formattedProducts = data.products.map((product) => ({
            ...product,
            id: product._id,
          }));

          // FEATURED PRODUCTS
          setFeaturedProducts(
            formattedProducts
              .filter((product) => product.isBestSeller || product.isNew)
              .slice(0, 8),
          );

          // BEST SELLERS
          setBestSellers(
            formattedProducts
              .filter((product) => product.isBestSeller)
              .slice(0, 8),
          );

          // NEW ARRIVALS
          setNewArrivals(
            formattedProducts.filter((product) => product.isNew).slice(0, 8),
          );
        } else {
          console.error("Failed to load products");
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ================= VIEW ALL =================

  const handleViewAll = () => {
    navigate("/shop");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
      <HeroSection />

      {/* FEATURES */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-3 rounded-full">✓</div>

              <div>
                <p className="font-semibold text-gray-800">Quality Products</p>

                <p className="text-sm text-gray-500">100% genuine items</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-green-100 p-3 rounded-full">⏱</div>

              <div>
                <p className="font-semibold text-gray-800">Fast Delivery</p>

                <p className="text-sm text-gray-500">Within 24-48 hours</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-3 rounded-full">🔒</div>

              <div>
                <p className="font-semibold text-gray-800">Secure Payment</p>

                <p className="text-sm text-gray-500">Protected transactions</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-orange-100 p-3 rounded-full">↻</div>

              <div>
                <p className="font-semibold text-gray-800">Easy Returns</p>

                <p className="text-sm text-gray-500">30-day return policy</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FEATURED ================= */}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">
                Featured Products
              </h2>

              <p className="text-gray-500 mt-1">Handpicked just for you</p>
            </div>

            <button
              onClick={handleViewAll}
              className="text-blue-600 font-semibold hover:text-blue-800 flex items-center gap-1"
            >
              View All →
            </button>
          </div>

          {loading ? (
            <LoadingGrid />
          ) : (
            <ProductGrid products={featuredProducts} />
          )}
        </div>
      </section>

      {/* ================= BEST SELLERS ================= */}

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">Best Sellers</h2>

              <p className="text-gray-500 mt-1">Most popular products</p>
            </div>

            <button
              onClick={handleViewAll}
              className="text-blue-600 font-semibold hover:text-blue-800"
            >
              View All →
            </button>
          </div>

          {loading ? <LoadingGrid /> : <ProductGrid products={bestSellers} />}
        </div>
      </section>

      {/* ================= NEW ARRIVALS ================= */}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-800">New Arrivals</h2>

              <p className="text-gray-500 mt-1">Fresh products just added</p>
            </div>

            <button
              onClick={handleViewAll}
              className="text-blue-600 font-semibold hover:text-blue-800"
            >
              View All →
            </button>
          </div>

          {loading ? <LoadingGrid /> : <ProductGrid products={newArrivals} />}
        </div>
      </section>

      {/* ================= SALE BANNER ================= */}

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-8 md:p-12 text-white">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl md:text-4xl font-bold mb-3">
                  Summer Sale!
                  <span className="block text-yellow-300">Up to 70% Off</span>
                </h3>

                <p className="text-blue-100 mb-4">
                  Don't miss out on our biggest sale of the year.
                </p>

                <button
                  onClick={handleViewAll}
                  className="bg-yellow-400 text-gray-900 px-8 py-3 rounded-lg font-semibold hover:bg-yellow-300"
                >
                  Shop Now
                </button>
              </div>

              <div className="hidden md:block text-right">
                <div className="text-6xl">🔥</div>

                <p className="text-2xl font-bold mt-2">HOT DEALS</p>

                <p className="text-blue-200">Limited stock available</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <NewsletterSection />
    </div>
  );
};

// ================= LOADING =================

const LoadingGrid = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse"
        >
          <div className="aspect-square bg-gray-200"></div>

          <div className="p-4 space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>

            <div className="h-4 bg-gray-200 rounded w-1/2"></div>

            <div className="h-8 bg-gray-200 rounded w-full"></div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Home;
