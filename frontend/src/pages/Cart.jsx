import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Minus, Plus, Trash2, ArrowRight, ShoppingCart, MessageSquare } from 'lucide-react';
import { getImageUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Cart = () => {
  const {
    cartItems,
    specialNote,
    setSpecialNote,
    updateQuantity,
    removeFromCart,
    clearCart,
    getCartTotal
  } = useCart();

  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckoutRedirect = () => {
    if (!user) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-6">
        <div className="h-20 w-20 bg-bakery-100 rounded-full flex items-center justify-center mx-auto text-bakery-600">
          <ShoppingCart className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-black text-slate-800 font-serif">Your Cart is Empty</h2>
          <p className="text-slate-500 text-sm">Fill your cravings with our handcrafted luxury cakes and pastries.</p>
        </div>
        <Link
          to="/"
          className="inline-block px-8 py-3 rounded-full text-white font-bold text-sm gold-btn"
        >
          Browse Menu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 font-serif">Your Shopping Cart</h1>
        <p className="text-slate-500 text-sm mt-1">Review items and add any special baking instructions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-3xl border border-bakery-100 divide-y divide-slate-100 overflow-hidden shadow-sm">
            {cartItems.map((item) => (
              <div key={item.productId} className="p-5 flex items-center gap-4">
                <img
                  src={getImageUrl(item.imageUrl)}
                  alt={item.name}
                  className="h-16 w-16 rounded-xl object-cover bg-slate-100 shrink-0"
                />
                <div className="flex-grow min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{item.name}</h3>
                  <p className="text-amber-700 font-black text-xs mt-1">₹{item.price.toFixed(2)}</p>
                </div>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2 border border-slate-200 rounded-lg p-1 shrink-0 bg-slate-50">
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="text-xs font-bold w-6 text-center text-slate-700">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    className="p-1 hover:bg-slate-200 rounded text-slate-600"
                  >
                    <Plus className="h-3 w-3" />
                  </button>
                </div>

                {/* Remove button */}
                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition shrink-0"
                >
                  <Trash2 className="h-4.5 w-4.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Clear Cart Button */}
          <div className="flex justify-start">
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-red-600 hover:text-red-800 flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear Entire Cart</span>
            </button>
          </div>

          {/* Special notes */}
          <div className="glass-panel rounded-3xl p-5 border border-bakery-200 space-y-3">
            <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-amber-600" />
              <span>Special Baking Notes</span>
            </h3>
            <p className="text-slate-500 text-xs">Want to write a birthday greeting? Or request eggless/less sugar? Let us know!</p>
            <textarea
              value={specialNote}
              onChange={(e) => setSpecialNote(e.target.value)}
              rows="3"
              className="w-full border border-slate-200 rounded-2xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
              placeholder="e.g. Write 'Happy Birthday Dad' on the chocolate cake."
            ></textarea>
          </div>
        </div>

        {/* Checkout summary */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-slate-800 text-base font-serif">Order Summary</h3>

            <div className="divide-y divide-slate-100 text-sm">
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Items Subtotal</span>
                <span className="font-semibold text-slate-700">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3">
                <span className="text-slate-500">Delivery Fee</span>
                <span className="font-semibold text-emerald-600">FREE</span>
              </div>
              <div className="flex justify-between py-3 text-base font-bold text-slate-800 border-t border-slate-100 pt-3">
                <span>Total Amount</span>
                <span className="text-amber-700">₹{getCartTotal().toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleCheckoutRedirect}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white chocolate-btn shadow-md"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
