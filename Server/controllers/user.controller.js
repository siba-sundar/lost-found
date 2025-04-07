import pool from "../config/db";



export const getUserDetails = async (req, res)=>{
    try{
        const userId = req.user;

        const userDetails = await pool.query(
            "SELECT user_id, name, email_id FROM users WHER user_id = $1", 
            [userId]
        );

        if(userDetails.rows.length === 0){
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user: userDetails.rows[0]
        });    
    }catch(err){
        console.log('Error fetching user details', err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred while fetching user details",
            error: err.message
        });
    }
}

// Edit User Details Function - remains mostly the same
export const editDetails = async (req, res) => {
    try {
        const { userId } = req.user; // This will come from auth middleware
        const { username, email } = req.body;

        // Validate input
        if (!username && !email) {
            return res.status(400).json({
                success: false,
                message: "Nothing to update"
            });
        }

        let updateQuery = "UPDATE users SET";
        const values = [];
        let valueIndex = 1;

        if (username) {
            updateQuery += ` name = $${valueIndex}`;
            values.push(username);
            valueIndex++;
        }

        if (email) {
            if (valueIndex > 1) updateQuery += ",";
            updateQuery += ` email_id = $${valueIndex}`;
            values.push(email);
            valueIndex++;
        }

        updateQuery += ` WHERE user_id = $${valueIndex} RETURNING user_id, name, email_id`;
        values.push(userId);

        const result = await pool.query(updateQuery, values);

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details updated successfully",
            user: result.rows[0]
        });

    } catch (err) {
        console.error("Error occurred while updating user", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating user details",
            error: err.message
        });
    }
};

// Delete User Function - remains mostly the same
export const deleteUser = async (req, res) => {
    try {
        const { userId } = req.user; // This will come from auth middleware

        const result = await pool.query(
            "DELETE FROM users WHERE user_id = $1 RETURNING user_id",
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "User deleted successfully"
        });

    } catch (err) {
        console.error("Error occurred while deleting user", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting user",
            error: err.message
        });
    }
};