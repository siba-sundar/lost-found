import express from 'express';
import { userLogin, userSignup, refreshToken, logout } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';

const authRoutes = express.Router();  // Correct definition

// Public routes
authRoutes.post('/login', userLogin);  // Changed 'router' to 'userRouter'
authRoutes.post('/signup', userSignup);

authRoutes.post('/refresh-token', refreshToken);
authRoutes.post('/logout', authenticateToken, logout);

// Protected routes


export default authRoutes;
