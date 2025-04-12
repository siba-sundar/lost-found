import cloudinary from 'cloudinary';
import fs from 'fs';

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload to Cloudinary
export const uploadToCloudinary = async (filePath) => {
  try {
    if (!filePath) {
      throw new Error("No file path found");
    }
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found at path: ${filePath}`);
    }

    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: 'auto', // Auto-detect resource type
      quality: 'auto',
      fetch_format: 'auto',
      width: 1200,
      height: 1200,
      crop: 'limit', // Resize to fit within these dimensions
    });

    // Return the secure URL
    return result.secure_url;
  } catch (error) {
    console.error("Error uploading to Cloudinary: ", error);
    throw error;
  }
};

// // API endpoint to handle file uploads
// app.post('/upload', upload.single('image'), async (req, res) => {
//   try {
//     const filePath = req.file.path;  // File path of the uploaded image
//     const cloudinaryUrl = await uploadToCloudinary(filePath);
//     res.json({ url: cloudinaryUrl });
//   } catch (error) {
//     res.status(500).json({ error: 'Failed to upload image' });
//   }
// });
