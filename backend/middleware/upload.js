const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadToCloudinary } = require('../utils/cloudinary');

// Ensure uploads folder exists
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage config (temporary local storage)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images only)
const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only images (jpg, jpeg, png, webp) are allowed!'));
};

const upload = multer({
  storage,
  limits: { fileSize: 15 * 1024 * 1024 }, // 15MB limit
  fileFilter
});

// Middleware to handle image upload & optional Cloudinary upload
const handleImageUpload = (fieldName) => {
  return (req, res, next) => {
    const singleUpload = upload.single(fieldName);

    singleUpload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ message: err.message });
      }

      if (!req.file) {
        return next(); // No file uploaded
      }

      try {
        const localPath = req.file.path;
        // Try uploading to Cloudinary
        const cloudinaryUrl = await uploadToCloudinary(localPath);

        if (cloudinaryUrl) {
          req.file.url = cloudinaryUrl;
        } else {
          // If Cloudinary is not configured or failed, use local URL path with server prefix
          const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
          req.file.url = `${serverUrl}/uploads/${req.file.filename}`;
        }
        next();
      } catch (error) {
        next(error);
      }
    });
  };
};

// Middleware to handle up to 3 image uploads (image, image2, image3)
const handleMultipleImagesUpload = (req, res, next) => {
  const fieldsUpload = upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'image2', maxCount: 1 },
    { name: 'image3', maxCount: 1 }
  ]);

  fieldsUpload(req, res, async (err) => {
    if (err) {
      return res.status(400).json({ message: err.message });
    }

    if (!req.files) {
      return next();
    }

    try {
      const fieldNames = ['image', 'image2', 'image3'];
      for (const fieldName of fieldNames) {
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];
          const localPath = file.path;
          const cloudinaryUrl = await uploadToCloudinary(localPath);
          if (cloudinaryUrl) {
            file.url = cloudinaryUrl;
          } else {
            const serverUrl = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
            file.url = `${serverUrl}/uploads/${file.filename}`;
          }
        }
      }
      next();
    } catch (error) {
      next(error);
    }
  });
};

module.exports = {
  handleImageUpload,
  handleMultipleImagesUpload
};
