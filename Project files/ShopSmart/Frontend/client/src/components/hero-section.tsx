import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-[hsl(var(--cream))] to-[hsl(var(--beige))] py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col lg:flex-row items-center">
          <div className="lg:w-1/2 mb-6 lg:mb-0">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Fresh Groceries<br />Delivered to Your Door
            </h2>
            <p className="text-gray-600 mb-6">
              Shop from our wide selection of fresh vegetables, fruits, dairy products, 
              and household essentials. Get everything delivered in 30 minutes!
            </p>
            <Button size="lg" className="bg-primary hover:bg-primary/90">
              Start Shopping
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
          <div className="lg:w-1/2">
            <img
              src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
              alt="Fresh vegetables and fruits"
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
