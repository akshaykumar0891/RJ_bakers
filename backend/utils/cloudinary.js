const cloudinary = require('cloudinary').v2;
const fs = require('fs');
require('dotenv').config();

const isConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('☁️ Cloudinary SDK configured successfully.');
} else {
  console.log('☁️ Cloudinary credentials not found in .env. File uploads will default to local static storage.');
}

const uploadToCloudinary = async (localFilePath, folderName = 'rj_bakers') => {
  if (!isConfigured) {
    return null;
  }

  try {
    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: folderName,
      resource_type: 'auto'
    });

    // Remove local temp file
    if (fs.existsSync(localFilePath)) {
      fs.unlinkSync(localFilePath);
    }

    return result.secure_url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed, keeping local file:', error.message);
    return null;
  }
};

module.exports = {
  isConfigured,
  uploadToCloudinary
};
