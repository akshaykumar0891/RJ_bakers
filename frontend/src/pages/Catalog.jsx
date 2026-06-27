import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';
import { useCart } from '../context/CartContext';
import { Search, ShoppingBag, Check, AlertCircle, Minus, Plus } from 'lucide-react';

const Catalog = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { cartItems, addToCart, updateQuantity } = useCart();
  const [addedItemIds, setAddedItemIds] = useState({}); // Tracking added status for flash alerts

  // Fetch products & categories
  useEffect(() => {
    const loadCatalog = async () => {
      try {
        const prodRes = await api.get('/products');
        setProducts(prodRes.data);
        
        const catRes = await api.get('/products/categories');
        const list = ['All', ...catRes.data.map(c => c.name)];
        setCategories(list);
      } catch (err) {
        console.error('Error fetching catalog products/categories:', err.message);
      } finally {
        setLoading(false);
      }
    };
    loadCatalog();
  }, []);

  const handleAddToCart = (product) => {
    addToCart(product, 1);
    
    // Trigger temporary visual "Added!" feedback on button
    setAddedItemIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [product.id]: false }));
    }, 1500);
  };

  // Filtering products
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' || product.category?.name === selectedCategory;
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-12">
      {/* Premium Hero Banner */}
      <section className="relative bg-bakery-950 text-white py-20 px-4 overflow-hidden rounded-b-[40px] md:rounded-b-[60px] shadow-2xl">
        <div className="absolute inset-0 opacity-40">
          <img
            src="https://images.unsplash.com/photo-1517433456452-f9633a875f6f?w=1200&auto=format&fit=crop&q=60"
            alt="Bakery background"
            className="w-full h-full object-cover filter brightness-50 contrast-125"
          />
        </div>
        <div className="relative max-w-4xl mx-auto text-center space-y-6">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30 backdrop-blur-md">
            🥐 Freshly Baked Daily
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-none font-serif">
            RJ Bakers – Online <br className="hidden sm:inline" />
            <span className="gradient-text italic font-normal">Ordering System</span>
          </h1>
          <p className="text-amber-100/80 max-w-xl mx-auto text-sm md:text-base font-medium">
            Browse our signature bakes, customize toppings, select Cash on Delivery or pay securely via UPI, and track preparation directly from your mobile.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#menu"
              className="px-8 py-3.5 rounded-full text-white font-bold text-sm gold-btn"
            >
              Order Online Now
            </a>
            <a
              href="/track"
              className="px-8 py-3.5 rounded-full text-slate-300 hover:text-white font-bold text-sm border border-slate-700 hover:bg-white/5 transition"
            >
              Track Active Order
            </a>
          </div>
        </div>
      </section>

      {/* Menu/Catalog Section */}
      <section id="menu" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-bakery-200 pb-6">
          <div>
            <h2 className="text-3xl font-black text-slate-800 font-serif">Our Bakes Menu</h2>
            <p className="text-slate-500 text-sm mt-1">Select from our signature categories below</p>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-bakery-200 rounded-full focus:outline-none focus:ring-2 focus:ring-bakery-500 focus:border-bakery-500 text-sm bg-white"
              placeholder="Search chocolate cake, red velvet..."
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 0 && (
          <div className="flex overflow-x-auto pb-3 gap-2 scrollbar-thin">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-5 py-2.5 rounded-full text-sm font-semibold transition ${
                  selectedCategory === cat
                    ? 'chocolate-btn text-white'
                    : 'bg-white text-slate-600 hover:bg-bakery-100 hover:text-bakery-800 border border-bakery-200/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Catalog Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bakery-700"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-bakery-100 p-8">
            <AlertCircle className="h-12 w-12 text-slate-400 mx-auto" />
            <h3 className="text-lg font-bold text-slate-700 mt-4">No bakes found</h3>
            <p className="text-slate-500 text-sm mt-1">Try resetting your filters or adjusting your search queries.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
            {filteredProducts.map((product) => {
              const cartItem = cartItems.find((item) => item.productId === product.id);
              return (
                <div
                  key={product.id}
                  className={`glass-card rounded-2xl sm:rounded-3xl overflow-hidden flex flex-col h-full ${
                    !product.available ? 'opacity-70 saturate-50' : ''
                  }`}
                >
                  <Link to={`/product/${product.id}`} className="block group flex-grow flex flex-col cursor-pointer">
                    {/* Image wrapper */}
                    <div className="relative h-32 sm:h-48 bg-slate-100 overflow-hidden">
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      {/* Category Label */}
                      <span className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-bakery-900 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-[9px] sm:text-xs font-bold shadow-sm">
                        {product.category?.name || 'Bakery'}
                      </span>

                      {/* Sold out overlay */}
                      {!product.available && (
                        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                          <span className="bg-red-600 text-white font-black text-[10px] sm:text-sm px-2.5 py-1 sm:px-4 sm:py-2 rounded-full uppercase tracking-wider shadow">
                            Sold Out
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Body details */}
                    <div className="p-3 sm:p-5 flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-2">
                          <h3 className="font-bold text-slate-800 text-xs sm:text-base line-clamp-1 leading-snug group-hover:text-bakery-700 transition">{product.name}</h3>
                          <span className="font-black text-amber-700 text-xs sm:text-base shrink-0">
                            ₹{parseFloat(product.price).toFixed(2)}
                          </span>
                        </div>
                        <p className="text-slate-500 text-[10px] sm:text-xs mt-1 sm:mt-2 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                          {product.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  </Link>

                  <div className="p-3 sm:p-5 pt-0">
                    <div className="mt-1 pt-3 border-t border-bakery-100 flex items-center justify-between">
                      {product.available ? (
                         cartItem ? (
                          <div className="flex items-center justify-between w-full border border-bakery-300 rounded-xl p-0.5 sm:p-1 bg-amber-50/40 shadow-inner">
                            <button
                              onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-bakery-700 hover:bg-bakery-800 active:scale-95 text-white rounded-lg transition font-black text-xs sm:text-sm shrink-0 flex items-center justify-center min-w-[24px] sm:min-w-[32px] shadow-sm"
                            >
                              <Minus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                            <span className="text-[10px] sm:text-xs font-extrabold text-bakery-950 px-1 sm:px-2 select-none truncate">
                              {cartItem.quantity} in Cart
                            </span>
                            <button
                              onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                              className="px-2 py-1 sm:px-3 sm:py-1.5 bg-bakery-700 hover:bg-bakery-800 active:scale-95 text-white rounded-lg transition font-black text-xs sm:text-sm shrink-0 flex items-center justify-center min-w-[24px] sm:min-w-[32px] shadow-sm"
                            >
                              <Plus className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddToCart(product)}
                            className="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold text-white flex items-center justify-center gap-1.5 transition gold-btn"
                          >
                            <ShoppingBag className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                            <span>Add to Cart</span>
                          </button>
                        )
                      ) : (
                        <button
                          disabled
                          className="w-full py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-[10px] sm:text-xs font-bold bg-slate-200 text-slate-400 cursor-not-allowed text-center"
                        >
                          Unavailable
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default Catalog;
