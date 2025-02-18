import express from 'express';
import { userLogin, userSignup, editDetails, deleteUser } from '../controllers/user.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';

const userRouter = express.Router();  // Correct definition

// Public routes
userRouter.post('/login', userLogin);  // Changed 'router' to 'userRouter'
userRouter.post('/signup', userSignup);

// Protected routes
userRouter.put('/edit', authenticateToken, editDetails);
userRouter.delete('/delete', authenticateToken, deleteUser);

export default userRouter;
