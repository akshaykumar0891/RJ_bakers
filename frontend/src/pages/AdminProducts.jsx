import { useState, useEffect } from 'react';
import api, { getImageUrl } from '../services/api';
import { Package, Plus, Edit, Trash2, Check, X, ToggleLeft, ToggleRight, Upload } from 'lucide-react';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // null for Add, object for Edit

  // Form fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [available, setAvailable] = useState(true);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile2, setImageFile2] = useState(null);
  const [imagePreview2, setImagePreview2] = useState(null);
  const [imageFile3, setImageFile3] = useState(null);
  const [imagePreview3, setImagePreview3] = useState(null);

  // States
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [catInputOpen, setCatInputOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');

  // Fetch products & categories
  const loadProducts = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get('/products'),
        api.get('/products/categories')
      ]);
      setProducts(productsRes.data);
      setCategories(categoriesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) return;
    try {
      const res = await api.post('/products/categories', { name: newCatName.trim() });
      const createdCategory = res.data;
      setCategories((prev) => [...prev, createdCategory].sort((a, b) => a.name.localeCompare(b.name)));
      setCategoryId(createdCategory.id);
      setNewCatName('');
      setCatInputOpen(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const openAddModal = () => {
    setEditProduct(null);
    setName('');
    setPrice('');
    setDescription('');
    setCategoryId(categories[0]?.id || '1');
    setAvailable(true);
    setImageFile(null);
    setImagePreview(null);
    setImageFile2(null);
    setImagePreview2(null);
    setImageFile3(null);
    setImagePreview3(null);
    setErrorMsg('');
    setModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditProduct(product);
    setName(product.name);
    setPrice(product.price);
    setDescription(product.description || '');
    setCategoryId(product.categoryId);
    setAvailable(product.available);
    setImageFile(null);
    setImagePreview(getImageUrl(product.imageUrl));
    setImageFile2(null);
    setImagePreview2(product.imageUrl2 ? getImageUrl(product.imageUrl2) : null);
    setImageFile3(null);
    setImagePreview3(product.imageUrl3 ? getImageUrl(product.imageUrl3) : null);
    setErrorMsg('');
    setModalOpen(true);
  };

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

  const handleFileChange2 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('❌ File size exceeds 10MB limit! Please upload a smaller image (max 10MB).');
        e.target.value = ''; // Reset input
        setImageFile2(null);
        setImagePreview2(null);
        return;
      }
      setErrorMsg('');
      setImageFile2(file);
      setImagePreview2(URL.createObjectURL(file));
    }
  };

  const handleFileChange3 = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg('❌ File size exceeds 10MB limit! Please upload a smaller image (max 10MB).');
        e.target.value = ''; // Reset input
        setImageFile3(null);
        setImagePreview3(null);
        return;
      }
      setErrorMsg('');
      setImageFile3(file);
      setImagePreview3(URL.createObjectURL(file));
    }
  };

  // Quick toggle availability status
  const handleToggleAvailability = async (product) => {
    try {
      const updatedStatus = !product.available;
      
      // Update local state first for instant UX feedback
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, available: updatedStatus } : p)
      );

      await api.put(`/products/${product.id}`, {
        available: updatedStatus
      });
    } catch (err) {
      console.error('Failed to toggle availability:', err);
      // Revert if error
      loadProducts();
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('Are you sure you want to remove this product from catalog?')) return;
    try {
      await api.delete(`/products/${productId}`);
      setProducts(prev => prev.filter(p => p.id !== productId));
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSubmitting(true);

    if (!name || !price || !categoryId) {
      setErrorMsg('Name, Price, and Category are required');
      setSubmitting(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('description', description);
      formData.append('categoryId', categoryId);
      formData.append('available', available);
      if (imageFile) {
        formData.append('image', imageFile);
      }
      if (imageFile2) {
        formData.append('image2', imageFile2);
      }
      if (imageFile3) {
        formData.append('image3', imageFile3);
      }

      if (editProduct) {
        // UPDATE
        await api.put(`/products/${editProduct.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      } else {
        // CREATE
        await api.post('/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }

      setModalOpen(false);
      loadProducts();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.response?.data?.message || 'Error processing product. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-sans">Product Catalog Control</h2>
          <p className="text-slate-500 text-xs mt-0.5">Maintain items in the catalog, modify pricing, and toggle instant shop availability.</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-white font-bold text-xs gold-btn shadow-sm shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table List */}
      {loading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-bakery-700"></div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-extrabold border-b border-slate-200">
                  <th className="p-4">Item details</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-center">Availability (Quick Toggle)</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50">
                    <td className="p-4 flex items-center gap-3">
                      <img
                        src={getImageUrl(product.imageUrl)}
                        alt={product.name}
                        className="h-10 w-10 rounded-lg object-cover bg-slate-100 shrink-0"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">{product.name}</p>
                        <p className="text-slate-400 text-[10px] truncate max-w-xs">{product.description || 'No description.'}</p>
                      </div>
                    </td>
                    <td className="p-4 font-semibold text-slate-600">{product.category?.name || 'Uncategorized'}</td>
                    <td className="p-4 font-extrabold text-slate-800">₹{parseFloat(product.price).toFixed(2)}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => handleToggleAvailability(product)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold border transition ${
                          product.available
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-700 border-red-200'
                        }`}
                        title="Click to toggle availability"
                      >
                        {product.available ? (
                          <>
                            <Check className="h-3 w-3" />
                            <span>Available</span>
                          </>
                        ) : (
                          <>
                            <X className="h-3 w-3" />
                            <span>Sold Out</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit className="h-4.5 w-4.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Add / Edit Product */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          
          <div className="bg-white rounded-3xl border border-slate-200 max-w-md w-full p-6 shadow-xl relative z-10 space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-800 font-serif">
              {editProduct ? 'Edit Catalog Product' : 'Add New Product'}
            </h3>

            {errorMsg && (
              <p className="bg-red-50 text-red-700 border border-red-200 p-3 rounded-xl text-xs font-semibold text-center">
                {errorMsg}
              </p>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-500">Product Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                  placeholder="e.g. Chocolate Truffle Cake"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-bold text-slate-500">Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                    placeholder="e.g. 650"
                  />
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="font-bold text-slate-500">Category</label>
                    <button
                      type="button"
                      onClick={() => setCatInputOpen(!catInputOpen)}
                      className="text-[10px] font-bold text-amber-700 hover:underline"
                    >
                      {catInputOpen ? 'Cancel' : '+ New Category'}
                    </button>
                  </div>

                  {catInputOpen ? (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newCatName}
                        onChange={(e) => setNewCatName(e.target.value)}
                        placeholder="e.g. Bread"
                        className="block flex-grow border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                      />
                      <button
                        type="button"
                        onClick={handleCreateCategory}
                        className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-[10px]"
                      >
                        Create
                      </button>
                    </div>
                  ) : (
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500 bg-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-500">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  className="block w-full border border-slate-200 rounded-xl p-3 text-xs focus:outline-none focus:ring-2 focus:ring-bakery-500"
                  placeholder="Provide ingredients, sizing details..."
                ></textarea>
              </div>

              {/* Image Uploader 1 */}
              <div className="space-y-2">
                <label className="font-bold text-slate-500 block">Product Primary Image</label>
                <div className="flex items-center gap-4">
                  {imagePreview && (
                    <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                      <img src={imagePreview} alt="Preview 1" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-3 cursor-pointer hover:bg-slate-50 flex-grow">
                    <Upload className="h-4 w-4 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Upload primary image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Image Uploader 2 */}
              <div className="space-y-2">
                <label className="font-bold text-slate-500 block">Product Extra Image 2 (Optional)</label>
                <div className="flex items-center gap-4">
                  {imagePreview2 && (
                    <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                      <img src={imagePreview2} alt="Preview 2" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-3 cursor-pointer hover:bg-slate-50 flex-grow">
                    <Upload className="h-4 w-4 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Upload extra image 2</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange2}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Image Uploader 3 */}
              <div className="space-y-2">
                <label className="font-bold text-slate-500 block">Product Extra Image 3 (Optional)</label>
                <div className="flex items-center gap-4">
                  {imagePreview3 && (
                    <div className="h-16 w-16 rounded-xl border border-slate-200 overflow-hidden shrink-0 bg-slate-50">
                      <img src={imagePreview3} alt="Preview 3" className="h-full w-full object-cover" />
                    </div>
                  )}
                  <label className="flex flex-col items-center justify-center border border-dashed border-slate-300 rounded-xl p-3 cursor-pointer hover:bg-slate-50 flex-grow">
                    <Upload className="h-4 w-4 text-slate-400 mb-1" />
                    <span className="text-[10px] text-slate-500">Upload extra image 3</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange3}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2 py-2">
                <input
                  type="checkbox"
                  id="avail_box"
                  checked={available}
                  onChange={(e) => setAvailable(e.target.checked)}
                  className="rounded text-bakery-600 focus:ring-bakery-500"
                />
                <label htmlFor="avail_box" className="font-bold text-slate-600 select-none">
                  Set product status as Available immediately
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 px-4 rounded-xl text-white font-semibold chocolate-btn shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Saving...' : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
