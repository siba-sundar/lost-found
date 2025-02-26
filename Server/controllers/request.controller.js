import pool from "../config/db.js";
import multer from "multer"
import { uploadToCloudinary } from "../utils/cloudinary.js";
import fs from "fs";
import { extractUserFromToken } from '../middlewares/tokenAuth.js';

export const itemFound = async (req, res) => {
    const imagePath = req.body.imagePath;

    try {
        const {
            item_name,
            description,
            location,
            date_found,
            time_found,
            token
        } = req.body;

        // Validate required fields
        if (!item_name || !description || !location || !date_found || !time_found) {
            // Clean up uploaded file
            fs.unlinkSync(imagePath);
            return res.status(400).json({
                success: false,
                message: "All details are required"
            });
        }

        // Extract user details from token
        const userDetails = extractUserFromToken(token);
        if (!userDetails) {
            // Clean up uploaded file
            fs.unlinkSync(imagePath);
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not authenticated"
            });
        }



        // Begin transaction
        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // Insert item record
            const result = await client.query(`
                INSERT INTO item_found (
                    item_name, 
                    description, 
                    found_by,
                    location, 
                    date_found, 
                    time_found, 
                    file_path
                )
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING request_id, item_name;
            `, [
                item_name,
                description,
                userDetails.userId,
                location,
                date_found,
                time_found,
                imagePath
            ]);

            if (result.rows.length === 0) {
                throw new Error("Failed to insert item");
            }

            await client.query('COMMIT');

            return res.status(201).json({
                success: true,
                message: "Item reported as found successfully",
                data: {
                    item_id: result.rows[0].request_id,
                    item_name: result.rows[0].item_name
                }
            });

        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }

    } catch (err) {
        // Clean up uploaded file
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        console.error("Error in itemFound:", err);
        return res.status(500).json({
            success: false,
            message: "Error occurred while uploading item",
            error: err.message
        });
    }
};



export const acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        if (!requestId) {
            return res.status(400).json({
                success: false,
                message: "Request ID not found"
            });
        }

        // Begin transaction
        await pool.query('BEGIN');

        // Get the found item request details
        const foundItemResult = await pool.query(
            `SELECT * FROM item_found WHERE request_id = $1`,
            [requestId]
        );

        if (foundItemResult.rowCount === 0) {
            await pool.query('ROLLBACK');
            return res.status(404).json({
                success: false,
                message: "Item request not found"
            });
        }

        const foundItem = foundItemResult.rows[0];

        // Upload image first to make sure it succeeds before database operations
        let img_url = null;
        if (foundItem.file_path) {
            img_url = await uploadToCloudinary(foundItem.file_path);
            if (!img_url) {
                await pool.query('ROLLBACK');
                return res.status(500).json({
                    success: false,
                    message: "Failed to upload image"
                });
            }
        }

        // Insert into items table
        const addItemResult = await pool.query(
            `INSERT INTO items (
                item_name, 
                description, 
                found_by, 
                location, 
                date_found, 
                time_found, 
                status
            )
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING item_id, item_name`,
            [
                foundItem.item_name,
                foundItem.description,
                foundItem.found_by,
                foundItem.location,
                foundItem.date_found,
                foundItem.time_found,
                'found'
            ]
        );

        const newItem = addItemResult.rows[0];
        
        // Insert image if we have a URL
        if (img_url) {
            await pool.query(
                `INSERT INTO item_images (
                    item_id,
                    image_url
                )
                VALUES ($1, $2)`,
                [newItem.item_id, img_url]
            );
        }

        // Delete the original request
        await pool.query(
            `DELETE FROM item_found WHERE request_id = $1`,
            [requestId]
        );

        // Commit the transaction
        await pool.query('COMMIT');

        // Only delete the file after successful commit
        if (foundItem.file_path) {
            fs.unlinkSync(foundItem.file_path);
        }

        return res.status(200).json({
            success: true,
            message: "Request accepted successfully",
            item: {
                item_id: newItem.item_id,
                item_name: newItem.item_name
            }
        });

    } catch (err) {
        // Rollback in case of error
        await pool.query('ROLLBACK');

        console.error("Error while accepting request:", err);
        return res.status(500).json({
            success: false,
            message: "Unable to accept the request",
            error: err.message
        });
    }
};






export const rejectRequest = async (req, res) => {
    try {
        const { request_id } = req.params;
        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: "Item Id not found"
            })
        }

        await pool.query('BEGIN');
        const deleteStatus = await pool.query(`DELETE FROM item_found where request_id = $1 RETURNING file_path`, [request_id])

        const path = deleteStatus.rows[0];
        if (path.file_path) {
            fs.unlinkSync(path.file_path);
        }


        await pool.query('COMMIT')


        if (deleteStatus.rowCount > 0) {
            return res.status(200).json({
                success: true,
                message: "Request Rejected Successfully"
            })
        }

        else {
            return res.status(500).json({
                success: false,
                message: "No such item in db"
            })
        }

    } catch (err) {
        await pool.query('ROLLBACK');
        console.log("Error while rejecting Request", err)
        return res.status(500)

    }
}