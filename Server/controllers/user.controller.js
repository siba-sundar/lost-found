import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto"
import {passwordValidator, emailValidator, userExist} from "../middlewares/validators.js";

// You should store this in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const TOKEN_EXPIRY = '24h';

const generateRandomUsername = () =>{
    return 'user_' + crypto.randomBytes(4).toString('hex');
}



// User Login Function
export const userLogin = async (req, res) => {
    try {
        const { email, password, oauthProvider, oauthId } = req.body;

        // Validate input
        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required"
            });
        }

        // Check if user exists
        const userResult = await pool.query(
            "SELECT * FROM users WHERE email_id = $1",
            [email]
        );

        if (userResult.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const user = userResult.rows[0];

        // Check login type
        const loginTypeResult = await pool.query(
            "SELECT login_type FROM auth_login WHERE user_id = $1",
            [user.user_id]
        );

        if (loginTypeResult.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: "Login type not found"
            });
        }

        const loginType = loginTypeResult.rows[0].login_type;

        if (loginType === 'email_password') {
            // Verify password if login type is email_password
            if (!password) {
                return res.status(400).json({
                    success: false,
                    message: "Password is required"
                });
            }

            const passwordResult = await pool.query(
                "SELECT password FROM email_password_auth WHERE user_id = $1",
                [user.user_id]
            );

            const hashedPassword = passwordResult.rows[0].password;
            const passwordMatch = await bcrypt.compare(password, hashedPassword);

            if (!passwordMatch) {
                return res.status(401).json({
                    success: false,
                    message: "Incorrect password"
                });
            }
        } else if (loginType === 'oauth') {
            // Verify OAuth login if login type is OAuth
            if (!oauthProvider || !oauthId) {
                return res.status(400).json({
                    success: false,
                    message: "OAuth provider and ID are required"
                });
            }

            const oauthResult = await pool.query(
                "SELECT oauth_id FROM oauth_auth WHERE user_id = $1 AND oauth_provider = $2",
                [user.user_id, oauthProvider]
            );

            if (oauthResult.rows.length === 0 || oauthResult.rows[0].oauth_id !== oauthId) {
                return res.status(401).json({
                    success: false,
                    message: "Invalid OAuth credentials"
                });
            }
        } else {
            return res.status(400).json({
                success: false,
                message: "Unsupported login type"
            });
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: user.user_id, 
                email: user.email_id 
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: {
                userId: user.user_id,
                email: user.email_id,
                name: user.name
            },
            token
        });

    } catch (err) {
        console.log("Error occurred during login: ", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login",
            error: err.message
        });
    }
};

// User Signup Function
export const userSignup = async (req, res) => {
    try {
        const { email, username, password, oauthProvider, oauthId } = req.body;

        if(!username){
            username = generateRandomUsername();
        }

        // Validate input
        if (!email || (!password && !oauthProvider)) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required details"
            });
        }

        const emailValidation = emailValidator(email);
        if (!emailValidation.isValid) {
            return res.status(401).json({
                success: false,
                message: emailValidation.message
            });
        }

        // Check if user exists
        const userExists = await pool.query("SELECT * FROM users WHERE email_id = $1", [email]);

        if (userExists.rows.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User already exists"
            });
        }

        // Insert new user
        const newUserResult = await pool.query(
            "INSERT INTO users (email_id, name) VALUES ($1, $2) RETURNING user_id, email_id, name",
            [email, username]
        );

        const newUser = newUserResult.rows[0];

        if (password) {
            // For email/password authentication, hash password and store it
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(password, saltRounds);

            await pool.query(
                "INSERT INTO email_password_auth (user_id, password) VALUES ($1, $2)",
                [newUser.user_id, hashedPassword]
            );

            await pool.query(
                "INSERT INTO auth_login (user_id, login_type) VALUES ($1, 'email_password')",
                [newUser.user_id]
            );
        } else if (oauthProvider && oauthId) {
            // For OAuth authentication, store provider and ID
            await pool.query(
                "INSERT INTO oauth_auth (user_id, oauth_provider, oauth_id) VALUES ($1, $2, $3)",
                [newUser.user_id, oauthProvider, oauthId]
            );

            await pool.query(
                "INSERT INTO auth_login (user_id, login_type) VALUES ($1, 'oauth')",
                [newUser.user_id]
            );
        }

        // Generate JWT token
        const token = jwt.sign(
            { 
                userId: newUser.user_id, 
                email: newUser.email_id 
            },
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            user: newUser,
            token
        });

    } catch (err) {
        console.log("Error occurred during signup: ", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred during signup",
            error: err.message
        });
    }
};

// Edit User Details Function
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
        console.log("Error occurred while updating user", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating user details",
            error: err.message
        });
    }
};

// Delete User Function
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
        console.log("Error occurred while deleting user", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred while deleting user",
            error: err.message
        });
    }
};
