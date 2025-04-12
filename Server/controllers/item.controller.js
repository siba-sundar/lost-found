import pool from "../config/db.js";
import { uploadToCloudinary } from '../utils/cloudinary.js';
import fs from 'fs';



// Add item controller 
export const addItem = async (req, res) => {
    try {
        // Req.files will be an array of uploaded files thanks to multer middleware
        const files = req.files || [];
        
        if (files.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one image is required"
            });
        }

        if (files.length > 3) {
            return res.status(400).json({
                success: false,
                message: "Maximum 3 images allowed"
            });
        }

        const { itemName, description, location, dateFound, timeFound, type } = req.body;
        const { userId } = req.user;

        // Validate required fields
        if (!itemName || !description || !location || !dateFound || !timeFound) {
            return res.status(400).json({
                success: false,
                message: "All details are required"
            });
        }

        // Get user ID from the request (set by authenticateToken middleware)
        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "User not authenticated"
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
            values = [itemName, description, userId, location, dateFound, timeFound, 'found'];
        } else if (type === "lost") {
            query = `
                INSERT INTO items (item_name, description, lost_by, location, date_found, time_found, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING item_id, item_name;
            `;
            values = [itemName, description, userId, location, dateFound, timeFound, 'lost'];
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
        const imageUrls = [];
        
        for (const file of files) {
            try {
                // Upload to Cloudinary
                const imageUrl = await uploadToCloudinary(file.path);
                imageUrls.push(imageUrl);
                
                // Delete the temp file after upload
                fs.unlink(file.path, (err) => {
                    if (err) console.error(`Failed to delete temp file: ${file.path}`, err);
                });
                
                // Insert image URL into item_images table
                await pool.query(`
                    INSERT INTO item_images (item_id, image_url)
                    VALUES ($1, $2);
                `, [itemId, imageUrl]);
                
            } catch (uploadError) {
                console.error("Error uploading to Cloudinary:", uploadError);
                // Continue with other images even if one fails
            }
        }

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
};



//get list of items

export const getItemsList = async (req, res) => {
    try {
        // Get pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const offset = (page - 1) * limit;
        
        // Get filter parameters
        const { status, location, search, dateFrom, dateTo } = req.query;
        
        // Base query - selecting all columns from items table, omitting user details
        let query = `
            SELECT i.*, 
                   (SELECT image_url FROM item_images WHERE item_id = i.item_id LIMIT 1) as primary_image_url,
                   (SELECT COUNT(*) FROM item_images WHERE item_id = i.item_id) as image_count
            FROM items i
            WHERE 1=1
        `;
        
        const queryParams = [];
        let paramCounter = 1;
        
        // Add filters if provided
        if (status) {
            query += ` AND i.status = $${paramCounter}`;
            queryParams.push(status);
            paramCounter++;
        }
        
        if (location) {
            query += ` AND i.location ILIKE $${paramCounter}`;
            queryParams.push(`%${location}%`);
            paramCounter++;
        }
        
        if (search) {
            query += ` AND (
                i.item_name ILIKE $${paramCounter} OR 
                i.description ILIKE $${paramCounter}
            )`;
            queryParams.push(`%${search}%`);
            paramCounter++;
        }
        
        // Add date range filters
        if (dateFrom) {
            query += ` AND i.date_found >= $${paramCounter}`;
            queryParams.push(dateFrom);
            paramCounter++;
        }
        
        if (dateTo) {
            query += ` AND i.date_found <= $${paramCounter}`;
            queryParams.push(dateTo);
            paramCounter++;
        }
        
        // Add sorting - newest items first
        query += ` ORDER BY i.time_entered DESC`;
        
        // Add pagination
        query += ` LIMIT $${paramCounter} OFFSET $${paramCounter + 1}`;
        queryParams.push(limit, offset);
        
        // Execute query
        const result = await pool.query(query, queryParams);
        
        // Count total matching items for pagination info
        let countQuery = `
            SELECT COUNT(*) 
            FROM items i
            WHERE 1=1
        `;
        
        // Reset param counter for count query
        paramCounter = 1;
        const countParams = [];
        
        // Add the same filters to count query
        if (status) {
            countQuery += ` AND i.status = $${paramCounter}`;
            countParams.push(status);
            paramCounter++;
        }
        
        if (location) {
            countQuery += ` AND i.location ILIKE $${paramCounter}`;
            countParams.push(`%${location}%`);
            paramCounter++;
        }
        
        if (search) {
            countQuery += ` AND (
                i.item_name ILIKE $${paramCounter} OR 
                i.description ILIKE $${paramCounter}
            )`;
            countParams.push(`%${search}%`);
            paramCounter++;
        }
        
        // Add the same date filters to count query
        if (dateFrom) {
            countQuery += ` AND i.date_found >= $${paramCounter}`;
            countParams.push(dateFrom);
            paramCounter++;
        }
        
        if (dateTo) {
            countQuery += ` AND i.date_found <= $${paramCounter}`;
            countParams.push(dateTo);
            paramCounter++;
        }
        
        const countResult = await pool.query(countQuery, countParams);
        const totalItems = parseInt(countResult.rows[0].count);
        const totalPages = Math.ceil(totalItems / limit);
        
        // For items with multiple images, fetch all images for each item
        const itemsWithFullData = await Promise.all(result.rows.map(async (item) => {
            if (item.image_count > 0) {
                const imagesQuery = `SELECT * FROM item_images WHERE item_id = $1 ORDER BY time_entered ASC`;
                const imagesResult = await pool.query(imagesQuery, [item.item_id]);
                return { ...item, images: imagesResult.rows };
            }
            return { ...item, images: [] };
        }));
        
        return res.status(200).json({
            success: true,
            pagination: {
                total: totalItems,
                totalPages,
                currentPage: page,
                itemsPerPage: limit,
                hasNextPage: page < totalPages,
                hasPreviousPage: page > 1
            },
            items: itemsWithFullData
        });
        
    } catch (err) {
        console.error("Error fetching items list:", err);
        return res.status(500).json({
            success: false,
            message: "Unable to fetch items",
            error: err.message
        });
    }
};

// single item


export const singleItem = async (req, res) => {
    try {
        const { id } = req.params;
        
        if (!id) {
            return res.status(400).json({
                success: false,
                message: 'Item ID is required'
            });
        }

        const itemDetails = await pool.query(
            `SELECT i.*, 
                    COALESCE(json_agg(img.image_url) FILTER (WHERE img.image_url IS NOT NULL), '[]') AS images
             FROM items i
             LEFT JOIN item_images img ON i.item_id = img.item_id
             WHERE i.item_id = $1
             GROUP BY i.item_id`,
            [id]
        );

        if (itemDetails.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: 'Item not found'
            });
        }

        return res.status(200).json({
            success: true,
            item: itemDetails.rows[0] // Contains item details & images array
        });

    } catch (err) {
        console.error("Error while fetching item details:", err);
        return res.status(500).json({
            success: false,
            message: 'Unable to perform the action at the moment',
            error: err.message
        });
    }
};


// export const  editItem  = async(req, res) =>{
//     try{
//         const {editData} = req.body;


        
//     }catch(err){
//         console.log("Error occured while editing item ",err)
//         return res.status(500).json({
//             success:false,
//             message:"Server Error, Please try again later",
//         })
//     }
// }



export const deleteItem = async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN'); // Start transaction

        const itemId = req.params.id;
        const { userID, role } = req.user; // From authenticateToken middleware

        // First check if item exists and get its details
        const checkItemQuery = `
            SELECT * FROM items 
            WHERE item_id = $1;
        `;
        const itemResult = await client.query(checkItemQuery, [itemId]);

        if (itemResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Item not found"
            });
        }

        const item = itemResult.rows[0];

        // Check if user has permission to delete
        // Allow if user is admin or if they created the item
        if (role !== 'admin' && item.found_by !== userID && item.lost_by !== userID) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to delete this item"
            });
        }

        // Get all image URLs before deleting
        const getImagesQuery = `
            SELECT image_url FROM item_images 
            WHERE item_id = $1;
        `;
        const imagesResult = await client.query(getImagesQuery, [itemId]);
        const imageUrls = imagesResult.rows.map(row => row.image_url);

        // Delete images from Cloudinary
        for (const url of imageUrls) {
            try {
                // Extract public_id from Cloudinary URL
                const publicId = url.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(publicId);
            } catch (error) {
                console.error("Error deleting image from Cloudinary:", error);
                // Continue with deletion even if Cloudinary delete fails
            }
        }

        // Delete associated records in order
        // 1. Delete image records
        await client.query(`
            DELETE FROM item_images 
            WHERE item_id = $1;
        `, [itemId]);

        // 2. Delete any associated requests
        await client.query(`
            DELETE FROM requests 
            WHERE item_id = $1;
        `, [itemId]);

        // 3. Finally delete the item
        await client.query(`
            DELETE FROM items 
            WHERE item_id = $1;
        `, [itemId]);

        await client.query('COMMIT');

        return res.status(200).json({
            success: true,
            message: "Item and associated data deleted successfully"
        });

    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error deleting item:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting the item"
        });
    } finally {
        client.release();
    }
};



export const getDashboard = async (req, res) => {
    try {
        const foundItemLatest = await pool.query(
            `SELECT i.*, 
                    COALESCE(json_agg(img.image_url) FILTER (WHERE img.image_url IS NOT NULL), '[]') AS images 
             FROM items i
             LEFT JOIN item_images img ON i.item_id = img.item_id
             WHERE i.status = 'found' 
             GROUP BY i.item_id
             ORDER BY i.time_entered 
             LIMIT 8`
        );

        const lostItemLatest = await pool.query(
            `SELECT i.*, 
                    COALESCE(json_agg(img.image_url) FILTER (WHERE img.image_url IS NOT NULL), '[]') AS images 
             FROM items i
             LEFT JOIN item_images img ON i.item_id = img.item_id
             WHERE i.status = 'lost' 
             GROUP BY i.item_id
             ORDER BY i.time_entered 
             LIMIT 8`
        );

        return res.status(200).json({
            foundItems: foundItemLatest.rows,
            lostItems: lostItemLatest.rows
        });

    } catch (error) {
        console.error("Error while retrieving dashboard details", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


