import express from "express"
import { editDetails, deleteUser, getUserDetails } from "../controllers/user.controller";
import { authenticateToken } from "../middlewares/tokenAuth";


const userRoute = express.Routes();

userRoute.get('/profile', authenticateToken, getUserDetails)
userRoute.put('/edit', authenticateToken, editDetails);
userRoute.delete('/delete', authenticateToken, deleteUser);


export default userRoute;