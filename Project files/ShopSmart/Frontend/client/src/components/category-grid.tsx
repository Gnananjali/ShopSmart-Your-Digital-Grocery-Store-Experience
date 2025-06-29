import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import type { Category } from "@shared/schema";

interface CategoryGridProps {
  selectedCategory: string;
  onCategorySelect: (slug: string) => void;
}

export default function CategoryGrid({ selectedCategory, onCategorySelect }: CategoryGridProps) {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ['/api/categories'],
  });

  if (isLoading) {
    return (
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold text-center mb-8">Shop by Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-4 text-center shadow-md animate-pulse">
                <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12">
      <div className="container mx-auto px-4">
        <h3 className="text-2xl font-bold text-center mb-8">Shop by Category</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Button
            variant={selectedCategory === "" ? "default" : "outline"}
            onClick={() => onCategorySelect("")}
            className="category-card bg-white rounded-lg p-4 h-auto flex flex-col items-center shadow-md hover:shadow-lg"
          >
            <div className="w-16 h-16 mx-auto mb-3 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-2xl">🛒</span>
            </div>
            <h4 className="font-semibold text-gray-800">All Products</h4>
            <p className="text-sm text-gray-500">Everything</p>
          </Button>
          
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.slug ? "default" : "outline"}
              onClick={() => onCategorySelect(category.slug)}
              className="category-card bg-white rounded-lg p-4 h-auto flex flex-col items-center shadow-md hover:shadow-lg"
            >
              <img
                src={category.imageUrl || ""}
                alt={category.name}
                className="w-16 h-16 mx-auto mb-3 rounded-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64"><rect width="64" height="64" fill="%23f3f4f6"/></svg>`;
                }}
              />
              <h4 className="font-semibold text-gray-800">{category.name}</h4>
              <p className="text-sm text-gray-500">{category.description}</p>
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
