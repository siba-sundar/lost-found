import pool from "../config/db.js";
import { extractUserFromToken } from "../middlewares/tokenAuth.js";  // Assuming you have this helper

export const addItem = async (req, res) => {
    try {
        const { itemName, description, location, dateFound, timeFound, type, token } = req.body;

        // Validate required fields
        if (!itemName || !description || !location || !dateFound || !timeFound) {
            return res.status(400).json({
                success: false,
                message: "All details are required"
            });
        }

        // Extract user details from the token
        const userDetails = extractUserFromToken(token, process.env.JWT_SECRET);  // Corrected environment variable reference

        if (!userDetails) {
            return res.status(401).json({
                success: false,
                message: "Invalid token or user not authenticated"
            });
        }

        // SQL query to insert a new item based on whether it's found or lost
        let query;
        let values;

        if (type === "found") {
            query = `
                INSERT INTO items (item_name, description, found_by, location, date_found, time_found, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING item_name;
            `;
            values = [itemName, description, userDetails.userID, location, dateFound, timeFound, 'found'];
        } else if (type === "lost") {
            query = `
                INSERT INTO items (item_name, description, lost_by, location, date_found, time_found, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING item_name;
            `;
            values = [itemName, description, userDetails.userID, location, dateFound, timeFound, 'lost'];
        } else {
            return res.status(400).json({
                success: false,
                message: "Invalid item type. Only 'found' or 'lost' are allowed"
            });
        }

        try {
            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return res.status(500).json({
                    success: false,
                    message: "Failed to insert item"
                });
            }

            return res.status(201).json({
                success: true,
                message: `${result.rows[0].item_name} added successfully`
            });
        } catch (err) {
            console.log("Error while inserting data", err);
            return res.status(500).json({
                success: false,
                message: "An error occurred while inserting data",
                error: err.message
            });
        }

    } catch (err) {
        console.log("Error while adding items", err);
        return res.status(500).json({
            success: false,
            message: "An error occurred while uploading, please try after some time."
        });
    }
};




export const  editItem  = async(req, res) =>{
    try{
        const {}
    }catch(err){
        console.log("Error occured while editing item ",err)
        return res.status(500).json({
            success:false,
            message:"Server Error, Please try again later",
        })
    }
}