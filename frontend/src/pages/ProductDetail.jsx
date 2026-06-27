import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api, { getImageUrl } from '../services/api';
import { ArrowLeft, Star, ShoppingBag, Plus, Minus, CheckCircle, MessageSquare } from 'lucide-react';

const ProductDetail = () => {
  const { id } = useParams();
  const { cartItems, addToCart, updateQuantity } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Multiple images state
  const [activeImage, setActiveImage] = useState('');
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState('');
  const [reviewError, setReviewError] = useState('');

  // Fetch product data
  const loadProduct = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products/${id}`);
      setProduct(res.data);
      setActiveImage(res.data.imageUrl);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load product details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewSuccess('');
    setReviewError('');

    if (!newReviewName.trim() || !newReviewRating) {
      setReviewError('Please enter your name and select a rating.');
      return;
    }

    setSubmittingReview(true);
    try {
      const res = await api.post(`/products/${id}/reviews`, {
        customerName: newReviewName,
        rating: newReviewRating,
        comment: newReviewComment
      });

      setReviews(prev => [res.data, ...prev]);
      setNewReviewName('');
      setNewReviewRating(5);
      setNewReviewComment('');
      setReviewSuccess('Review submitted successfully! Thank you.');
      setTimeout(() => setReviewSuccess(''), 4000);
    } catch (err) {
      console.error(err);
      setReviewError(err.response?.data?.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-32">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-bakery-700"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="text-red-500 text-5xl">⚠️</div>
        <h2 className="text-2xl font-bold text-slate-800">Product Not Found</h2>
        <p className="text-slate-500">{error || 'The product you are looking for does not exist or has been removed.'}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-white font-bold text-sm gold-btn shadow-md">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Menu</span>
        </Link>
      </div>
    );
  }

  const cartItem = cartItems.find((item) => item.productId === product.id);
  const imagesList = [product.imageUrl, product.imageUrl2, product.imageUrl3].filter(Boolean);
  
  // Calculate average rating
  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : 'New';

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 space-y-12">
      {/* Back Button */}
      <div>
        <Link to="/" className="inline-flex items-center gap-2 text-slate-500 hover:text-bakery-800 font-semibold text-xs sm:text-sm bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm transition">
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Menu</span>
        </Link>
      </div>

      {/* Main Details Panel */}
      <div className="bg-white rounded-[32px] border border-slate-100 shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-8 p-6 sm:p-8">
        {/* Left Column: Image Viewer */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 shadow-inner">
            <img
              src={getImageUrl(activeImage)}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
            />
            {/* Category badge */}
            <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-bakery-900 px-3 py-1 rounded-full text-xs font-black shadow-sm">
              {product.category?.name || 'Bakery'}
            </span>
            {/* Availability badge */}
            {!product.available && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] flex items-center justify-center">
                <span className="bg-red-600 text-white font-black text-sm px-6 py-3 rounded-full uppercase tracking-wider shadow-lg">
                  Sold Out
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails grid */}
          {imagesList.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
              {imagesList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`relative h-20 w-20 rounded-xl overflow-hidden border-2 transition ${
                    activeImage === img ? 'border-amber-600 ring-2 ring-amber-600/20' : 'border-slate-200 hover:border-amber-500'
                  }`}
                >
                  <img src={getImageUrl(img)} alt={`thumbnail-${idx}`} className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Information */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Title & Ratings */}
            <div className="space-y-2">
              <h1 className="text-2xl sm:text-4xl font-black text-slate-800 leading-tight font-serif">{product.name}</h1>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 bg-amber-550/10 text-amber-700 px-2.5 py-1 rounded-full text-xs font-extrabold border border-amber-500/20">
                  <Star className="h-3.5 w-3.5 fill-amber-550 text-amber-550" />
                  <span>{avgRating}</span>
                </div>
                <span className="text-xs text-slate-500 font-medium">
                  {reviews.length} Customer {reviews.length === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>
            </div>

            {/* Price */}
            <div className="text-2xl sm:text-3xl font-black text-amber-700">
              ₹{parseFloat(product.price).toFixed(2)}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-sans">Product Description</h4>
              <p className="text-slate-600 text-sm leading-relaxed">{product.description || 'Delight in our premium freshly-baked cake made with love.'}</p>
            </div>
          </div>

          {/* Purchase Block */}
          <div className="pt-6 border-t border-slate-100">
            {product.available ? (
              cartItem ? (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 font-semibold block">Item is in your cart</span>
                  <div className="flex items-center justify-between border border-bakery-300 rounded-2xl p-1.5 bg-amber-50/40 shadow-inner max-w-xs">
                    <button
                      onClick={() => updateQuantity(product.id, cartItem.quantity - 1)}
                      className="px-3.5 py-2 bg-bakery-700 hover:bg-bakery-800 active:scale-95 text-white rounded-xl transition font-black text-sm shrink-0 flex items-center justify-center min-w-[36px] shadow-md"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-extrabold text-bakery-950 px-4 select-none">
                      {cartItem.quantity} in Cart
                    </span>
                    <button
                      onClick={() => updateQuantity(product.id, cartItem.quantity + 1)}
                      className="px-3.5 py-2 bg-bakery-700 hover:bg-bakery-800 active:scale-95 text-white rounded-xl transition font-black text-sm shrink-0 flex items-center justify-center min-w-[36px] shadow-md"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl text-white font-bold text-sm flex items-center justify-center gap-2 transition gold-btn shadow-md hover:shadow-lg active:scale-95"
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>Add to Cart</span>
                </button>
              )
            ) : (
              <button
                disabled
                className="w-full sm:w-auto px-8 py-4 rounded-2xl text-slate-400 bg-slate-150 font-bold text-sm cursor-not-allowed text-center"
              >
                Currently Unavailable
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Review Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Write a Review Form */}
        <div className="lg:col-span-1 bg-white border border-slate-100 shadow-md p-6 rounded-[24px] space-y-4 self-start">
          <h3 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="h-5 w-5 text-amber-600" />
            <span>Write a Review</span>
          </h3>

          {reviewSuccess && (
            <div className="bg-emerald-50 text-emerald-700 border border-emerald-250 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle className="h-4 w-4 shrink-0" />
              <span>{reviewSuccess}</span>
            </div>
          )}

          {reviewError && (
            <div className="bg-red-50 text-red-700 border border-red-200 p-3.5 rounded-xl text-xs font-semibold">
              ⚠️ {reviewError}
            </div>
          )}

          <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="font-bold text-slate-500">Your Name</label>
              <input
                type="text"
                required
                value={newReviewName}
                onChange={(e) => setNewReviewName(e.target.value)}
                className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500 text-xs"
                placeholder="Enter your name"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-slate-500 block">Rating</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="p-1 hover:scale-110 transition"
                  >
                    <Star
                      className={`h-6 w-6 ${
                        star <= newReviewRating
                          ? 'fill-amber-555 text-amber-555'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-500">Review Comments</label>
              <textarea
                rows={4}
                value={newReviewComment}
                onChange={(e) => setNewReviewComment(e.target.value)}
                className="block w-full border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-bakery-500 text-xs"
                placeholder="Tell us what you liked or how we can improve..."
              />
            </div>

            <button
              type="submit"
              disabled={submittingReview}
              className="w-full py-3 px-4 rounded-xl text-xs font-semibold text-white chocolate-btn shadow-md disabled:opacity-50"
            >
              {submittingReview ? 'Submitting Review...' : 'Submit Review'}
            </button>
          </form>
        </div>

        {/* Right: Reviews List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 shadow-md p-6 rounded-[24px] space-y-6">
          <h3 className="text-lg font-bold text-slate-800 font-serif border-b border-slate-100 pb-3">
            Customer Reviews ({reviews.length})
          </h3>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Star className="h-10 w-10 text-slate-200 mx-auto mb-2" />
              <p>No reviews yet for this product. Be the first to share your experience!</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto pr-2 scrollbar-thin space-y-6">
              {reviews.map((rev) => (
                <div key={rev.id} className="pt-4 first:pt-0 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-slate-800">{rev.customerName}</h4>
                      <p className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>

                    <div className="flex gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${
                            i < rev.rating ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-650 text-xs leading-relaxed">{rev.comment || 'No text review comment left.'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
