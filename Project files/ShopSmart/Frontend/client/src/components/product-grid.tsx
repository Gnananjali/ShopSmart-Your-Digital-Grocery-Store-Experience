import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "@/components/product-card";
import type { Product } from "@shared/schema";

interface ProductGridProps {
  categorySlug: string;
  searchQuery: string;
  sortBy: string;
}

export default function ProductGrid({ categorySlug, searchQuery, sortBy }: ProductGridProps) {
  const [displayCount, setDisplayCount] = useState(30);
  
  const { data: products = [], isLoading } = useQuery<Product[]>({
    queryKey: ['/api/products', { category: categorySlug || undefined, search: searchQuery || undefined }],
  });

  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return parseFloat(a.price) - parseFloat(b.price);
      case 'price-high':
        return parseFloat(b.price) - parseFloat(a.price);
      case 'newest':
        return new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime();
      case 'featured':
      default:
        return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    }
  });

  const displayedProducts = sortedProducts.slice(0, displayCount);
  const hasMore = sortedProducts.length > displayCount;

  if (isLoading) {
    return (
      <section className="py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800">Featured Products</h3>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md p-4 animate-pulse">
                <div className="w-full h-48 bg-gray-200 rounded-lg mb-3"></div>
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-gray-800">
            {categorySlug ? `${categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1)} Products` : 'Featured Products'}
          </h3>
          <span className="text-gray-600">
            Showing {displayedProducts.length} of {sortedProducts.length} products
          </span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {displayedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        
        {hasMore && (
          <div className="text-center mt-8">
            <Button
              variant="outline"
              size="lg"
              onClick={() => setDisplayCount(prev => prev + 15)}
              className="border-2 border-primary text-primary hover:bg-primary hover:text-white"
            >
              Load More Products
            </Button>
          </div>
        )}

        {displayedProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
            <p className="text-gray-500">
              {searchQuery ? `No results for "${searchQuery}"` : 'No products available in this category'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
