import { Search, ShoppingCart, Phone, MapPin, User, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/contexts/cart-context";
import { Link } from "wouter";

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onCartClick: () => void;
}

export default function Header({ searchQuery, onSearchChange, onCartClick }: HeaderProps) {
  const { itemCount } = useCart();

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between py-2 text-sm text-gray-600 border-b">
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <MapPin className="w-4 h-4 text-primary mr-1" />
              Deliver to Mumbai 400001
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="flex items-center">
              <Phone className="w-4 h-4 text-secondary mr-1" />
              1800-123-4567
            </span>
            <Link href="/login">
              <span className="flex items-center cursor-pointer hover:text-primary">
                <User className="w-4 h-4 text-secondary mr-1" />
                Login
              </span>
            </Link>
          </div>
        </div>
        
        {/* Main header */}
        <div className="flex items-center justify-between py-4">
          <div className="flex items-center space-x-8">
            <h1 className="text-2xl font-bold text-primary">ShopSmart</h1>
            <nav className="hidden lg:flex space-x-6">
              <a href="#" className="text-gray-700 hover:text-primary font-medium">Home</a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium">Categories</a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium">Offers</a>
              <a href="#" className="text-gray-700 hover:text-primary font-medium">About</a>
            </nav>
          </div>
          
          {/* Search bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search for vegetables, fruits, dairy & more..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10"
              />
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            </div>
          </div>
          
          {/* Cart button */}
          <Button 
            onClick={onCartClick}
            className="flex items-center space-x-2 bg-secondary hover:bg-secondary/90"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{itemCount}</span>
            <span className="hidden sm:inline">Cart</span>
          </Button>
          
          {/* Mobile menu button */}
          <Button variant="ghost" size="icon" className="lg:hidden ml-4">
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
