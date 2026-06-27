import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api, { getImageUrl } from '../services/api';
import { Phone, MapPin, Calendar, Clock, CreditCard, Landmark, FileText, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const { cartItems, specialNote, getCartTotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();



  // Form Fields
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState('+91');
  const [customerAddress, setCustomerAddress] = useState('');
  
  // Default delivery date to tomorrow
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };
  const [deliveryDate, setDeliveryDate] = useState(getTomorrowDate());
  const [deliveryTime, setDeliveryTime] = useState('12:00 PM');
  const [paymentMethod, setPaymentMethod] = useState('COD');
  
  // UPI Specific fields
  const [upiSettings, setUpiSettings] = useState(null);
  const [transactionId, setTransactionId] = useState('');

  // States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleCopyId = () => {
    if (successOrder) {
      navigator.clipboard.writeText(successOrder.id.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getDeliveryCharge = () => {
    if (!upiSettings) return 0;
    if (upiSettings.deliveryChargeType === 'fixed') {
      return parseFloat(upiSettings.deliveryChargeAmount) || 0;
    }
    return 0;
  };

  const deliveryCharge = getDeliveryCharge();
  const totalAmount = getCartTotal() + deliveryCharge;

  // Redirect if cart empty or user not logged in
  useEffect(() => {
    if (successOrder) return; // Don't redirect if success block is shown
    
    if (cartItems.length === 0) {
      navigate('/cart');
    } else if (!user) {
      navigate('/login?redirect=/checkout');
    }
  }, [cartItems, user, navigate, successOrder]);

  // Fetch UPI settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get('/admin/settings');
        setUpiSettings(res.data);
        if (res.data.deliverySlots) {
          const parsed = typeof res.data.deliverySlots === 'string'
            ? JSON.parse(res.data.deliverySlots)
            : res.data.deliverySlots;
          const active = parsed.filter(s => s.enabled);
          if (active.length > 0) {
            setDeliveryTime(active[0].value);
          }
        }
      } catch (err) {
        console.error('Failed to load shop payment settings:', err.message);
      }
    };
    fetchSettings();
  }, []);

  const getActiveSlots = () => {
    if (!upiSettings || !upiSettings.deliverySlots) {
      return [
        { value: '10:00 AM', label: 'Morning (10:00 AM - 12:00 PM)', enabled: true },
        { value: '12:00 PM', label: 'Noon (12:00 PM - 02:00 PM)', enabled: true },
        { value: '02:00 PM', label: 'Afternoon (02:00 PM - 04:00 PM)', enabled: true },
        { value: '04:00 PM', label: 'Evening (04:00 PM - 06:00 PM)', enabled: true },
        { value: '06:00 PM', label: 'Late Evening (06:00 PM - 08:00 PM)', enabled: true },
        { value: '08:00 PM', label: 'Night (08:00 PM - 10:00 PM)', enabled: true }
      ];
    }
    try {
      const parsed = typeof upiSettings.deliverySlots === 'string'
        ? JSON.parse(upiSettings.deliverySlots)
        : upiSettings.deliverySlots;
      const active = parsed.filter(s => s.enabled);
      return active.length > 0 ? active : parsed;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const validateIndianPhone = (phone) => {
    // Remove spaces, hyphens, parentheses
    let cleaned = phone.replace(/[\s\-()]/g, '');
    
    // If it starts with +91, remove +91
    if (cleaned.startsWith('+91')) {
      cleaned = cleaned.substring(3);
    }
    // If it starts with 91 (length 12), remove 91
    else if (cleaned.startsWith('91') && cleaned.length === 12) {
      cleaned = cleaned.substring(2);
    }
    // If it starts with 0 (length 11), remove 0
    else if (cleaned.startsWith('0') && cleaned.length === 11) {
      cleaned = cleaned.substring(1);
    }

    // Now it should be exactly 10 digits
    const pattern = /^\d{10}$/;
    if (pattern.test(cleaned)) {
      return { isValid: true, normalized: '+91' + cleaned };
    }
    return { isValid: false, normalized: phone };
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!customerName || !customerPhone || !customerAddress || !deliveryDate || !deliveryTime) {
      setErrorMsg('Please fill in all delivery details.');
      return;
    }

    const phoneValidation = validateIndianPhone(customerPhone);
    if (!phoneValidation.isValid) {
      setErrorMsg('Please enter a valid 10-digit mobile number (e.g. 9876543210 or with +91).');
      return;
    }
    const cleanPhone = phoneValidation.normalized;

    if (paymentMethod === 'UPI') {
      if (!transactionId) {
        setErrorMsg('UPI Transaction ID is required for verification.');
        return;
      }
    }

    setSubmitting(true);

    try {
      const cartPayload = cartItems.map((item) => ({
        productId: item.productId,
        quantity: item.quantity
      }));

      const orderData = {
        customerName,
        customerPhone: cleanPhone,
        customerAddress,
        deliveryDate,
        deliveryTime,
        specialNote,
        paymentMethod,
        items: cartPayload,
        transactionId: paymentMethod === 'UPI' ? transactionId : null
      };

      const response = await api.post('/orders', orderData);

      // Clear Context Cart
      clearCart();
      
      // Set success order to show completion screen with copy action
      setSuccessOrder(response.data);
    } catch (err) {
      console.error('Order creation failed:', err);
      setErrorMsg(err.response?.data?.message || 'Failed to place order. Please try again.');
      setSubmitting(false);
    }
  };

  if (successOrder) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="bg-white border border-slate-150 shadow-xl rounded-[32px] p-8 space-y-6">
          <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
            <CheckCircle className="h-10 w-10 text-emerald-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-slate-800 font-serif">Order Placed Successfully!</h2>
            <p className="text-slate-500 text-xs">Your order has been recorded and is ready for preparation.</p>
          </div>

          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-3.5 text-left">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-slate-500">Order Reference ID:</span>
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 py-1 px-2.5 rounded-lg">
                <span className="font-black text-slate-800 font-mono text-sm">#{successOrder.id}</span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="text-amber-700 hover:text-amber-800 font-extrabold text-[10px] uppercase ml-1"
                >
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="font-semibold text-slate-500">Order Status:</span>
              <span className="font-black text-amber-700 uppercase tracking-wider">{successOrder.orderStatus}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Total Paid/Due:</span>
              <span className="font-black text-slate-800 font-bold">₹{parseFloat(successOrder.totalAmount).toFixed(2)}</span>
            </div>

            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Delivery Details:</span>
              <span className="font-bold text-slate-700 text-right">{successOrder.deliveryDate} ({successOrder.deliveryTime})</span>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              to={`/track?id=${successOrder.id}`}
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white chocolate-btn shadow-md text-center block"
            >
              Track Live Progress
            </Link>
            <Link
              to="/"
              className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-slate-650 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition text-center block"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-slate-800 font-serif">Checkout Details</h1>
        <p className="text-slate-500 text-sm mt-1">Provide delivery information and choose payment method.</p>
      </div>

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-200 px-4 py-3 rounded-xl text-sm font-semibold text-center">
          ⚠️ {errorMsg}
        </div>
      )}

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Input Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Delivery Card */}
          <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
              <MapPin className="h-5 w-5 text-amber-600" />
              <span>Delivery Details</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Contact Name</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                  placeholder="Rahul Sharma"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Phone Number</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Phone className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value.replace(/[^0-9+]/g, ''))}
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500 text-xs"
                    placeholder="e.g. 9876543210 or +91..."
                  />
                </div>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-xs font-bold text-slate-500">Delivery Address</label>
                <textarea
                  required
                  value={customerAddress}
                  onChange={(e) => setCustomerAddress(e.target.value)}
                  rows="2"
                  className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                  placeholder="Enter full home/venue address for delivery..."
                ></textarea>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Delivery Date</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-slate-400" />
                  </div>
                  <input
                    type="date"
                    required
                    min={getTomorrowDate()}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500 text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Delivery Time Slot</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Clock className="h-4 w-4 text-slate-400" />
                  </div>
                  <select
                    required
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(e.target.value)}
                    className="block w-full pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-bakery-500 text-xs bg-white"
                  >
                    {getActiveSlots().map((slot) => (
                      <option key={slot.value} value={slot.value}>
                        {slot.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-slate-800 text-base font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
              <CreditCard className="h-5 w-5 text-amber-600" />
              <span>Select Payment Method</span>
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'COD'
                    ? 'border-bakery-700 bg-bakery-50/50 text-bakery-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="COD"
                  checked={paymentMethod === 'COD'}
                  onChange={() => setPaymentMethod('COD')}
                  className="sr-only"
                />
                <Landmark className="h-6 w-6 mb-2" />
                <span className="text-xs">Cash On Delivery</span>
              </label>

              <label
                className={`flex flex-col items-center justify-center p-4 border rounded-2xl cursor-pointer transition ${
                  paymentMethod === 'UPI'
                    ? 'border-bakery-700 bg-bakery-50/50 text-bakery-950 font-bold'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="UPI"
                  checked={paymentMethod === 'UPI'}
                  onChange={() => setPaymentMethod('UPI')}
                  className="sr-only"
                />
                <span className="text-lg mb-1.5">📱</span>
                <span className="text-xs">UPI QR Payment</span>
              </label>
            </div>

            {/* UPI Workflow Section */}
            {paymentMethod === 'UPI' && upiSettings && (
              <div className="mt-6 border-t border-dashed border-bakery-200 pt-6 space-y-5">
                <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="h-32 w-32 shrink-0 bg-white border border-slate-200 rounded-xl overflow-hidden flex items-center justify-center shadow-sm">
                    <img
                      src={getImageUrl(upiSettings.qrImageUrl)}
                      alt="UPI QR Code"
                      className="h-full w-full object-contain p-2"
                    />
                  </div>
                  <div className="space-y-1.5 text-center sm:text-left text-xs text-slate-600">
                    <p className="font-extrabold text-sm text-slate-800">Scan & Pay via UPI</p>
                    <p>Open GPay/PhonePe/Paytm, scan the QR code, and pay the exact order amount.</p>
                    <div className="bg-white p-2 rounded-lg border border-slate-200 font-mono text-[11px] select-all cursor-pointer mt-1">
                      UPI ID: <span className="font-bold text-bakery-900">{upiSettings.upiId}</span>
                    </div>
                    <p className="text-[10px] text-slate-400">Owner Contact: {upiSettings.phoneNumber}</p>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">UPI Transaction ID (Required)</label>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                    placeholder="Enter 12-digit Ref / UTR number"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right: Cart Review & Place Button */}
        <div>
          <div className="bg-white rounded-3xl border border-bakery-100 p-6 shadow-sm space-y-6 sticky top-20">
            <h3 className="font-bold text-slate-800 text-base font-serif">Checkout Review</h3>

            {/* Cart summary items */}
            <div className="max-h-48 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
              {cartItems.map((item) => (
                <div key={item.productId} className="flex justify-between items-center text-xs text-slate-600">
                  <div className="truncate pr-4">
                    <span className="font-semibold text-slate-800">{item.name}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Qty: {item.quantity}</span>
                  </div>
                  <span className="font-bold text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="divide-y divide-slate-100 text-sm border-t border-slate-100 pt-3">
              <div className="flex justify-between py-2 text-xs">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-semibold text-slate-700">₹{getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-xs">
                <span className="text-slate-500">Delivery Charge</span>
                {deliveryCharge > 0 ? (
                  <span className="font-semibold text-slate-700">₹{deliveryCharge.toFixed(2)}</span>
                ) : (
                  <span className="font-semibold text-emerald-600">FREE</span>
                )}
              </div>
              <div className="flex justify-between py-3 text-base font-bold text-slate-800 border-t border-slate-100 pt-3">
                <span>Amount Due</span>
                <span className="text-amber-700 font-black">₹{totalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white chocolate-btn shadow-md disabled:opacity-50 flex justify-center items-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{submitting ? 'Placing Order...' : 'Place Order'}</span>
            </button>
            
            {paymentMethod === 'UPI' && (
              <p className="text-[10px] text-slate-400 text-center">
                Your order status will be placed under verification until the owner confirms your payment.
              </p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Checkout;
