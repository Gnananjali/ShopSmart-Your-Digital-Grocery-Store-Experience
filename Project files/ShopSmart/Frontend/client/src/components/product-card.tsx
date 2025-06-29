import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { formatPrice } from "@/lib/utils";
import { useState } from "react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const [showAdded, setShowAdded] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    addToCart(product.id);
    
    // Show added state
    setShowAdded(true);
    setTimeout(() => {
      setShowAdded(false);
      setIsAdding(false);
    }, 1500);
  };

  const getBadgeVariant = (tag: string) => {
    switch (tag) {
      case 'organic': return 'secondary';
      case 'fresh': return 'secondary';
      case 'premium': return 'secondary';
      case 'best-seller': return 'default';
      case 'popular': return 'default';
      default: return 'outline';
    }
  };

  return (
    <div className="product-card bg-white rounded-lg shadow-md hover:shadow-lg p-4">
      <img
        src={product.imageUrl || ""}
        alt={product.name}
        className="w-full h-48 object-cover rounded-lg mb-3"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          target.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="240" viewBox="0 0 300 240"><rect width="300" height="240" fill="%23f3f4f6"/><text x="150" y="120" text-anchor="middle" fill="%236b7280" font-size="16">${product.name}</text></svg>`;
        }}
      />
      <div className="space-y-2">
        {product.tags && product.tags.length > 0 && (
          <Badge variant={getBadgeVariant(product.tags[0])} className="text-xs">
            {product.tags[0].charAt(0).toUpperCase() + product.tags[0].slice(1)}
          </Badge>
        )}
        <h4 className="font-semibold text-gray-800 line-clamp-2">{product.name}</h4>
        <p className="text-sm text-gray-600 line-clamp-2">{product.description} - {product.unit}</p>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-lg font-bold text-primary">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price) && (
              <span className="text-sm text-gray-500 line-through block">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>
          <Button
            size="sm"
            onClick={handleAddToCart}
            disabled={isAdding || !product.isAvailable}
            className={`transition-colors ${
              showAdded 
                ? 'bg-green-600 hover:bg-green-600' 
                : 'bg-primary hover:bg-primary/90'
            }`}
          >
            {showAdded ? (
              <>
                <Check className="w-3 h-3 mr-1" />
                Added
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 mr-1" />
                Add
              </>
            )}
          </Button>
        </div>
        
        {!product.isAvailable && (
          <p className="text-sm text-red-500 font-medium">Out of Stock</p>
        )}
      </div>
    </div>
  );
}
