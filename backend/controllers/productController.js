const { Product, Category, Review } = require('../models');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const { categoryId, categoryName } = req.query;
  const whereClause = {};

  try {
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const includeClause = [
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name']
      }
    ];

    if (categoryName) {
      includeClause[0].where = { name: categoryName };
    }

    const products = await Product.findAll({
      where: whereClause,
      include: includeClause,
      order: [['id', 'DESC']]
    });

    res.json(products);
  } catch (error) {
    console.error('❌ Fetch products error:', error.message);
    res.status(500).json({ message: 'Server error fetching products' });
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        },
        {
          model: Review,
          as: 'reviews'
        }
      ],
      order: [
        [{ model: Review, as: 'reviews' }, 'createdAt', 'DESC']
      ]
    });

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('❌ Fetch product details error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  const { name, price, description, categoryId, available } = req.body;

  try {
    if (!name || !price || !categoryId) {
      return res.status(400).json({ message: 'Please provide name, price, and category' });
    }

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: 'Invalid Category ID' });
    }

    // Image URLs from multiple upload fields
    const imageUrl = req.files && req.files['image'] && req.files['image'][0] ? req.files['image'][0].url : '/uploads/default-bakery.jpg';
    const imageUrl2 = req.files && req.files['image2'] && req.files['image2'][0] ? req.files['image2'][0].url : null;
    const imageUrl3 = req.files && req.files['image3'] && req.files['image3'][0] ? req.files['image3'][0].url : null;

    const product = await Product.create({
      name,
      price: parseFloat(price),
      description,
      categoryId: parseInt(categoryId),
      imageUrl,
      imageUrl2,
      imageUrl3,
      available: available === 'false' ? false : true
    });

    // Fetch created product with category
    const createdProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Review, as: 'reviews' }
      ]
    });

    res.status(201).json(createdProduct);
  } catch (error) {
    console.error('❌ Create product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  const { name, price, description, categoryId, available } = req.body;

  try {
    const product = await Product.findByPk(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (categoryId) {
      const category = await Category.findByPk(categoryId);
      if (!category) {
        return res.status(400).json({ message: 'Invalid Category ID' });
      }
      product.categoryId = parseInt(categoryId);
    }

    if (name) product.name = name;
    if (price) product.price = parseFloat(price);
    if (description !== undefined) product.description = description;
    if (available !== undefined) {
      product.available = available === 'true' || available === true;
    }

    if (req.files) {
      if (req.files['image'] && req.files['image'][0]) {
        product.imageUrl = req.files['image'][0].url;
      }
      if (req.files['image2'] && req.files['image2'][0]) {
        product.imageUrl2 = req.files['image2'][0].url;
      }
      if (req.files['image3'] && req.files['image3'][0]) {
        product.imageUrl3 = req.files['image3'][0].url;
      }
    }

    await product.save();

    // Fetch updated product with category
    const updatedProduct = await Product.findByPk(product.id, {
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name'] },
        { model: Review, as: 'reviews' }
      ]
    });

    res.json(updatedProduct);
  } catch (error) {
    console.error('❌ Update product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);

    if (product) {
      await product.destroy();
      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    console.error('❌ Delete product error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all categories
// @route   GET /api/products/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll({ order: [['name', 'ASC']] });
    res.json(categories);
  } catch (error) {
    console.error('❌ Fetch categories error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new category
// @route   POST /api/products/categories
// @access  Private/Admin
const createCategory = async (req, res) => {
  const { name } = req.body;

  try {
    if (!name) {
      return res.status(400).json({ message: 'Please provide category name' });
    }

    const trimmedName = name.trim();
    if (!trimmedName) {
      return res.status(400).json({ message: 'Category name cannot be empty' });
    }

    const exists = await Category.findOne({
      where: {
        name: trimmedName
      }
    });

    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({ name: trimmedName });
    res.status(201).json(category);
  } catch (error) {
    console.error('❌ Create category error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.findAll({
      where: { productId: req.params.id },
      order: [['createdAt', 'DESC']]
    });
    res.json(reviews);
  } catch (error) {
    console.error('❌ Get reviews error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Public
const createProductReview = async (req, res) => {
  const { customerName, rating, comment } = req.body;

  try {
    if (!customerName || !rating) {
      return res.status(400).json({ message: 'Please provide customer name and rating' });
    }

    const r = parseInt(rating);
    if (isNaN(r) || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    // Verify product exists
    const product = await Product.findByPk(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const review = await Review.create({
      productId: parseInt(req.params.id),
      customerName,
      rating: r,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('❌ Create review error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  createCategory,
  getProductReviews,
  createProductReview
};
