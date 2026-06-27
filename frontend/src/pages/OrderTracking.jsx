import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api, { getImageUrl } from '../services/api';
import { Search, ShoppingBag, Package, Calendar, MapPin, CheckCircle, Clock, Truck, ChevronRight } from 'lucide-react';

const OrderTracking = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const orderIdParam = searchParams.get('id') || '';

  const [orderIdInput, setOrderIdInput] = useState(orderIdParam);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = async (id) => {
    if (!id) return;
    setLoading(true);
    setErrorMsg('');
    setOrder(null);
    try {
      const res = await api.get(`/orders/${id}`);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Order not found. Check ID and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (orderIdParam) {
      fetchOrder(orderIdParam);
    }
  }, [orderIdParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!orderIdInput.trim()) return;
    setSearchParams({ id: orderIdInput.trim() });
  };

  // Status mapping to Stepper indexes
  const statusSteps = ['Pending', 'Confirmed', 'Preparing', 'Ready', 'Out For Delivery', 'Delivered'];
  
  const getActiveStepIndex = (status) => {
    if (status === 'Payment Verification Pending') return 0; // equivalent to pending
    const index = statusSteps.indexOf(status);
    return index !== -1 ? index : 0;
  };

  const getStepIcon = (index) => {
    switch (index) {
      case 0: return Clock;
      case 1: return CheckCircle;
      case 2: return Package;
      case 3: return CheckCircle;
      case 4: return Truck;
      case 5: return CheckCircle;
      default: return Clock;
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-800 font-serif">Track Your Order</h1>
        <p className="text-slate-500 text-sm">Enter your Order ID below to view live baking & delivery progress.</p>
      </div>

      {/* Search Order ID Form */}
      <form onSubmit={handleSearchSubmit} className="max-w-md mx-auto flex gap-3">
        <input
          type="text"
          value={orderIdInput}
          onChange={(e) => setOrderIdInput(e.target.value)}
          className="block flex-grow border border-bakery-200 rounded-full px-5 py-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500 bg-white"
          placeholder="e.g. 1004"
        />
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-full text-white font-bold text-xs chocolate-btn flex items-center gap-1.5 shrink-0"
        >
          <Search className="h-4 w-4" />
          <span>{loading ? 'Searching...' : 'Track'}</span>
        </button>
      </form>

      {/* Error Feedback */}
      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm font-semibold text-center max-w-md mx-auto">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-bakery-700"></div>
        </div>
      )}

      {/* Tracking Details View */}
      {order && (
        <div className="space-y-6">
          {/* Status Banner */}
          <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm flex flex-col sm:flex-row justify-between items-center gap-4">
            <div>
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Order ID: #{order.id}</p>
              <h2 className="text-2xl font-black text-slate-800 mt-1">Status: <span className="text-amber-700 font-serif">{order.orderStatus}</span></h2>
              <p className="text-xs text-slate-500 mt-1">Placed on {new Date(order.createdAt).toLocaleString()}</p>
            </div>
            
            <div className="text-center sm:text-right shrink-0">
              <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimated Delivery</p>
              <p className="text-sm font-extrabold text-slate-800 mt-1">{order.deliveryDate}</p>
              <p className="text-xs text-slate-500">{order.deliveryTime}</p>
            </div>
          </div>

          {/* Stepper Progress */}
          {order.orderStatus === 'Cancelled' ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-3xl p-6 text-center space-y-2">
              <h3 className="font-bold text-lg">Order Cancelled</h3>
              <p className="text-xs">This order has been cancelled by the bakery owner or due to payment verification issues.</p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-6">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3">Live Progress Timeline</h3>
              
              {/* Desktop Stepper */}
              <div className="hidden sm:flex justify-between relative">
                {/* Connector line */}
                <div className="absolute top-5 left-8 right-8 h-1 bg-slate-200 -z-0">
                  <div
                    className="h-full bg-amber-600 transition-all duration-500"
                    style={{ width: `${(getActiveStepIndex(order.orderStatus) / (statusSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {statusSteps.map((step, idx) => {
                  const activeIdx = getActiveStepIndex(order.orderStatus);
                  const isCompleted = idx < activeIdx;
                  const isCurrent = idx === activeIdx;
                  const StepIcon = getStepIcon(idx);

                  return (
                    <div key={step} className="flex flex-col items-center relative z-10 w-20 text-center">
                      <div
                        className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition ${
                          isCompleted
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : isCurrent
                            ? 'bg-white border-amber-700 text-amber-700 font-extrabold ring-4 ring-amber-50'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <StepIcon className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-[10px] font-bold mt-2 leading-tight ${
                          isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Mobile Stepper (Vertical list) */}
              <div className="flex sm:hidden flex-col gap-6 pl-4 relative">
                {/* vertical timeline connector line */}
                <div className="absolute top-2 bottom-2 left-6 w-0.5 bg-slate-200">
                  <div
                    className="w-full bg-amber-600 transition-all duration-500"
                    style={{ height: `${(getActiveStepIndex(order.orderStatus) / (statusSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {statusSteps.map((step, idx) => {
                  const activeIdx = getActiveStepIndex(order.orderStatus);
                  const isCompleted = idx < activeIdx;
                  const isCurrent = idx === activeIdx;
                  const StepIcon = getStepIcon(idx);

                  return (
                    <div key={step} className="flex items-center gap-4 relative z-10">
                      <div
                        className={`h-9 w-9 rounded-full flex items-center justify-center border-2 transition shrink-0 ${
                          isCompleted
                            ? 'bg-amber-600 border-amber-600 text-white'
                            : isCurrent
                            ? 'bg-white border-amber-700 text-amber-700 ring-4 ring-amber-50'
                            : 'bg-slate-100 border-slate-200 text-slate-400'
                        }`}
                      >
                        <StepIcon className="h-4.5 w-4.5" />
                      </div>
                      <span
                        className={`text-xs font-bold ${
                          isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                        }`}
                      >
                        {step}
                        {isCurrent && <span className="text-[10px] text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded ml-2 font-normal">Active</span>}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left: Summary Items */}
            <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <ShoppingBag className="h-4.5 w-4.5 text-amber-600" />
                <span>Items Ordered</span>
              </h3>
              
              <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto pr-2 scrollbar-thin">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <img
                      src={getImageUrl(item.product?.imageUrl)}
                      alt={item.product?.name}
                      className="h-10 w-10 rounded-lg object-cover bg-slate-100"
                    />
                    <div className="flex-grow min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{item.product?.name}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">₹{parseFloat(item.price).toFixed(2)} x {item.quantity}</p>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-sm font-bold text-slate-800">
                <span>Total Amount Paid</span>
                <span className="text-amber-700 text-base">₹{parseFloat(order.totalAmount).toFixed(2)}</span>
              </div>
            </div>

            {/* Right: Delivery Details */}
            <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-4">
              <h3 className="font-bold text-slate-800 text-sm border-b border-slate-100 pb-3 flex items-center gap-1.5">
                <MapPin className="h-4.5 w-4.5 text-amber-600" />
                <span>Delivery Details</span>
              </h3>
              
              <div className="text-xs space-y-3 text-slate-600">
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Customer Name</p>
                  <p className="font-bold text-slate-800 mt-0.5">{order.customerName}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Phone Number</p>
                  <p className="font-bold text-slate-800 mt-0.5">{order.customerPhone}</p>
                </div>
                <div>
                  <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Delivery Address</p>
                  <p className="font-bold text-slate-800 mt-0.5 leading-relaxed">{order.customerAddress}</p>
                </div>
                {order.specialNote && (
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Special Instructions</p>
                    <p className="font-bold text-amber-900 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-0.5 italic">
                      "{order.specialNote}"
                    </p>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2">
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Payment Type</p>
                    <p className="font-bold text-slate-800 mt-0.5">{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className="font-bold text-slate-400 uppercase tracking-wider text-[10px]">Payment Status</p>
                    <p className={`font-bold mt-0.5 uppercase ${
                      order.paymentStatus === 'verified'
                        ? 'text-emerald-600'
                        : order.paymentStatus === 'failed'
                        ? 'text-red-600'
                        : 'text-amber-600'
                    }`}>{order.paymentStatus}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
