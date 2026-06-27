import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ShoppingBag, User, LogOut, LayoutDashboard, Search, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import logoImg from '../assets/logo.jpg';
import api from '../services/api';

const CustomerLayout = () => {
  const { user, logout, isAdmin } = useAuth();
  const { getCartCount } = useCart();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setSettings(res.data);
      } catch (err) {
        console.error('Failed to load shop settings for footer:', err.message);
      }
    };
    fetchSettings();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col bg-bakery-50">
      {/* Premium Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-bakery-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5">
              <img src={logoImg} alt="RJ Bakers Logo" className="h-10 w-10 rounded-full object-cover border border-bakery-200 shadow-sm" />
              <span className="text-xl font-black tracking-tight text-bakery-950 font-sans">
                RJ <span className="gradient-text font-serif italic">Bakers</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-8 items-center">
              <Link to="/" className="text-sm font-semibold text-slate-700 hover:text-bakery-700 transition">
                Shop Menu
              </Link>
              <Link to="/track" className="text-sm font-semibold text-slate-700 hover:text-bakery-700 transition">
                Track Order
              </Link>

              {isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className="flex items-center space-x-1 text-sm font-semibold text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 hover:bg-amber-100 transition"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Admin Dashboard</span>
                </Link>
              )}
            </nav>

            {/* Right side actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 text-slate-700 hover:text-bakery-700 transition-colors"
              >
                <ShoppingBag className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-amber-600 rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </Link>

              {/* User Actions */}
              {user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-slate-600">Hi, {user.name.split(' ')[0]}</span>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-500 hover:text-red-600 rounded-full hover:bg-red-50 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1 text-sm font-semibold text-white chocolate-btn px-4 py-2 rounded-full"
                >
                  <User className="h-4 w-4" />
                  <span>Login / Register</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center space-x-4">
              <Link to="/cart" className="relative p-2 text-slate-700">
                <ShoppingBag className="h-6 w-6" />
                {getCartCount() > 0 && (
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-amber-600 rounded-full">
                    {getCartCount()}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-slate-700 rounded-lg hover:bg-bakery-100"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-bakery-100 bg-white px-4 pt-2 pb-4 space-y-3">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-bakery-50 hover:text-bakery-700"
            >
              Shop Menu
            </Link>
            <Link
              to="/track"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-md text-base font-semibold text-slate-700 hover:bg-bakery-50 hover:text-bakery-700"
            >
              Track Order
            </Link>

            {isAdmin && (
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-semibold text-amber-700 bg-amber-50"
              >
                <LayoutDashboard className="h-5 w-5" />
                <span>Admin Dashboard</span>
              </Link>
            )}

            <div className="pt-4 border-t border-slate-100">
              {user ? (
                <div className="flex items-center justify-between px-3 py-2">
                  <span className="text-base font-medium text-slate-700">Logged in as {user.name}</span>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      handleLogout();
                    }}
                    className="flex items-center space-x-1 text-red-600 font-semibold"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center text-white chocolate-btn px-4 py-2.5 rounded-full font-semibold"
                >
                  Login / Register
                </Link>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-bakery-950 text-amber-100 border-t-4 border-bakery-600 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="text-2xl font-black text-white flex items-center space-x-2.5">
                <img src={logoImg} alt="RJ Bakers Logo" className="h-8 w-8 rounded-full object-cover border border-amber-900/50" />
                <span>RJ Bakers</span>
              </span>
              <p className="mt-4 text-amber-200/70 text-sm leading-relaxed">
                Handcrafted premium cakes, cupcakes, and pastries made with love. Order online for instant pickup or scheduled deliveries.
              </p>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm text-amber-200/70">
                <li><Link to="/" className="hover:text-amber-300">Browse Menu</Link></li>
                <li><Link to="/track" className="hover:text-amber-300">Track Order</Link></li>
                <li><Link to="/login" className="hover:text-amber-300">Customer Portal</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg mb-4">Contact Bakery</h3>
              <a
                href="https://maps.app.goo.gl/Gk5ZiBMEsHC2kPT96"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-amber-200/70 hover:text-amber-300 transition flex items-center space-x-1"
              >
                <span>📍 {settings?.bakeryAddress || 'Opposite Masjid, Jagadamba Center'}</span>
              </a>
              <p className="text-sm text-amber-200/70 mt-1">📞 {settings?.phoneNumber || '+91 98765 43210'}</p>
              <p className="text-sm text-amber-200/70 mt-1">✉️ {settings?.bakeryEmail || 'avanthivusirikala@gmail.com'}</p>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-amber-900/50 text-center text-sm text-amber-200/40">
            © {new Date().getFullYear()} RJ Bakers. All rights reserved. Made for bakery lovers.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default CustomerLayout;
