import React from "react";

function ProductCard({ product, addToCart }) {
  const renderStars = (rating) => {
    return "⭐".repeat(rating);
  };

  return (
    <div className="product-card">
      <img src={product.image} alt={product.name} />
      <h3>{product.name}</h3>
      <p>₹{product.price}</p>
      <p className="rating">{renderStars(product.rating)}</p>
      <button className="add-btn" onClick={() => addToCart(product)}>
        + Add to Cart
      </button>
    </div>
  );
}

export default ProductCard;
