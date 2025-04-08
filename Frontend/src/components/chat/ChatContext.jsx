import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';

const ChatContext = createContext();

export const useChatContext = () => useContext(ChatContext);

export const ChatProvider = ({ children }) => {
  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io('/', {
      auth: {
        token
      }
    });

    setSocket(newSocket);

    // Clean up on unmount
    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    socket.on('receive_message', (message) => {
      if (currentRoom && message.roomId === currentRoom.id) {
        setMessages(prev => [...prev, message]);
      }
      
      // Update unread count in rooms list
      setRooms(prev => 
        prev.map(room => 
          room.id === message.roomId && message.sender.id !== localStorage.getItem('userId')
            ? { ...room, unread_count: (room.unread_count || 0) + 1, message_count: (room.message_count || 0) + 1 }
            : room
        )
      );
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    return () => {
      socket.off('connect');
      socket.off('receive_message');
      socket.off('disconnect');
    };
  }, [socket, currentRoom]);

  // Join room socket event
  useEffect(() => {
    if (!socket || !currentRoom) return;
    
    // Join the room socket channel
    socket.emit('join_room', currentRoom.id);
    
    // Mark messages as read
    if (currentRoom.unread_count > 0) {
      const updatedRooms = rooms.map(room => 
        room.id === currentRoom.id 
          ? { ...room, unread_count: 0 }
          : room
      );
      setRooms(updatedRooms);
    }
  }, [socket, currentRoom]);

  // Fetch user's chat rooms
  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/chat/rooms', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      setRooms(response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  // Join a chat room and fetch messages
  const joinRoom = async (room) => {
    if (currentRoom?.id === room.id) return;
    
    try {
      setLoading(true);
      setCurrentRoom(room);
      setMessages([]);
      
      const response = await axios.get(`/api/chat/rooms/${room.id}/messages`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      setMessages(response.data);
      
      // Update room's unread count to 0 after joining
      setRooms(prev => 
        prev.map(r => (r.id === room.id ? { ...r, unread_count: 0 } : r))
      );
    } catch (error) {
      console.error('Error joining room:', error);
    } finally {
      setLoading(false);
    }
  };

  // Send a message
  const sendMessage = async (content) => {
    if (!currentRoom) return;
    
    try {
      const response = await axios.post('/api/chat/messages', {
        roomId: currentRoom.id,
        content
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Update messages (socket will handle real-time updates)
      setMessages(prev => [...prev, response.data]);
      
      // Update room's message count
      setRooms(prev => 
        prev.map(room => 
          room.id === currentRoom.id 
            ? { ...room, message_count: (room.message_count || 0) + 1 }
            : room
        )
      );
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Create a new chat room
  const createChatRoom = async (name, participants) => {
    try {
      const response = await axios.post('/api/chat/rooms', {
        name,
        participants
      }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      // Add new room to the list
      setRooms(prev => [
        {
          ...response.data,
          message_count: 0,
          unread_count: 0
        },
        ...prev
      ]);
      
      return response.data;
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  };

  // Load initial data
  useEffect(() => {
    fetchRooms();
  }, []);

  const value = {
    rooms,
    chatRooms: rooms, // Add this alias to support the component using chatRooms
    loading,
    currentRoom,
    messages,
    joinRoom,
    sendMessage,
    createChatRoom,
    fetchRooms
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};