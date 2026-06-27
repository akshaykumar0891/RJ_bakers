import { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';
import { TrendingUp, ShoppingBag, ClipboardList, Package, Clock, CheckCircle } from 'lucide-react';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bakery-700"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Orders",
      value: stats?.todayOrders || 0,
      icon: Clock,
      color: "bg-blue-500",
      textColor: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: "Pending Verification",
      value: stats?.pendingOrders || 0,
      icon: ClipboardList,
      color: "bg-amber-500",
      textColor: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: "Completed Orders",
      value: stats?.completedOrders || 0,
      icon: CheckCircle,
      color: "bg-emerald-500",
      textColor: "text-emerald-600",
      bgColor: "bg-emerald-50"
    },
    {
      title: "Total Revenue",
      value: `₹${parseFloat(stats?.totalRevenue || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: "bg-indigo-500",
      textColor: "text-indigo-600",
      bgColor: "bg-indigo-50"
    },
    {
      title: "Active Products",
      value: stats?.totalProducts || 0,
      icon: Package,
      color: "bg-slate-500",
      textColor: "text-slate-600",
      bgColor: "bg-slate-50"
    }
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${card.bgColor} ${card.textColor} shrink-0`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{card.title}</p>
                <p className="text-xl font-extrabold text-slate-800 mt-1">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-800 text-base font-sans">Recent Order Queue</h3>
            <p className="text-slate-500 text-xs mt-0.5">Quick lookup of the 5 most recent customer submissions</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200 transition"
          >
            Manage All Orders
          </Link>
        </div>

        {stats?.recentOrders?.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-sm">
            No orders found in database yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-extrabold border-b border-slate-200">
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Customer</th>
                  <th className="p-4">Delivery Slot</th>
                  <th className="p-4">Payment</th>
                  <th className="p-4">Total Amount</th>
                  <th className="p-4">Order Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {stats?.recentOrders?.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50">
                    <td className="p-4 font-bold text-slate-900">#{order.id}</td>
                    <td className="p-4">
                      <p className="font-bold text-slate-800">{order.customerName}</p>
                      <p className="text-slate-400 text-[10px]">{order.customerPhone}</p>
                    </td>
                    <td className="p-4">
                      <p className="font-medium text-slate-700">{order.deliveryDate}</p>
                      <p className="text-slate-400 text-[10px]">{order.deliveryTime}</p>
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-0.5 rounded font-bold uppercase tracking-wider text-[9px] ${
                        order.paymentMethod === 'UPI' ? 'bg-indigo-50 text-indigo-700 border border-indigo-150' : 'bg-amber-50 text-amber-700 border border-amber-150'
                      }`}>
                        {order.paymentMethod}
                      </span>
                    </td>
                    <td className="p-4 font-extrabold text-slate-800">
                      ₹{parseFloat(order.totalAmount).toFixed(2)}
                    </td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 rounded-full font-bold text-[10px] ${
                        order.orderStatus === 'Confirmed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.orderStatus === 'Delivered'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : order.orderStatus === 'Cancelled'
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        to={`/admin/orders?id=${order.id}`}
                        className="text-xs font-bold text-slate-600 hover:text-amber-700 hover:underline"
                      >
                        Inspect
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
