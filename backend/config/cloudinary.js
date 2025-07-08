const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadToCloudinary = async (file, folder = 'gram-panchayat') => {
  try {
    let uploadOptions = {
      folder: folder,
      resource_type: 'auto',
      quality: 'auto',
      fetch_format: 'auto'
    };
    let uploadResult;
    if (file.buffer) {
      uploadOptions.public_id = file.originalname.split('.')[0] + '-' + Date.now();
      uploadResult = await cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) throw error;
        return result;
      });
      // Use promise wrapper for upload_stream
      uploadResult = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        });
        stream.end(file.buffer);
      });
    } else {
      uploadResult = await cloudinary.uploader.upload(file.path, uploadOptions);
    }
    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      format: uploadResult.format,
      size: uploadResult.bytes
    };
  } catch (error) {
    throw new Error('File upload failed: ' + error.message);
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};

module.exports = {
  cloudinary,
  uploadToCloudinary,
  deleteFromCloudinary
};