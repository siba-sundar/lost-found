import express from "express"
import { editDetails, deleteUser, getUserDetails, updatePassword } from "../controllers/user.controller.js";
import { authenticateToken } from "../middlewares/tokenAuth.js";


const userRoute = express.Router();

userRoute.get('/profile', authenticateToken, getUserDetails)
userRoute.put('/edit', authenticateToken, editDetails);
userRoute.delete('/delete', authenticateToken, deleteUser);
userRoute.put('/change-password', authenticateToken, updatePassword);
export default userRoute;