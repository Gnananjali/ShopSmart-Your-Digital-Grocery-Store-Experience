import React, { useState, useContext } from "react";
import products from "../data/products";
import ProductCard from "../components/ProductCard";
import { CartContext } from "../context/CartContext";

function Home() {
  const { addToCart } = useContext(CartContext);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sortOption, setSortOption] = useState("default");

  const categories = ["All", "Fruits", "Dairy", "Bakery", "Vegetables"];

  const filteredProducts = products.filter((product) => {
    return (
      (category === "All" || product.category === category) &&
      product.name.toLowerCase().includes(search.toLowerCase())
    );
  });

  let sortedProducts = [...filteredProducts];

  if (sortOption === "low") {
    sortedProducts.sort((a, b) => a.price - b.price);
  } else if (sortOption === "high") {
    sortedProducts.sort((a, b) => b.price - a.price);
  }

  return (
    <div>
      <input
        type="text"
        placeholder="Search products..."
        className="search-bar"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <div className="categories">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={category === cat ? "active" : ""}
          >
            {cat}
          </button>
        ))}
      </div>

      <select
        onChange={(e) => setSortOption(e.target.value)}
        className="sort-dropdown"
      >
        <option value="default">Sort By</option>
        <option value="low">Price: Low to High</option>
        <option value="high">Price: High to Low</option>
      </select>

      <div className="product-grid">
        {sortedProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            addToCart={addToCart}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;
