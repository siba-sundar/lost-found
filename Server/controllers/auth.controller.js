import pool from "../config/db.js";
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from "crypto";
import { passwordValidator, emailValidator, userExist } from "../middlewares/validators.js";

// IMPORTANT: Move this to environment variables (.env file)
// Don't use a fallback string in production code
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'your-refresh-secret-key';
const TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Longer-lived refresh token


const generateRandomUsername = () => {
    return 'user_' + crypto.randomBytes(4).toString('hex');
};

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

        // Check if JWT secrets are properly configured
        if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
            console.error("JWT secrets are not configured");
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        try {
            // Generate token payload
            const tokenPayload = {
                userId: user.user_id,
                email: user.email_id,
                collegeId: user.college_id,
                role: 'user'  // Consider adding roles for permission control
            };

            // Generate access token
            const accessToken = jwt.sign(
                tokenPayload,
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                tokenPayload,
                REFRESH_TOKEN_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY }
            );

            // Store refresh token in database
            await storeRefreshToken(user.user_id, refreshToken);

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
                sameSite: 'strict'
            });

            return res.status(200).json({
                success: true,
                message: "Login successful",
                user: {
                    userId: user.user_id,
                    email: user.email_id,
                    name: user.name,
                    collegeId: user.college_id
                },
                accessToken,
                refreshToken // Only include this if you want the client to store it
            });
        } catch (tokenError) {
            console.error("Error generating tokens:", tokenError);
            return res.status(500).json({
                success: false,
                message: "Failed to generate authentication tokens"
            });
        }

    } catch (err) {
        console.error("Error occurred during login: ", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login",
            error: err.message
        });
    }
};



export const userSignup = async (req, res) => {
    try {
        // Extract all user data from the request
        const {
            email_id,
            name,
            college_id,
            phone_number,
            password,
            oauthProvider,
            oauthId,
            imageUrl // This now comes from the uploadToCloudinary function
        } = req.body;

        // Generate random username if not provided
        let username = name;
        if (!username) {
            username = generateRandomUsername();
        }

        // Validate required input
        if (!email_id || !college_id) {
            return res.status(400).json({
                success: false,
                message: "Email and college ID are required"
            });
        }

        if (!password && !oauthProvider) {
            return res.status(400).json({
                success: false,
                message: "Either password or OAuth credentials are required"
            });
        }

        // Check if user exists
        const userExists = await pool.query(
            "SELECT * FROM users WHERE email_id = $1",
            [email_id]
        );

        if (userExists.rows.length > 0) {
            return res.status(409).json({
                success: false,
                message: "User already exists"
            });
        }

        // Insert new user with profile_picture from Cloudinary
        const newUserResult = await pool.query(
            `INSERT INTO users 
            (email_id, name, college_id, phone_number, profile_picture) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING user_id, email_id, name, college_id, phone_number, profile_picture`,
            [email_id, username, college_id, phone_number || null, imageUrl || null]
        );
        const newUser = newUserResult.rows[0];

        if (password) {
            // For email/password authentication
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
            // For OAuth authentication
            await pool.query(
                "INSERT INTO oauth_auth (user_id, oauth_provider, oauth_id) VALUES ($1, $2, $3)",
                [newUser.user_id, oauthProvider, oauthId]
            );

            await pool.query(
                "INSERT INTO auth_login (user_id, login_type) VALUES ($1, 'oauth')",
                [newUser.user_id]
            );
        }

        // Check if JWT secrets are properly configured
        if (!JWT_SECRET || !REFRESH_TOKEN_SECRET) {
            console.error("JWT secrets are not configured");
            return res.status(500).json({
                success: false,
                message: "Server configuration error"
            });
        }

        try {
            // Generate token payload
            const tokenPayload = {
                userId: newUser.user_id,
                email: newUser.email_id,
                collegeId: newUser.college_id,
                role: 'user'  // Consider adding roles for permission control
            };

            // Generate access token
            const accessToken = jwt.sign(
                tokenPayload,
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            // Generate refresh token
            const refreshToken = jwt.sign(
                tokenPayload,
                REFRESH_TOKEN_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY }
            );

            // Store refresh token in database
            await storeRefreshToken(newUser.user_id, refreshToken);

            // Set refresh token as HTTP-only cookie
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
                maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
                sameSite: 'strict'
            });

            return res.status(201).json({
                success: true,
                message: "User created successfully",
                user: {
                    userId: newUser.user_id,
                    email: newUser.email_id,
                    name: newUser.name,
                    collegeId: newUser.college_id,
                    phoneNumber: newUser.phone_number,
                    profilePicture: newUser.profile_picture
                },
                accessToken,
                refreshToken // Only include this if you want the client to store it
            });
        } catch (tokenError) {
            console.error("Error generating tokens:", tokenError);
            return res.status(500).json({
                success: false,
                message: "User created but failed to generate authentication tokens"
            });
        }

    } catch (err) {
        console.error("Error occurred during signup: ", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred during signup",
            error: err.message
        });
    }
};

// Refresh token endpoint
export const refreshToken = async (req, res) => {
    try {
        const refreshToken = (req.cookies && req.cookies.refreshToken) || 
                             (req.body && req.body.refreshToken);

        if (!refreshToken) {
            return res.status(401).json({
                success: false,
                message: "Refresh token is required"
            });
        }

        // Verify refresh token validity in database
        const tokenExists = await isRefreshTokenValid(refreshToken);
        if (!tokenExists) {
            return res.status(403).json({
                success: false,
                message: "Invalid or expired refresh token"
            });
        }

        // Verify the token
        jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, async (err, decoded) => {
            if (err) {
                // Remove invalid token from database
                await removeRefreshToken(refreshToken);

                return res.status(403).json({
                    success: false,
                    message: "Invalid refresh token",
                    error: err.message
                });
            }

            // Generate a new access token
            const tokenPayload = {
                userId: decoded.userId,
                email: decoded.email,
                collegeId: decoded.collegeId,
                role: decoded.role
            };

            const newAccessToken = jwt.sign(
                tokenPayload,
                JWT_SECRET,
                { expiresIn: TOKEN_EXPIRY }
            );

            // Generate a new refresh token (token rotation for better security)
            const newRefreshToken = jwt.sign(
                tokenPayload,
                REFRESH_TOKEN_SECRET,
                { expiresIn: REFRESH_TOKEN_EXPIRY }
            );

            // Update refresh token in database
            await updateRefreshToken(decoded.userId, refreshToken, newRefreshToken);

            // Set new refresh token as HTTP-only cookie
            res.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                sameSite: 'strict'
            });

            return res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                accessToken: newAccessToken,
                refreshToken: newRefreshToken // Only include this if you want the client to store it
            });
        });
    } catch (err) {
        console.error("Error refreshing token:", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred while refreshing token",
            error: err.message
        });
    }
};

// Logout function
// Logout function
export const logout = async (req, res) => {
    try {
        const refreshToken = req.body.refreshToken;

        if (refreshToken) {
            // Remove refresh token from database
            await removeRefreshToken(refreshToken);
        }

        // Clear the refresh token cookie
        res.clearCookie('refreshToken');

        return res.status(200).json({
            success: true,
            message: "Logged out successfully"
        });
    } catch (err) {
        console.error("Error during logout:", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred during logout",
            error: err.message
        });
    }
};

// Store a refresh token in the database
async function storeRefreshToken(userId, token) {
    try {
        // First check if we need to create the refresh_tokens table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id SERIAL PRIMARY KEY,
                user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
                token TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL,
                is_revoked BOOLEAN DEFAULT FALSE
            )
        `);

        // Calculate expiry date (7 days from now)
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 7);

        // Insert the token
        await pool.query(
            `INSERT INTO refresh_tokens (user_id, token, expires_at)
             VALUES ($1, $2, $3)`,
            [userId, token, expiryDate]
        );

        return true;
    } catch (error) {
        console.error("Error storing refresh token:", error);
        return false;
    }
}

// Check if a refresh token is valid
async function isRefreshTokenValid(token) {
    try {
        const result = await pool.query(
            `SELECT * FROM refresh_tokens 
             WHERE token = $1 AND is_revoked = FALSE AND expires_at > NOW()`,
            [token]
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error("Error verifying refresh token:", error);
        return false;
    }
}

// Remove a refresh token (used during logout)
async function removeRefreshToken(token) {
    try {
        await pool.query(
            `UPDATE refresh_tokens 
             SET is_revoked = TRUE 
             WHERE token = $1`,
            [token]
        );

        return true;
    } catch (error) {
        console.error("Error removing refresh token:", error);
        return false;
    }
}

// Update a refresh token (token rotation for better security)
async function updateRefreshToken(userId, oldToken, newToken) {
    try {
        // Mark old token as revoked
        await pool.query(
            `UPDATE refresh_tokens 
             SET is_revoked = TRUE 
             WHERE token = $1`,
            [oldToken]
        );

        // Store new token
        await storeRefreshToken(userId, newToken);

        return true;
    } catch (error) {
        console.error("Error updating refresh token:", error);
        return false;
    }
}

