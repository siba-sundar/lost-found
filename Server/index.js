import express from "express";
import cors from "cors";
import pg from "pg";
import fs from "fs";
import path from "path";
import env from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import pool from "./config/db.js";
import http from "http";
import { createTables } from "./config/startup.js";
import morgan from 'morgan';
import authRoutes from "./routes/auth.routes.js"
import errorHandling from "./middlewares/errorHandler.js";
import itemRoutes from "./routes/items.routes.js";
import itemRequestRoutes from "./routes/request.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import userRoutes from "./routes/user.routes.js"
import cookieParser  from 'cookie-parser';
const app = express();
env.config();

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
    cors({
        origin: "*", 
        credentials: true, 
    })
);
app.use(morgan('dev'));

const port = process.env.PORT;

// Make io accessible to routes
app.set('io', io);

app.use(errorHandling);
// createTables();

app.use("/api/auth", authRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/request", itemRequestRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/user",userRoutes)

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


const onlineUsers = new Map();

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  
  // User authentication and storing online status
  socket.on('authenticate', (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log(`User ${userId} authenticated with socket ${socket.id}`);
  });

  // Handle chat messages
  socket.on('send_message', async (data) => {
    try {
      const { receiverId, senderId, message, chatId } = data;
      
      // Save message to database (implement in chatController)
      const savedMessage = await saveMessage(chatId, senderId, message);
      
      // Send to receiver if online
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', {
          ...savedMessage,
          sender: senderId
        });
      }
      
      // Confirm message delivery to sender
      socket.emit('message_delivered', {
        messageId: savedMessage.message_id,
        chatId
      });
    } catch (error) {
      console.error('Error handling message:', error);
      socket.emit('error', { message: 'Failed to deliver message' });
    }
  });

  // Handle typing indicators
  socket.on('typing', ({ chatId, userId }) => {
    // Notify the other user in the chat
    socket.to(chatId).emit('user_typing', { userId });
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    // Remove from online users
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
  });
});



// Helper function to save messages
async function saveMessage(chatId, senderId, message) {
  // This will be implemented in chatController.js
  // For now, this is a placeholder
  return { message_id: Date.now(), chat_id: chatId, sender_id: senderId, message, timestamp: new Date() };
}

// Use httpServer instead of app.listen
server.listen(port || 3000, () => {
    console.log(`Server running at port ${port}`);
});