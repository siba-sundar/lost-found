import pool from "../config/db.js";
import multer from 'multer';
import cloudinary from 'cloudinary';


// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads');  // Temporary folder to store images
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);  // Rename file with a timestamp
    }
});

// Allow multiple image uploads
const upload = multer({ storage: storage }).array('images', 5);  // Max 5 images per upload

// Function to upload to Cloudinary
const uploadToCloudinary = async (filePath) => {
    try {
        const result = await cloudinary.uploader.upload(filePath);
        return result.secure_url;  // Return Cloudinary secure URL
    } catch (error) {
        console.error("Error uploading to Cloudinary:", error);
        throw error;
    }
};

// Add item controller with image handling
export const addItem = async (req, res) => {
    // First handle file uploads with Multer
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: 'Error uploading images', error: err });
        }

        try {
            const { itemName, description, location, dateFound, timeFound, type, token } = req.body;

            // Validate required fields
            if (!itemName || !description || !location || !dateFound || !timeFound) {
                return res.status(400).json({
                    success: false,
                    message: "All details are required"
                });
            }

            // Extract user details from token
            const userDetails = extractUserFromToken(token, process.env.JWT_SECRET);
            if (!userDetails) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid token or user not authenticated"
                });
            }

            // SQL query for inserting the item
            let query;
            let values;
            if (type === "found") {
                query = `
                    INSERT INTO items (item_name, description, found_by, location, date_found, time_found, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING item_id, item_name;
                `;
                values = [itemName, description, userDetails.userID, location, dateFound, timeFound, 'found'];
            } else if (type === "lost") {
                query = `
                    INSERT INTO items (item_name, description, lost_by, location, date_found, time_found, status)
                    VALUES ($1, $2, $3, $4, $5, $6, $7)
                    RETURNING item_id, item_name;
                `;
                values = [itemName, description, userDetails.userID, location, dateFound, timeFound, 'lost'];
            } else {
                return res.status(400).json({
                    success: false,
                    message: "Invalid item type. Only 'found' or 'lost' are allowed"
                });
            }

            // Insert the item into the database
            const result = await pool.query(query, values);
            const itemId = result.rows[0].item_id;

            // Handle image uploads to Cloudinary
            const imageUploadPromises = req.files.map(file => uploadToCloudinary(file.path));
            const imageUrls = await Promise.all(imageUploadPromises);

            // Insert image URLs into item_images table
            const imageInsertPromises = imageUrls.map(url => {
                return pool.query(`
                    INSERT INTO item_images (item_id, image_url)
                    VALUES ($1, $2);
                `, [itemId, url]);
            });

            await Promise.all(imageInsertPromises);

            return res.status(201).json({
                success: true,
                message: `${result.rows[0].item_name} added successfully with images`,
                images: imageUrls  // Returning the uploaded image URLs
            });

        } catch (err) {
            console.log("Error while adding items", err);
            return res.status(500).json({
                success: false,
                message: "An error occurred while uploading, please try after some time."
            });
        }
    });
};





// export const  editItem  = async(req, res) =>{
//     try{
//         const {}
//     }catch(err){
//         console.log("Error occured while editing item ",err)
//         return res.status(500).json({
//             success:false,
//             message:"Server Error, Please try again later",
//         })
//     }
// }