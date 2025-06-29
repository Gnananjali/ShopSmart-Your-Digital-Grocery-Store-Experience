import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/contexts/cart-context";

interface FloatingCartProps {
  onCartClick: () => void;
}

export default function FloatingCart({ onCartClick }: FloatingCartProps) {
  const { itemCount } = useCart();

  if (itemCount === 0) return null;

  return (
    <div className="cart-float">
      <Button
        onClick={onCartClick}
        className="relative bg-secondary hover:bg-secondary/90 p-4 rounded-full shadow-lg hover:shadow-xl transition-all"
        size="icon"
      >
        <ShoppingCart className="w-6 h-6" />
        <span className="absolute -top-2 -right-2 bg-primary text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold">
          {itemCount}
        </span>
      </Button>
    </div>
  );
}
