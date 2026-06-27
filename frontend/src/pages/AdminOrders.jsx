import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';
import { ShoppingBag, Eye, Calendar, User, Phone, CheckCircle, XCircle, ChevronRight, Check, X, CreditCard, Trash2 } from 'lucide-react';

const AdminOrders = () => {
  const [searchParams] = useSearchParams();
  const highlightId = searchParams.get('id') || '';

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Inspection panel
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [submittingStatus, setSubmittingStatus] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/orders');
      setOrders(res.data);
      
      // Auto-open order if id param passed
      if (highlightId) {
        const orderToOpen = res.data.find(o => o.id === parseInt(highlightId));
        if (orderToOpen) {
          setSelectedOrder(orderToOpen);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [highlightId]);

  // Handle status update
  const handleUpdateStatus = async (orderId, newStatus) => {
    setSubmittingStatus(true);
    try {
      const res = await api.put(`/admin/orders/${orderId}/status`, { status: newStatus });
      setSelectedOrder(res.data);
      // Refresh item in list
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
    } catch (err) {
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    } finally {
      setSubmittingStatus(false);
    }
  };

  // Handle UPI Verification
  const handleVerifyUPI = async (orderId, verifyAction) => {
    setSubmittingStatus(true);
    try {
      const res = await api.put(`/admin/orders/${orderId}/verify-payment`, { verifyAction });
      setSelectedOrder(res.data);
      setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
    } catch (err) {
      alert('Failed to verify payment');
    } finally {
      setSubmittingStatus(false);
    }
  };

  const handleClearAllOrders = async () => {
    if (!window.confirm('🚨 WARNING: Are you sure you want to permanently clear older orders? The 10 most recent orders will be preserved. This action cannot be undone.')) {
      return;
    }
    
    try {
      const res = await api.delete('/admin/orders/clear');
      alert(res.data.message || 'Older orders cleared successfully.');
      loadOrders();
      setSelectedOrder(null);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to clear orders');
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm(`🚨 Are you sure you want to permanently delete Order #${orderId}? This cannot be undone.`)) {
      return;
    }
    
    try {
      await api.delete(`/admin/orders/${orderId}`);
      setOrders(prev => prev.filter(o => o.id !== orderId));
      setSelectedOrder(null);
      alert('Order deleted successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete order');
    }
  };

  // Filtered list
  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === 'All' || order.orderStatus === filterStatus;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerPhone.includes(searchQuery) ||
      order.id.toString() === searchQuery;
    return matchesStatus && matchesSearch;
  });

  const statuses = [
    'All',
    'Pending',
    'Payment Verification Pending',
    'Confirmed',
    'Preparing',
    'Ready',
    'Out For Delivery',
    'Delivered',
    'Cancelled'
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Orders Queue List */}
      <div className="lg:col-span-2 space-y-6">
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center justify-between w-full sm:w-auto gap-4">
              <div>
                <h2 className="text-lg font-bold text-slate-800 font-sans">Active Orders Queue</h2>
                <p className="text-slate-500 text-xs mt-0.5">Filter, search, and manage current incoming orders</p>
              </div>
              <button
                onClick={handleClearAllOrders}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-red-250 bg-red-50 hover:bg-red-100 text-red-705 font-extrabold text-[10px] uppercase transition cursor-pointer select-none shrink-0 shadow-sm"
                title="Permanently clear all database orders"
              >
                <Trash2 className="h-3 w-3" />
                <span>Clear Orders</span>
              </button>
            </div>
            
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full sm:w-60 border border-slate-200 rounded-full px-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
              placeholder="Search Name, Phone, or ID..."
            />
          </div>

          {/* Status Tabs */}
          <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-thin">
            {statuses.map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-[10px] font-bold border transition ${
                  filterStatus === status
                    ? 'chocolate-btn text-white'
                    : 'bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-800 border-slate-200'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Orders List Container */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bakery-700"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs">
            No matching orders found.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={`bg-white p-5 rounded-3xl border transition cursor-pointer shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                  selectedOrder?.id === order.id
                    ? 'border-amber-500 ring-2 ring-amber-100'
                    : 'border-slate-200 hover:border-slate-350'
                } ${order.id === parseInt(highlightId) ? 'border-dashed border-amber-600 bg-amber-50/20' : ''}`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 text-sm">#{order.id}</span>
                    <span className={`inline-block px-2 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                      order.paymentMethod === 'UPI' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.paymentMethod}
                    </span>
                    <span className="text-[10px] text-slate-400 font-semibold">{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  
                  <div className="text-xs">
                    <p className="font-bold text-slate-700">{order.customerName}</p>
                    <p className="text-slate-500 font-medium">{order.deliveryDate} at {order.deliveryTime}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
                  <div className="text-left sm:text-right">
                    <p className="text-xs font-black text-slate-800">₹{parseFloat(order.totalAmount).toFixed(2)}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{order.items?.length || 0} items ordered</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-block px-2.5 py-1 rounded-full font-bold text-[9px] ${
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
                    <ChevronRight className="h-4 w-4 text-slate-400 hidden sm:block" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right: Order Inspection Detail Side panel */}
      <div className="space-y-6">
        {selectedOrder ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6 sticky top-20 text-xs">
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Inspect Order</span>
                <h3 className="text-base font-bold text-slate-800 mt-0.5">Order ID: #{selectedOrder.id}</h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕ Close
              </button>
            </div>

            {/* Customer contact cards */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div className="flex items-start gap-2.5">
                <User className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-700">{selectedOrder.customerName}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">{selectedOrder.user?.email || 'Guest Customer'}</p>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Phone className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <a href={`tel:${selectedOrder.customerPhone}`} className="font-bold text-slate-700 hover:underline">
                  {selectedOrder.customerPhone}
                </a>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-slate-700">{selectedOrder.deliveryDate}</p>
                  <p className="text-[10px] text-slate-500 font-semibold">Scheduled: {selectedOrder.deliveryTime}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Delivery Destination</p>
                <p className="font-medium text-slate-600 leading-relaxed">{selectedOrder.customerAddress}</p>
              </div>

              {selectedOrder.specialNote && (
                <div className="border-t border-slate-200/50 pt-2">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Special Instruction</p>
                  <p className="text-amber-900 bg-amber-50 border border-amber-100 p-2 rounded-lg italic">
                    "{selectedOrder.specialNote}"
                  </p>
                </div>
              )}
            </div>

            {/* UPI Payment Verification section */}
            {selectedOrder.paymentMethod === 'UPI' && (
              <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl space-y-4">
                <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="h-4 w-4 text-indigo-600" />
                  <span>UPI Payment Review</span>
                </h4>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customer Txn ID</p>
                  <p className="font-mono font-bold text-slate-800 text-sm">{selectedOrder.transactionId || 'None Provided'}</p>
                </div>

                {selectedOrder.paymentScreenshot && (
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Screenshot Receipt (Click to zoom)</p>
                    <div
                      onClick={() => setLightboxOpen(true)}
                      className="h-28 w-full border border-indigo-200 rounded-xl overflow-hidden cursor-zoom-in relative group shadow-sm bg-white"
                    >
                      <img src={getImageUrl(selectedOrder.paymentScreenshot)} alt="UPI Payment" className="h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white font-bold text-[10px]">
                        🔍 View Fullscreen
                      </div>
                    </div>
                  </div>
                )}

                <div className="text-xs">
                  <p className="font-bold text-slate-500 uppercase text-[10px]">Payment status: <span className={`uppercase font-black ${
                    selectedOrder.paymentStatus === 'verified'
                      ? 'text-emerald-600'
                      : selectedOrder.paymentStatus === 'failed'
                      ? 'text-red-600'
                      : 'text-amber-600'
                  }`}>{selectedOrder.paymentStatus}</span></p>
                </div>

                {selectedOrder.paymentStatus === 'pending' && (
                  <div className="flex gap-2.5 pt-1">
                    <button
                      onClick={() => handleVerifyUPI(selectedOrder.id, 'approve')}
                      disabled={submittingStatus}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => handleVerifyUPI(selectedOrder.id, 'reject')}
                      disabled={submittingStatus}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition"
                    >
                      <X className="h-3.5 w-3.5" />
                      <span>Reject</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Stepper Status Update */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Update Order Progress</label>
              <select
                value={selectedOrder.orderStatus}
                onChange={(e) => handleUpdateStatus(selectedOrder.id, e.target.value)}
                disabled={submittingStatus}
                className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500 bg-white"
              >
                <option value="Pending">Pending</option>
                <option value="Payment Verification Pending" disabled>Payment Verification Pending</option>
                <option value="Confirmed">Confirmed (Paid/Approved)</option>
                <option value="Preparing">Preparing in Kitchen</option>
                <option value="Ready">Ready for Pickup/Delivery</option>
                <option value="Out For Delivery">Out For Delivery</option>
                <option value="Delivered">Delivered</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            {/* Ordered items listing */}
            <div className="space-y-3 border-t border-slate-100 pt-4">
              <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">Order Items</p>
              
              <div className="divide-y divide-slate-100 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-bold text-slate-800">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400 font-semibold">₹{parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="font-bold text-slate-800">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-slate-800 pt-3 border-t border-slate-100">
                <span>Total Amount Due</span>
                <span className="text-amber-700">₹{parseFloat(selectedOrder.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <button
                type="button"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
                className="w-full py-2.5 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer select-none"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete Order (Manual)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-slate-400 text-xs sticky top-20 shadow-sm">
            Select an order from the queue to inspect customer details, verify receipts, or adjust preparation status.
          </div>
        )}
      </div>

      {/* Screen Lightbox Zoom Modal for Receipts */}
      {lightboxOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={() => setLightboxOpen(false)}
          ></div>
          <div className="relative bg-white rounded-3xl overflow-hidden max-w-2xl w-full p-4 border border-slate-200 z-10 flex flex-col items-center">
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 bg-slate-900 text-white hover:bg-slate-850 p-2.5 rounded-full z-20 shadow"
            >
              ✕ Close
            </button>
            <div className="max-h-[80vh] overflow-y-auto w-full flex justify-center bg-slate-50 rounded-2xl p-2 border border-slate-200">
              <img
                src={getImageUrl(selectedOrder.paymentScreenshot)}
                alt="Receipt screenshot large"
                className="max-h-[75vh] object-contain rounded"
              />
            </div>
            <div className="w-full text-center mt-4 text-xs font-bold text-slate-700">
              Txn ID: <span className="font-mono text-indigo-700">{selectedOrder.transactionId}</span> | Paid by {selectedOrder.customerName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
