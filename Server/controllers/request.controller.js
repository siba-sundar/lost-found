import pool from "../config/db";
import multer from "multer"
import { uploadToCloudinary } from "../utils/cloudinary";
import fs from "fs";

export const itemFound = async (req, res) => {
    try {
        const { item_name, description, found_by, location, date_found, time_found, imagePath } = req.body;


        if (!item_name || !description || !found_by || !location || !date_found || !time_found) {
            return res.statu(400).json({
                success: false,
                message: "All details are required"
            })
        }

        // Extract user details from token
        const userDetails = extractUserFromToken(found_by, process.env.JWT_SECRET);
        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not authenticated"
            });
        }

        const result = await pool.query(`
        INSERT INTO item_found (item_name, description, found_by, location, date_found, time_found, file_path)
         values($1, $2, $3, $3, $4, $5, $6, $7)
        RETURNING item_name
         `, [item_name, description, userDetails.userID, location, date_found, time_found, imagePath]);

        const uplaodResult = result.rows[0]

        if (uplaodResult === 0) {
            return res.status(400).json({
                success: false,
                message: "Failed to Send Request"
            })
        }
        else {
            return res.status(200).json({
                success: true,
                message: "Request Send Successfully"
            })
        }



    } catch (err) {
        console.log("Error while found request", err);
        return res.status(500).json({
            success: false,
            message: "Error occureed during uploading"
        })
    }

}


export const acceptRequest = async (req, res) => {

    try {
        const { request_id } = req.body;

        if (!request_id) {
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
            [request_id]
        );

        if (foundItemResult.rowCount === 0) {
            return res.status(404).json({
                success: false,
                message: "Item request not found"
            });
        }

        const foundItem = foundItemResult.rows[0];

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

        const img_url = uploadToCloudinary(foundItem.file_path)
        fs.unlinkSync(foundItem.file_path)

        // Insert image into images table if there's a file path
        if (foundItem.file_path) {
            await pool.query(
                `INSERT INTO images (
                    item_id,
                    image_path,
                    uploaded_at
                )
                VALUES ($1, $2, CURRENT_TIMESTAMP)`,
                [newItem.item_id, img_url]
            );
        }

        // Delete the original request
        await pool.query(
            `DELETE FROM item_found WHERE request_id = $1`,
            [request_id]
        );

        // Commit transaction
        await pool.query('COMMIT');

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
        const { request_id } = req.body;
        if (!request_id) {
            return res.status(400).json({
                success: false,
                message: "Item Id not found"
            })
        }

        const deleteStatus = await pool.query(`DELETE FROM found_request where request_id = $1`, [request_id])


        if (deleteStatus.rowCount > 0) {
            return res.status(200).json({
                success: true,
                message: "Request Rejected Successfully"
            })
        }

        else {
            return res.status(500).json({
                success: false,
                message: "Unable to delete request"
            })
        }

    } catch (err) {
        console.log("Error while rejecting Request", err)
        return res.status(500)

    }
}