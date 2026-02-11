import "./App.css";
import React, { useContext } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./components/Cart";
import { CartContext } from "./context/CartContext";

function App() {
  const { cart, toggleCart } = useContext(CartContext);

return (
  <div className="app-container">
    <Navbar
      cartCount={cart.reduce((sum, item) => sum + item.quantity, 0)}
      toggleCart={toggleCart}
    />
    <Home />
    <Cart />
  </div>
);

}

export default App;
