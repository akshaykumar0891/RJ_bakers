import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  Store,
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState, useEffect } from 'react';
import logoImg from '../assets/logo.jpg';

const AdminLayout = () => {
  const { user, logout, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Auth Protection: If check finished and user is not admin, redirect
  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading || !user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bakery-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bakery-700 mx-auto"></div>
          <p className="mt-4 text-slate-600 font-semibold">Verifying Admin Session...</p>
        </div>
      </div>
    );
  }

  const menuItems = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Orders List', path: '/admin/orders', icon: ShoppingBag },
    { name: 'Manage Products', path: '/admin/products', icon: Package },
    { name: 'Shop Settings', path: '/admin/settings', icon: Settings }
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-64 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0">
        <div className="p-6 border-b border-slate-800 flex items-center space-x-2.5">
          <img src={logoImg} alt="RJ Bakers Logo" className="h-8 w-8 rounded-full object-cover border border-slate-700 shadow-sm" />
          <span className="text-lg font-black text-white">
            RJ Bakers <span className="text-amber-500 font-normal text-xs bg-amber-950 px-2 py-0.5 rounded border border-amber-900 ml-1">Admin</span>
          </span>
        </div>
        <nav className="flex-grow p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-amber-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
        <div className="p-4 border-t border-slate-800 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Store className="h-4 w-4" />
            <span>Go to Shop Front</span>
          </Link>
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-red-400 hover:bg-red-950/30 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout Account</span>
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="flex-grow flex flex-col min-w-0">
        {/* Header Navbar - Mobile & Top Actions */}
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-10">
          <div className="flex items-center">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-700 rounded-lg hover:bg-slate-100 mr-2"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-xl font-bold text-slate-800 font-sans">
              {menuItems.find((item) => item.path === location.pathname)?.name || 'Admin Panel'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-500 hidden sm:inline">Owner Portal</span>
            <div className="h-8 w-8 rounded-full border border-slate-200 overflow-hidden shadow-sm">
              <img src={logoImg} alt="RJ Bakers Logo" className="h-full w-full object-cover" />
            </div>
          </div>
        </header>

        {/* Content View */}
        <main className="flex-grow p-6 overflow-y-auto max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Backdrop & Panel */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative flex flex-col w-64 max-w-xs bg-slate-950 text-slate-300 border-r border-slate-800 p-6 z-10">
            <div className="absolute top-4 right-4">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex items-center space-x-2.5 pb-6 border-b border-slate-800">
              <img src={logoImg} alt="RJ Bakers Logo" className="h-8 w-8 rounded-full object-cover border border-slate-700 shadow-sm" />
              <span className="text-lg font-black text-white">RJ Bakers</span>
            </div>
            <nav className="flex-grow py-6 space-y-1">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setMobileSidebarOpen(false)}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-semibold transition-colors ${
                      isActive
                        ? 'bg-amber-600 text-white'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
            <div className="border-t border-slate-800 pt-6 space-y-3">
              <Link
                to="/"
                onClick={() => setMobileSidebarOpen(false)}
                className="flex items-center space-x-3 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors"
              >
                <Store className="h-5 w-5" />
                <span>Shop Front</span>
              </Link>
              <button
                onClick={() => {
                  setMobileSidebarOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center space-x-3 px-4 py-2 rounded-lg text-sm text-red-400 hover:bg-red-950/30 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLayout;
