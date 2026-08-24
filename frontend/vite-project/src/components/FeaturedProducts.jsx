import React from "react";
import ProductCard from "./ProductCard";

const FeaturedProducts = ({
  products = [],
  onAddToCart,
  onToggleWishlist,
  wishlistItems = [],
  onQuickView,
}) => {
  const featuredProducts = products.filter(
    (product) => product.isBestSeller || product.isNew
  );

  return (
    <section className="py-16 bg-gray-50">

      <div className="max-w-7xl mx-auto px-4">

        <div className="text-center mb-10">

          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
            Featured Products
          </h2>

          <p className="text-gray-500 mt-3">
            Check out our most popular products
          </p>

        </div>

        {featuredProducts.length === 0 ? (

          <p className="text-center text-gray-500">
            No featured products available.
          </p>

        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {featuredProducts.map((product) => (

              <ProductCard
                key={product.id}
                {...product}
                isWishlisted={wishlistItems.some(
                  (item) => item.id === product.id
                )}
                onAddToCart={onAddToCart}
                onToggleWishlist={onToggleWishlist}
                onQuickView={onQuickView}
              />

            ))}

          </div>

        )}

      </div>

    </section>
  );
};

export default FeaturedProducts;