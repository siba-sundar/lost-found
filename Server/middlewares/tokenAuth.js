import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// JWT middleware with refresh token mechanism
export const authenticateToken = async (req, res, next) => {
    try {
        // Get token from authorization header
        const authHeader = req.headers['authorization'];
        const accessToken = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
        
        if (!accessToken) {
            return res.status(401).json({
                success: false,
                message: "Access token is required"
            });
        }
        
        // Verify the token
        jwt.verify(accessToken, JWT_SECRET, (err, decoded) => {
            if (err) {
                // For token expired errors, client should use refresh token endpoint
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({
                        success: false,
                        message: "Token has expired",
                        expired: true // Flag to indicate client should try refresh token
                    });
                } else if (err.name === 'JsonWebTokenError') {
                    return res.status(403).json({
                        success: false,
                        message: "Invalid token"
                    });
                } else {
                    return res.status(403).json({
                        success: false,
                        message: "Token verification failed"
                    });
                }
            }
            
            // Set user data in request object
            req.user = decoded;
            next();
        });
    } catch (err) {
        console.error("Error in auth middleware:", err.stack);
        return res.status(500).json({
            success: false,
            message: "An error occurred during authentication",
            error: err.message
        });
    }
};




export const extractUserFromToken = (token) => {
    // Split the token into its three parts: header, payload, signature
    const parts = token.split('.');
    
    // Check if the token has the correct format
    if (parts.length !== 3) {
      throw new Error('Invalid token format');
    }
    
    try {
      // Decode the payload (second part of the token)
      // The payload is Base64Url encoded
      const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
      
      // Return the specific details
      return {
        userId: payload.userId,
        email: payload.email,
        collegeId: payload.collegeId,
        role: payload.role
      };
    } catch (error) {
      throw new Error('Failed to decode token payload: ' + error.message);
    }
};

// Helper to generate a new token (useful for implementation)
export const generateToken = (userData, expiresIn = '24h') => {
    try {
        return jwt.sign(
            userData,
            JWT_SECRET,
            { expiresIn }
        );
    } catch (error) {
        console.error("Error generating token:", error.message);
        return null;
    }
};


// Helper to generate tokens (useful for implementation)
export const generateTokens = (userData) => {
    try {
        const accessToken = jwt.sign(
            userData,
            JWT_SECRET,
            { expiresIn: TOKEN_EXPIRY }
        );
        
        const refreshToken = jwt.sign(
            userData,
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRY }
        );
        
        return { accessToken, refreshToken };
    } catch (error) {
        console.error("Error generating tokens:", error.message);
        return null;
    }
};

// Database functions for refresh token management
// These functions interact with a new refresh_tokens table that you need to create
