import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Navbar() {
  const { cart, toggleCart } = useContext(CartContext);


  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="navbar">
      <div className="logo">
        🛒 <span>ShopSmart</span>
      </div>

      <div className="nav-right">
        <div className="cart-icon" onClick={toggleCart}>

          🛍️
          {totalItems > 0 && (
            <span className="cart-count">{totalItems}</span>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
