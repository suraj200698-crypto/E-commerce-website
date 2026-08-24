import React from "react";
import ProductCard from "./ProductCard";
import { useWishlist } from "../context/WishlistContext";

const ProductGrid = ({
  products = [],
  onAddToCart,
  onQuickView,
}) => {
  const { wishlistItems, toggleWishlist } = useWishlist();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.length > 0 ? (
        products.map((product) => {
          const isWishlisted = wishlistItems.some(
            (item) => item.id === product.id
          );

          return (
            <ProductCard
              key={product.id}
              {...product}
              isWishlisted={isWishlisted}
              onAddToCart={onAddToCart}
              onToggleWishlist={() => toggleWishlist(product)}
              onQuickView={onQuickView}
            />
          );
        })
      ) : (
        <div className="col-span-full text-center py-16">
          <h2 className="text-2xl font-bold text-gray-700">
            No Products Found
          </h2>

          <p className="text-gray-500 mt-2">
            Try another search or category.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductGrid;