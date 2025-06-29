import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

interface FilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
}

export default function FilterBar({ sortBy, onSortChange }: FilterBarProps) {
  return (
    <section className="py-4 bg-white border-y">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Filter by:</span>
            <Button variant="outline" className="hover:bg-gray-50">
              Price <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
            <Button variant="outline" className="hover:bg-gray-50">
              Brand <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
            <Button variant="outline" className="hover:bg-gray-50">
              Rating <ChevronDown className="ml-1 w-4 h-4" />
            </Button>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Sort by:</span>
            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="featured">Featured</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Customer Rating</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </section>
  );
}
