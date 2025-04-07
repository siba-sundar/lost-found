import express from "express";
import { createChatRoom, getUserRooms, getRoomMessages, sendMessage } from "../controllers/chat.controller.js";
import {authenticateToken} from "../middlewares/tokenAuth.js"; // Assuming you have auth middleware

const router = express.Router();

// Apply authentication middleware to all chat routes
router.use(authenticateToken);

// Routes
router.post("/rooms", createChatRoom);
router.get("/rooms", getUserRooms);
router.get("/rooms/:roomId/messages", getRoomMessages);
router.post("/messages", sendMessage);

export default router;