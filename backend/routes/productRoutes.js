const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getProductReviews,
  createProductReview
} = require('../controllers/productController');
const { protect, admin } = require('../middleware/auth');
const { handleMultipleImagesUpload } = require('../middleware/upload');

// Categories routes
router.get('/categories', getCategories);
router.post('/categories', protect, admin, createCategory);

// Public catalog routes
router.get('/', getProducts);
router.get('/:id', getProductById);

// Reviews routes
router.get('/:id/reviews', getProductReviews);
router.post('/:id/reviews', createProductReview);

// Admin-only product modification routes
router.post('/', protect, admin, handleMultipleImagesUpload, createProduct);
router.put('/:id', protect, admin, handleMultipleImagesUpload, updateProduct);
router.delete('/:id', protect, admin, deleteProduct);

module.exports = router;
