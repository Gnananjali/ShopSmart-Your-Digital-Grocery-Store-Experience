import Header from "@/components/header";
import HeroSection from "@/components/hero-section";
import CategoryGrid from "@/components/category-grid";
import FilterBar from "@/components/filter-bar";
import ProductGrid from "@/components/product-grid";
import FloatingCart from "@/components/floating-cart";
import CartModal from "@/components/cart-modal";
import Footer from "@/components/footer";
import { useState } from "react";

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [cartOpen, setCartOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onCartClick={() => setCartOpen(true)}
      />
      <HeroSection />
      <CategoryGrid 
        selectedCategory={selectedCategory}
        onCategorySelect={setSelectedCategory}
      />
      <FilterBar 
        sortBy={sortBy}
        onSortChange={setSortBy}
      />
      <ProductGrid 
        categorySlug={selectedCategory}
        searchQuery={searchQuery}
        sortBy={sortBy}
      />
      <FloatingCart onCartClick={() => setCartOpen(true)} />
      <CartModal 
        isOpen={cartOpen}
        onClose={() => setCartOpen(false)}
      />
      <Footer />
    </div>
  );
}
