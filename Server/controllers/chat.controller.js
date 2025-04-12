import pool from '../config/db.js';

// Create a chat request
export const createChatRequest = async (req, res) => {
  const { itemId, requesterId, responderId, requestMessage } = req.body;
  
  try {
    // Check if a request already exists
    const checkQuery = `
      SELECT * FROM chat_requests
      WHERE item_id = $1 AND requester_id = $2 AND responder_id = $3
    `;
    const checkResult = await pool.query(checkQuery, [itemId, requesterId, responderId]);
    
    if (checkResult.rowCount > 0) {
      return res.status(400).json({ message: 'Request already exists' });
    }
    
    // Create new request
    const insertQuery = `
      INSERT INTO chat_requests
      (item_id, requester_id, responder_id, request_message)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [itemId, requesterId, responderId, requestMessage]);
    
    res.status(201).json({
      message: 'Chat request sent successfully',
      request: result.rows[0]
    });
  } catch (error) {
    console.error('Error creating chat request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all chat requests for a user
export const getChatRequests = async (req, res) => {
  const userId = parseInt(req.params.userId);
  console.log('Fetching chat requests for user:', userId);
  
  try {
    const query = `
      SELECT cr.*, 
        i.item_name, i.description, i.location,
        u.name as requester_name, u.profile_picture as requester_picture
      FROM chat_requests cr
      JOIN items i ON cr.item_id = i.item_id
      JOIN users u ON cr.requester_id = u.user_id
      WHERE cr.responder_id = $1 AND cr.status = 'pending'
      ORDER BY cr.created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching chat requests:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Handle chat request (accept or decline)
export const handleChatRequest = async (req, res) => {
  const { requestId, action } = req.body;
  
  if (!['accepted', 'declined'].includes(action)) {
    return res.status(400).json({ message: 'Invalid action' });
  }
  
  try {
    // Start a transaction
    await pool.query('BEGIN');
    
    // Update request status
    const updateQuery = `
      UPDATE chat_requests
      SET status = $1
      WHERE request_id = $2
      RETURNING *
    `;
    const result = await pool.query(updateQuery, [action, requestId]);
    
    if (result.rowCount === 0) {
      await pool.query('ROLLBACK');
      return res.status(404).json({ message: 'Request not found' });
    }
    
    const request = result.rows[0];
    
    // If accepted, create a new chat
    if (action === 'accepted') {
      const chatQuery = `
        INSERT INTO chats
        (item_id, user_one, user_two, status)
        VALUES ($1, $2, $3, 'active')
        RETURNING *
      `;
      
      const chatResult = await pool.query(
        chatQuery, 
        [request.item_id, request.requester_id, request.responder_id]
      );
      
      await pool.query('COMMIT');
      return res.status(200).json({ 
        message: 'Chat request accepted',
        chat: chatResult.rows[0]
      });
    }
    
    await pool.query('COMMIT');
    res.status(200).json({ message: 'Chat request declined' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error handling chat request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get all active chats for a user
export const getUserChats = async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  try {
    const query = `
      SELECT c.*,
        i.item_name, i.description,
        CASE
          WHEN c.user_one = $1 THEN c.user_two
          ELSE c.user_one
        END as other_user_id,
        u.name as other_user_name,
        u.profile_picture as other_user_picture,
        (
          SELECT message FROM messages 
          WHERE chat_id = c.chat_id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_message,
        (
          SELECT created_at FROM messages 
          WHERE chat_id = c.chat_id 
          ORDER BY created_at DESC LIMIT 1
        ) as last_message_time,
        (
          SELECT COUNT(*) FROM messages 
          WHERE chat_id = c.chat_id AND read = false AND sender_id != $1
        ) as unread_count
      FROM chats c
      JOIN items i ON c.item_id = i.item_id
      JOIN users u ON (
        CASE
          WHEN c.user_one = $1 THEN c.user_two
          ELSE c.user_one
        END = u.user_id
      )
      WHERE (c.user_one = $1 OR c.user_two = $1)
      AND c.status = 'active'
      ORDER BY last_message_time DESC NULLS LAST
    `;
    
    const result = await pool.query(query, [userId]);
    res.status(200).json(result.rows);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update getChatMessages in chat.controller.js
export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  const userId = parseInt(req.query.userId);
  
  try {
    // First verify that the user is part of this chat
    const verifyQuery = `
      SELECT c.* FROM chats c
      WHERE c.chat_id = $1 AND (c.user_one = $2 OR c.user_two = $2) AND c.status = 'active'
    `;
    const verifyResult = await pool.query(verifyQuery, [chatId, userId]);
    
    if (verifyResult.rowCount === 0) {
      return res.status(403).json({ message: 'Access denied or chat is not active' });
    }
    
    // Get messages
    const messagesQuery = `
      SELECT m.*, u.name as sender_name, u.profile_picture as sender_picture
      FROM messages m
      JOIN users u ON m.sender_id = u.user_id
      WHERE m.chat_id = $1
      ORDER BY m.created_at ASC
    `;
    const messages = await pool.query(messagesQuery, [chatId]);
    
    // Mark messages as read
    const updateQuery = `
      UPDATE messages
      SET read = true
      WHERE chat_id = $1 AND sender_id != $2 AND read = false
    `;
    await pool.query(updateQuery, [chatId, userId]);
    
    res.status(200).json(messages.rows);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Save a message
export const saveMessage = async (req, res) => {
  const { chatId, senderId, message } = req.body;
  
  try {
    // Verify sender is part of the chat
    const verifyQuery = `
      SELECT * FROM chats WHERE chat_id = $1 AND (user_one = $2 OR user_two = $2) AND status = 'active'
    `;
    const verifyResult = await pool.query(verifyQuery, [chatId, senderId]);
    
    if (verifyResult.rowCount === 0) {
      return res.status(403).json({ message: 'Access denied or chat is not active' });
    }
    
    // Save message
    const insertQuery = `
      INSERT INTO messages (chat_id, sender_id, message)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(insertQuery, [chatId, senderId, message]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Close a chat
export const closeChat = async (req, res) => {
  const { chatId, userId } = req.body;
  
  try {
    // Verify user is part of the chat
    const verifyQuery = `
      SELECT * FROM chats WHERE chat_id = $1 AND (user_one = $2 OR user_two = $2)
    `;
    const verifyResult = await pool.query(verifyQuery, [chatId, userId]);
    
    if (verifyResult.rowCount === 0) {
      return res.status(403).json({ message: 'Access denied' });
    }
    
    // Close the chat
    const updateQuery = `
      UPDATE chats SET status = 'closed' WHERE chat_id = $1
    `;
    await pool.query(updateQuery, [chatId]);
    
    res.status(200).json({ message: 'Chat closed successfully' });
  } catch (error) {
    console.error('Error closing chat:', error);
    res.status(500).json({ message: 'Server error' });
  }
};


// Add this to your chat.controller.js
export const checkChatRequest = async (req, res) => {
  const { itemId, userId } = req.params;
  
  try {
    // Check for existing request
    const requestQuery = `
      SELECT cr.*, 
        CASE WHEN cr.status = 'accepted' THEN c.chat_id ELSE NULL END as chat_id
      FROM chat_requests cr
      LEFT JOIN chats c ON (
        c.item_id = cr.item_id AND 
        ((c.user_one = cr.requester_id AND c.user_two = cr.responder_id) OR
         (c.user_one = cr.responder_id AND c.user_two = cr.requester_id))
      )
      WHERE cr.item_id = $1 
      AND cr.requester_id = $2
      ORDER BY cr.created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(requestQuery, [itemId, userId]);
    
    if (result.rowCount > 0) {
      return res.status(200).json({ request: result.rows[0] });
    }
    
    res.status(200).json({ request: null });
  } catch (error) {
    console.error('Error checking chat request:', error);
    res.status(500).json({ message: 'Server error' });
  }
};