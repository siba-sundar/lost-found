import express from "express";
import cors from "cors";
import pg from "pg";
import fs from "fs";
import path from "path";
import env from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./config/db.js";
import { createTables } from "./config/startup.js";

import userRoutes from "./routes/auth.routes.js"
import errorHandling from "./middlewares/errorHandler.js";
import itemRoutes from "./routes/items.routes.js";
import itemRequestRoutes from "./routes/request.routes.js";
import chatRoutes from "./routes/chat.routes.js";

const app = express();
env.config();

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(express.json());
app.use(
    cors({
        origin: "http://localhost:5173", 
        credentials: true, 
    })
);

const port = process.env.PORT;

// Make io accessible to routes
app.set('io', io);

app.use(errorHandling);
// createTables();

app.use("/api/auth", userRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/request", itemRequestRoutes);
app.use("/api/chat", chatRoutes);

// Test PostgreSQL connection
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT current_database()");
        res.send(`The database name is: ${result.rows[0].current_database}`);
    } catch (err) {
        console.error("Error fetching database:", err);
        res.status(500).send("An error occurred.");
    }
});

// Socket.io connection handler
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join a chat room
  socket.on("join_room", (roomId) => {
    socket.join(roomId);
    console.log(`User ${socket.id} joined room: ${roomId}`);
  });
  
  // Listen for new messages
  socket.on("send_message", async (messageData) => {
    try {
      // Save message to database (will be handled by controller)
      const savedMessage = await saveChatMessage(messageData);
      
      // Broadcast the message to the room
      io.to(messageData.roomId).emit("receive_message", savedMessage);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });
  
  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Helper function to save messages (you'll implement this in a controller)
async function saveChatMessage(messageData) {
  // This is a placeholder - actual implementation will be in the controller
  return messageData;
}

// Use httpServer instead of app.listen
httpServer.listen(port || 3000, () => {
    console.log(`Server running at port ${port}`);
});