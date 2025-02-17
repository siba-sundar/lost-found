import express from 'express';
import { userLogin, userSignup, editDetails, deleteUser } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/auth.js';

const userRouter = express.Router();

// Public routes
router.post('/login', userLogin);
router.post('/signup', userSignup);

// Protected routes
router.put('/edit', authenticateToken, editDetails);
router.delete('/delete', authenticateToken, deleteUser);

export default userRouter;