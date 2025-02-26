import cloudinary from 'cloudinary';
import fs from "fs"



// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to upload to Cloudinary
export const uploadToCloudinary = async (filePath) => {
  try {
    if(!filePath){
      return ("No fie path found")
    }

    const result = await cloudinary.uploader.upload(filePath);
    const url = cloudinary.url(result.public_id, {
      transformation: [
        { quality: "auto", fetch_format: "auto" },
        { width: 1200, height: 1200 }
      ]
    });
    return url;
    
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
