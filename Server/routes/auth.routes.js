import express from 'express';
import { userLogin, userSignup, refreshToken, logout } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';
import { upload } from '../middlewares/multer.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';


const authRoutes = express.Router();  // Correct definition

// Public routes
authRoutes.post('/login', userLogin);  // Changed 'router' to 'userRouter'
authRoutes.post('/signup', upload.single('image'), async (req, res) => {
    try {
        // Check if a file was uploaded
        if (req.file) {
            // Upload to Cloudinary and get the URL
            const imageUrl = await uploadToCloudinary(req.file.path);
            
            // Add the image URL to the request body
            req.body.imageUrl = imageUrl;
            
            // Delete the temporary file if needed
            fs.unlink(req.file.path, (err) => {
                if (err) console.error("Error deleting temporary file:", err);
            });
        }
        
        // Forward the request to the userSignup controller
        return userSignup(req, res);
        
    } catch (error) {
        console.error("Error in signup route:", error);
        return res.status(500).json({ 
            success: false,
            message: "Failed to process signup",
            error: error.message 
        });
    }
});

authRoutes.post('/refresh-token', refreshToken);
authRoutes.post('/logout', authenticateToken, logout);

// Protected routes


export default authRoutes;
