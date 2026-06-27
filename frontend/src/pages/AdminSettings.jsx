import { useState, useEffect } from 'react';
import api, { getImageUrl } from '../services/api';
import { Settings, Save, Upload, CheckCircle, Smartphone, Mail, QrCode, Clock, MapPin, Truck } from 'lucide-react';

const AdminSettings = () => {
  const [upiId, setUpiId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [bakeryEmail, setBakeryEmail] = useState('');
  const [qrImageUrl, setQrImageUrl] = useState('');
  const [deliverySlots, setDeliverySlots] = useState([]);
  const [bakeryAddress, setBakeryAddress] = useState('');
  const [deliveryChargeType, setDeliveryChargeType] = useState('free');
  const [deliveryChargeAmount, setDeliveryChargeAmount] = useState(0);
  
  // File upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // Statuses
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/settings');
      setUpiId(res.data.upiId || '');
      setPhoneNumber(res.data.phoneNumber || '');
      setBakeryEmail(res.data.bakeryEmail || '');
      setQrImageUrl(res.data.qrImageUrl || '');
      setImagePreview(getImageUrl(res.data.qrImageUrl));
      setBakeryAddress(res.data.bakeryAddress || '');
      setDeliveryChargeType(res.data.deliveryChargeType || 'free');
      setDeliveryChargeAmount(res.data.deliveryChargeAmount || 0);
      if (res.data.deliverySlots) {
        try {
          const parsed = typeof res.data.deliverySlots === 'string'
            ? JSON.parse(res.data.deliverySlots)
            : res.data.deliverySlots;
          setDeliverySlots(parsed);
        } catch (e) {
          console.error(e);
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to load shop settings');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSlot = (index) => {
    setDeliverySlots(prev => prev.map((s, idx) => 
      idx === index ? { ...s, enabled: !s.enabled } : s
    ));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('❌ File size exceeds 10MB limit! Please upload a smaller image (max 10MB).');
        e.target.value = ''; // Reset input
        setImageFile(null);
        setImagePreview(null);
        return;
      }
      setErrorMsg('');
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));

      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('⚠️ Warning: File size is above 5MB. Large files can degrade page loading performance.');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(false);
    setSuccessMsg('');
    setErrorMsg('');

    if (!upiId || !phoneNumber || !bakeryEmail) {
      setErrorMsg('All contact details are required');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('upiId', upiId);
      formData.append('phoneNumber', phoneNumber);
      formData.append('bakeryEmail', bakeryEmail);
      formData.append('bakeryAddress', bakeryAddress);
      formData.append('deliveryChargeType', deliveryChargeType);
      formData.append('deliveryChargeAmount', deliveryChargeAmount);
      formData.append('deliverySlots', JSON.stringify(deliverySlots));
      if (imageFile) {
        formData.append('qrImage', imageFile);
      }

      const res = await api.put('/admin/settings', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg('Settings updated successfully!');
      setQrImageUrl(res.data.qrImageUrl);
      setImagePreview(getImageUrl(res.data.qrImageUrl));
      setImageFile(null);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to save settings. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bakery-700"></div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Header Info */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 font-sans flex items-center gap-2">
          <Settings className="h-5 w-5 text-amber-600 animate-spin-slow" />
          <span>Shop & Payment Configuration</span>
        </h2>
        <p className="text-slate-500 text-xs mt-1">Configure parameters for customer ordering, UPI payments, and Nodemailer email receipts.</p>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 text-emerald-700 border border-emerald-250 p-4 rounded-xl text-xs font-semibold text-center flex items-center justify-center gap-2">
          <CheckCircle className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 text-red-700 border border-red-250 p-4 rounded-xl text-xs font-semibold text-center">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-5 text-xs">
        <div className="space-y-1">
          <label className="font-bold text-slate-500 flex items-center gap-1.5">
            < Smartphone className="h-4 w-4 text-slate-400" />
            <span>Store Phone Number</span>
          </label>
          <input
            type="text"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500"
            placeholder="e.g. +91 98765 43210"
          />
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-500 flex items-center gap-1.5">
            <Mail className="h-4 w-4 text-slate-400" />
            <span>Store Notification Email</span>
          </label>
          <input
            type="email"
            required
            value={bakeryEmail}
            onChange={(e) => setBakeryEmail(e.target.value)}
            className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500"
            placeholder="e.g. rjbakers@gmail.com"
          />
          <p className="text-[10px] text-slate-400">All new order notifications (via Nodemailer) will be forwarded to this address.</p>
        </div>

        <div className="space-y-1">
          <label className="font-bold text-slate-500 flex items-center gap-1.5">
            <MapPin className="h-4 w-4 text-slate-400" />
            <span>Store Physical Address</span>
          </label>
          <textarea
            required
            rows={3}
            value={bakeryAddress}
            onChange={(e) => setBakeryAddress(e.target.value)}
            className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500"
            placeholder="e.g. Opposite Masjid, Jagadamba Center"
          />
          <p className="text-[10px] text-slate-400">This address will be stored for store references and shown to customers.</p>
        </div>

        <div className="border-t border-dashed border-slate-200 pt-4 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <QrCode className="h-4 w-4 text-amber-600" />
            <span>UPI Payment Details</span>
          </h4>

          <div className="space-y-1">
            <label className="font-bold text-slate-500">Bakery Merchant UPI ID</label>
            <input
              type="text"
              required
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500 font-mono text-amber-950 font-bold"
              placeholder="e.g. rjbakers@upi"
            />
          </div>

          <div className="space-y-2">
            <label className="font-bold text-slate-500 block">UPI QR Scanner Image</label>
            <div className="flex items-center gap-4">
              {imagePreview && (
                <div className="h-24 w-24 rounded-xl border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 bg-slate-50">
                  <img src={imagePreview} alt="QR Scanner" className="h-full w-full object-contain" />
                </div>
              )}
              
              <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-4 cursor-pointer hover:bg-slate-50 flex-grow">
                <Upload className="h-5 w-5 text-slate-400 mb-1" />
                <span className="text-[10px] text-slate-500">Upload new scanner QR image</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Delivery Charge Configuration */}
        <div className="border-t border-dashed border-slate-200 pt-4 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Truck className="h-4 w-4 text-amber-600" />
            <span>Delivery Charge Policy</span>
          </h4>
          <p className="text-[10px] text-slate-400">Choose between Free Delivery or a Custom Fixed Charge per order.</p>
          
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1">
              <input
                type="radio"
                name="deliveryChargeType"
                value="free"
                checked={deliveryChargeType === 'free'}
                onChange={() => setDeliveryChargeType('free')}
                className="text-bakery-700 focus:ring-bakery-500 h-4 w-4 border-slate-300"
              />
              <span className="font-semibold text-slate-700">Free Delivery</span>
            </label>
            
            <label className="flex items-center gap-2 cursor-pointer p-2.5 border border-slate-200 rounded-xl hover:bg-slate-50 flex-1">
              <input
                type="radio"
                name="deliveryChargeType"
                value="fixed"
                checked={deliveryChargeType === 'fixed'}
                onChange={() => setDeliveryChargeType('fixed')}
                className="text-bakery-700 focus:ring-bakery-500 h-4 w-4 border-slate-300"
              />
              <span className="font-semibold text-slate-700">Fixed Custom Charge</span>
            </label>
          </div>

          {deliveryChargeType === 'fixed' && (
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Delivery Charge Amount (₹)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                required
                value={deliveryChargeAmount}
                onChange={(e) => setDeliveryChargeAmount(parseFloat(e.target.value) || 0)}
                className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500"
                placeholder="e.g. 40.00"
              />
            </div>
          )}
        </div>

        {/* Delivery slots UI */}
        <div className="border-t border-dashed border-slate-200 pt-4 space-y-4">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <Clock className="h-4 w-4 text-amber-600" />
            <span>Manage Delivery Time Slots</span>
          </h4>
          <p className="text-[10px] text-slate-400">Toggle delivery time slots on or off. Customers can only select enabled slots at checkout.</p>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            {deliverySlots.map((slot, index) => (
              <label key={slot.value} className="flex items-center gap-2.5 p-2 bg-white rounded-xl border border-slate-200 cursor-pointer hover:bg-amber-50/20 transition select-none">
                <input
                  type="checkbox"
                  checked={slot.enabled}
                  onChange={() => handleToggleSlot(index)}
                  className="rounded text-bakery-700 focus:ring-bakery-500 h-4.5 w-4.5 border-slate-300"
                />
                <span className="font-semibold text-slate-700">{slot.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="border-t border-slate-100 pt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 rounded-xl text-white font-semibold chocolate-btn shadow-md flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>{submitting ? 'Saving Configuration...' : 'Save Configuration'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;
