import React, { useState, useEffect } from "react";
import ProductGrid from "../components/ProductGrid";

// =====================================================
// LIVE BACKEND URL
// =====================================================

const API_URL = "https://e-commerce-website-i3qw.onrender.com";

const Shop = ({
  onAddToCart,
  onToggleWishlist,
  wishlistItems,
  onQuickView,
}) => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [activeCategory, setActiveCategory] = useState("All");
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");

  const [loading, setLoading] = useState(true);

  // ================= PRICE =================

  const [maxProductPrice, setMaxProductPrice] = useState(5000);

  const [priceRange, setPriceRange] = useState({
    min: 0,
    max: 5000,
  });

  const [inStockOnly, setInStockOnly] = useState(false);

  // ================= PAGINATION =================

  const [currentPage, setCurrentPage] = useState(1);

  const productsPerPage = 4;

  // =====================================================
  // LOAD PRODUCTS FROM LIVE BACKEND
  // =====================================================

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(`${API_URL}/api/products`);

        const data = await response.json();

        console.log("SHOP PRODUCTS STATUS:", response.status);
        console.log("SHOP PRODUCTS RESPONSE:", data);

        if (data.success) {
          const formattedProducts = data.products.map((product) => ({
            ...product,
            id: product._id,
          }));

          setProducts(formattedProducts);

          // ================= FIND MAX PRICE =================

          if (formattedProducts.length > 0) {
            const highestPrice = Math.max(
              ...formattedProducts.map(
                (product) => Number(product.price) || 0,
              ),
            );

            setMaxProductPrice(highestPrice);

            setPriceRange({
              min: 0,
              max: highestPrice,
            });
          }
        } else {
          console.error("Failed to load products");

          setProducts([]);
        }
      } catch (error) {
        console.error("Failed to fetch products:", error);

        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];

  // =====================================================
  // FILTER + SORT
  // =====================================================

  useEffect(() => {
    let filtered = [...products];

    // ================= SEARCH =================

    if (searchQuery.trim()) {
      const search = searchQuery.toLowerCase();

      filtered = filtered.filter(
        (product) =>
          product.name?.toLowerCase().includes(search) ||
          product.category?.toLowerCase().includes(search),
      );
    }

    // ================= CATEGORY =================

    if (activeCategory !== "All") {
      filtered = filtered.filter(
        (product) => product.category === activeCategory,
      );
    }

    // ================= PRICE =================

    filtered = filtered.filter((product) => {
      const price = Number(product.price) || 0;

      return price >= priceRange.min && price <= priceRange.max;
    });

    // ================= STOCK =================

    if (inStockOnly) {
      filtered = filtered.filter(
        (product) => product.inStock === true,
      );
    }

    // ================= SORT =================

    switch (sortBy) {
      case "price-low":
        filtered.sort(
          (a, b) => Number(a.price) - Number(b.price),
        );
        break;

      case "price-high":
        filtered.sort(
          (a, b) => Number(b.price) - Number(a.price),
        );
        break;

      case "rating":
        filtered.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0),
        );
        break;

      case "newest":
        filtered.sort(
          (a, b) =>
            Number(b.isNew) - Number(a.isNew),
        );
        break;

      case "popular":
        filtered.sort(
          (a, b) =>
            Number(b.reviews || 0) -
            Number(a.reviews || 0),
        );
        break;

      default:
        filtered.sort(
          (a, b) =>
            Number(b.isBestSeller) -
            Number(a.isBestSeller),
        );
        break;
    }

    setFilteredProducts(filtered);

    // Filter change hone par page 1
    setCurrentPage(1);
  }, [
    products,
    searchQuery,
    activeCategory,
    sortBy,
    priceRange,
    inStockOnly,
  ]);

  // =====================================================
  // PAGINATION
  // =====================================================

  const totalPages = Math.ceil(
    filteredProducts.length / productsPerPage,
  );

  const startIndex =
    (currentPage - 1) * productsPerPage;

  const endIndex =
    startIndex + productsPerPage;

  const currentProducts =
    filteredProducts.slice(startIndex, endIndex);

  // =====================================================
  // NEXT
  // =====================================================

  const handleNext = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================================
  // PREVIOUS
  // =====================================================

  const handlePrevious = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  };

  // =====================================================
  // RESET
  // =====================================================

  const handleReset = () => {
    setPriceRange({
      min: 0,
      max: maxProductPrice,
    });

    setActiveCategory("All");
    setSearchQuery("");
    setSortBy("featured");
    setInStockOnly(false);
    setCurrentPage(1);
  };

  // =====================================================
  // RETURN
  // =====================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ================= HEADER ================= */}

      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-800">
            Shop All Products
          </h1>

          <p className="text-gray-500 mt-1">
            {filteredProducts.length} products found
          </p>
        </div>
      </div>

      {/* ================= MAIN ================= */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* ================= SIDEBAR ================= */}

          <div className="lg:w-72 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-20">
              {/* FILTER HEADER */}

              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-gray-800">
                  Filters
                </h3>

                <button
                  onClick={handleReset}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Reset All
                </button>
              </div>

              {/* ================= SEARCH ================= */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search Products
                </label>

                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) =>
                    setSearchQuery(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* ================= CATEGORY ================= */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>

                <div className="space-y-2">
                  {categories.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={
                          activeCategory === category
                        }
                        onChange={(e) => {
                          setActiveCategory(
                            e.target.value,
                          );

                          setCurrentPage(1);
                        }}
                        className="text-blue-600"
                      />

                      <span className="text-sm text-gray-700">
                        {category}
                      </span>

                      <span className="text-xs text-gray-400 ml-auto">
                        (
                        {
                          products.filter(
                            (p) =>
                              category === "All" ||
                              p.category === category,
                          ).length
                        }
                        )
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* ================= PRICE ================= */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Price Range
                </label>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    ₹0
                  </span>

                  <input
                    type="range"
                    min="0"
                    max={maxProductPrice}
                    value={priceRange.max}
                    onChange={(e) =>
                      setPriceRange({
                        ...priceRange,
                        max: Number(e.target.value),
                      })
                    }
                    className="flex-1"
                  />

                  <span className="text-sm text-gray-500">
                    ₹{priceRange.max}
                  </span>
                </div>

                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>
                    Min: ₹{priceRange.min}
                  </span>

                  <span>
                    Max: ₹{priceRange.max}
                  </span>
                </div>
              </div>

              {/* ================= STOCK ================= */}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Availability
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={inStockOnly}
                    onChange={(e) =>
                      setInStockOnly(e.target.checked)
                    }
                    className="text-blue-600"
                  />

                  <span className="text-sm text-gray-700">
                    In Stock Only
                  </span>
                </label>
              </div>

              {/* ================= SORT ================= */}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>

                <select
                  value={sortBy}
                  onChange={(e) =>
                    setSortBy(e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="featured">
                    Featured
                  </option>

                  <option value="popular">
                    Most Popular
                  </option>

                  <option value="rating">
                    Highest Rated
                  </option>

                  <option value="price-low">
                    Price: Low to High
                  </option>

                  <option value="price-high">
                    Price: High to Low
                  </option>

                  <option value="newest">
                    Newest
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* ================= PRODUCTS ================= */}

          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
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
                  ),
                )}
              </div>
            ) : (
              <>
                {/* ================= PRODUCT GRID ================= */}

                <ProductGrid
                  products={currentProducts}
                  onAddToCart={onAddToCart}
                  onToggleWishlist={onToggleWishlist}
                  wishlistItems={wishlistItems}
                  onQuickView={onQuickView}
                />

                {/* ================= PAGINATION ================= */}

                {filteredProducts.length > 0 && (
                  <div className="flex justify-center items-center gap-2 mt-10 flex-wrap">
                    {/* PREVIOUS */}

                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 1}
                      className={`px-4 py-2 border rounded-lg transition ${
                        currentPage === 1
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Previous
                    </button>

                    {/* PAGE NUMBERS */}

                    {Array.from(
                      {
                        length: totalPages,
                      },
                      (_, index) => index + 1,
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);

                          window.scrollTo({
                            top: 0,
                            behavior: "smooth",
                          });
                        }}
                        className={`px-4 py-2 rounded-lg transition ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {/* NEXT */}

                    <button
                      onClick={handleNext}
                      disabled={
                        currentPage === totalPages
                      }
                      className={`px-4 py-2 border rounded-lg transition ${
                        currentPage === totalPages
                          ? "text-gray-400 bg-gray-100 cursor-not-allowed"
                          : "border-gray-300 hover:bg-gray-100"
                      }`}
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Shop;