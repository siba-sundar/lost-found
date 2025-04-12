import express from 'express';
import {
  createChatRequest,
  getChatRequests,
  handleChatRequest,
  getUserChats,
  getChatMessages,
  saveMessage,
  closeChat,
  checkChatRequest
} from '../controllers/chat.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Chat request routes
router.post('/request', createChatRequest);
router.get('/requests/:userId', getChatRequests);
router.post('/request/handle', handleChatRequest);
router.get('/request/check/:itemId/:userId', checkChatRequest);

// Chat management routes
router.get('/user/:userId', getUserChats);
router.get('/messages/:chatId', getChatMessages);
router.post('/message', saveMessage);
router.post('/close', closeChat);

export default router;