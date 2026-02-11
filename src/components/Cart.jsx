import React, { useContext } from "react";
import { CartContext } from "../context/CartContext";

function Cart() {
  const {
    cart,
    isCartOpen,
    toggleCart,
    increaseQty,
    decreaseQty,
    removeItem
  } = useContext(CartContext);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className={`cart ${isCartOpen ? "open" : ""}`}>
      <h2>Your Cart</h2>

      {cart.length === 0 ? (
        <div className="empty-cart">
          🛒 Your cart is empty
          <p>Add some products!</p>
        </div>
      ) : (
        <>
          {cart.map((item) => (
            <div key={item.id} className="cart-item">
              <div>
                <p>{item.name}</p>
                <p>₹{item.price}</p>
              </div>

              <div className="qty-controls">
                <button onClick={() => decreaseQty(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => increaseQty(item.id)}>+</button>
              </div>

              <button onClick={() => removeItem(item.id)}>❌</button>
            </div>
          ))}

          <h3>Total: ₹{total}</h3>
        </>
      )}

      <button className="close-btn" onClick={toggleCart}>
        Close
      </button>
    </div>
  );
}

export default Cart;
