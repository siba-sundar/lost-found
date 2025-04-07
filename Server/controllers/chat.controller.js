import pool from "../config/db.js";

export const createChatRoom = async (req, res) => {
  const { name, participants } = req.body;
  const userId = req.user.id; // Assuming you have authentication middleware
  
  try {
    // Start a transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      // Create the chat room
      const roomResult = await client.query(
        'INSERT INTO chat_rooms (name) VALUES ($1) RETURNING id, name, created_at',
        [name]
      );
      
      const roomId = roomResult.rows[0].id;
      
      // Add the creator to participants
      await client.query(
        'INSERT INTO chat_participants (room_id, user_id) VALUES ($1, $2)',
        [roomId, userId]
      );
      
      // Add other participants if provided
      if (participants && participants.length) {
        for (const participantId of participants) {
          if (participantId !== userId) {
            await client.query(
              'INSERT INTO chat_participants (room_id, user_id) VALUES ($1, $2)',
              [roomId, participantId]
            );
          }
        }
      }
      
      await client.query('COMMIT');
      
      // Get room with participants
      const participantsResult = await pool.query(
        `SELECT u.id, u.username, u.email 
         FROM chat_participants cp
         JOIN users u ON cp.user_id = u.id
         WHERE cp.room_id = $1`,
        [roomId]
      );
      
      const room = {
        ...roomResult.rows[0],
        participants: participantsResult.rows
      };
      
      res.status(201).json(room);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error("Error creating chat room:", error);
    res.status(500).json({ message: "Failed to create chat room" });
  }
};

export const getUserRooms = async (req, res) => {
  const userId = req.user.id; // From auth middleware
  
  try {
    const result = await pool.query(
      `SELECT cr.id, cr.name, cr.created_at,
         (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id) as message_count,
         (SELECT COUNT(*) FROM chat_messages WHERE room_id = cr.id AND is_read = false AND sender_id != $1) as unread_count
       FROM chat_rooms cr
       JOIN chat_participants cp ON cr.id = cp.room_id
       WHERE cp.user_id = $1
       ORDER BY cr.updated_at DESC`,
      [userId]
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching user rooms:", error);
    res.status(500).json({ message: "Failed to fetch chat rooms" });
  }
};

export const getRoomMessages = async (req, res) => {
  const { roomId } = req.params;
  const userId = req.user.id;
  
  try {
    // Check if user is a participant of this room
    const participantCheck = await pool.query(
      'SELECT 1 FROM chat_participants WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "Access denied to this chat room" });
    }
    
    // Get messages
    const messagesResult = await pool.query(
      `SELECT cm.id, cm.content, cm.created_at, cm.is_read,
         json_build_object('id', u.id, 'username', u.username) as sender
       FROM chat_messages cm
       JOIN users u ON cm.sender_id = u.id
       WHERE cm.room_id = $1
       ORDER BY cm.created_at ASC`,
      [roomId]
    );
    
    // Mark messages as read
    await pool.query(
      'UPDATE chat_messages SET is_read = true WHERE room_id = $1 AND sender_id != $2 AND is_read = false',
      [roomId, userId]
    );
    
    res.json(messagesResult.rows);
  } catch (error) {
    console.error("Error fetching room messages:", error);
    res.status(500).json({ message: "Failed to fetch messages" });
  }
};

export const sendMessage = async (req, res) => {
  const { roomId, content } = req.body;
  const userId = req.user.id;
  
  try {
    // Check if user is a participant
    const participantCheck = await pool.query(
      'SELECT 1 FROM chat_participants WHERE room_id = $1 AND user_id = $2',
      [roomId, userId]
    );
    
    if (participantCheck.rows.length === 0) {
      return res.status(403).json({ message: "Cannot send message to this room" });
    }
    
    // Insert the message
    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [roomId, userId, content]
    );
    
    // Update the room's updated_at timestamp
    await pool.query(
      'UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [roomId]
    );
    
    // Get sender info
    const userResult = await pool.query(
      'SELECT id, username FROM users WHERE id = $1',
      [userId]
    );
    
    const message = {
      ...result.rows[0],
      sender: userResult.rows[0],
      is_read: false
    };
    
    // Emit the message through Socket.io
    const io = req.app.get('io');
    io.to(roomId).emit('receive_message', message);
    
    res.status(201).json(message);
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// Function to save messages coming from socket.io
export const saveChatMessage = async (messageData) => {
  const { roomId, senderId, content } = messageData;
  
  try {
    // Insert the message
    const result = await pool.query(
      `INSERT INTO chat_messages (room_id, sender_id, content)
       VALUES ($1, $2, $3)
       RETURNING id, content, created_at`,
      [roomId, senderId, content]
    );
    
    // Update the room's updated_at timestamp
    await pool.query(
      'UPDATE chat_rooms SET updated_at = CURRENT_TIMESTAMP WHERE id = $1',
      [roomId]
    );
    
    // Get sender info
    const userResult = await pool.query(
      'SELECT id, username FROM users WHERE id = $1',
      [senderId]
    );
    
    return {
      ...result.rows[0],
      sender: userResult.rows[0],
      is_read: false,
      roomId
    };
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
};