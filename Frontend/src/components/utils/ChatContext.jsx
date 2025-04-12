import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';
import io from 'socket.io-client';

// Create context
export const ChatContext = createContext(null);

// Custom hook to use chat context
export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Provider component
export const ChatProvider = ({ children }) => {
  const [chats, setChats] = useState([]);
  const [chatRequests, setChatRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  
  const { currentUser } = useAuth();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Initialize socket connection
  useEffect(() => {
    if (!currentUser) return;
    
    const newSocket = io(baseUrl);
    
    // Authenticate with user ID
    newSocket.emit('authenticate', currentUser.user_id);
    
    setSocket(newSocket);
    
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, baseUrl]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !currentUser) return;
    
    // Listen for new messages
    socket.on('receive_message', (data) => {
      // Update chats with new message
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.chat_id === data.chat_id) {
            return {
              ...chat,
              last_message: data.message,
              last_message_time: data.created_at || new Date().toISOString(),
              unread_count: chat.unread_count + 1
            };
          }
          return chat;
        });
      });
      
      // Update total unread count
      setUnreadCount(prev => prev + 1);
    });
    
    // Listen for chat request updates
    socket.on('chat_request_update', (data) => {
      if (data.type === 'new') {
        setChatRequests(prev => [data.request, ...prev]);
      } else if (data.type === 'status_change') {
        setChatRequests(prev => 
          prev.map(req => 
            req.request_id === data.request_id 
              ? { ...req, status: data.status }
              : req
          )
        );
        
        // If accepted, fetch chats again to get the new chat
        if (data.status === 'accepted') {
          fetchChats();
        }
      }
    });
    
    return () => {
      socket.off('receive_message');
      socket.off('chat_request_update');
    };
  }, [socket, currentUser]);

  // Fetch user's chats
  const fetchChats = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.get(`${baseUrl}/api/chat/user/${currentUser.user_id}`);
      setChats(response.data);
      
      // Calculate total unread messages
      const totalUnread = response.data.reduce((sum, chat) => sum + (chat.unread_count || 0), 0);
      setUnreadCount(totalUnread);
      
      setLoading(false);
      return response.data;
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats');
      setLoading(false);
      return [];
    }
  };

  // Fetch chat requests
  const fetchChatRequests = async () => {
    if (!currentUser) return;
    
    try {
      const response = await axios.get(`${baseUrl}/api/chat/requests/${currentUser.user_id}`);
      setChatRequests(response.data);
      return response.data;
    } catch (err) {
      console.error('Error fetching chat requests:', err);
      return [];
    }
  };

  // Send a chat request
  const sendChatRequest = async (itemId, responderId, message) => {
    if (!currentUser) throw new Error('User not authenticated');
    
    try {
      const response = await axios.post(`${baseUrl}/api/chat/request`, {
        itemId,
        requesterId: currentUser.user_id,
        responderId,
        requestMessage: message
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error sending chat request:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to send request' 
      };
    }
  };

  // Handle a chat request (accept/decline)
  const handleChatRequest = async (requestId, action) => {
    try {
      const response = await axios.post(`${baseUrl}/api/chat/request/handle`, {
        requestId,
        action // 'accepted' or 'declined'
      });
      
      // Update local state
      setChatRequests(prev => 
        prev.map(req => 
          req.request_id === requestId 
            ? { ...req, status: action }
            : req
        )
      );
      
      // If accepted, fetch chats again to include the new one
      if (action === 'accepted') {
        await fetchChats();
      }
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error handling chat request:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to process request' 
      };
    }
  };

  // Check if there's an existing chat request for an item
  const checkChatRequest = async (itemId) => {
    if (!currentUser) return null;
    
    try {
      const response = await axios.get(`${baseUrl}/api/chat/request/check/${itemId}/${currentUser.user_id}`);
      return response.data.request || null;
    } catch (err) {
      console.error('Error checking chat request:', err);
      return null;
    }
  };

  // Mark messages as read
  const markMessagesAsRead = async (chatId) => {
    if (!currentUser || !chatId) return;
    
    try {
      await axios.post(`${baseUrl}/api/chat/read`, {
        chatId,
        userId: currentUser.user_id
      });
      
      // Update local state
      setChats(prevChats => {
        const updatedChats = prevChats.map(chat => {
          if (chat.chat_id === parseInt(chatId)) {
            // Calculate how many messages were marked as read
            const readCount = chat.unread_count || 0;
            
            // Update total unread count
            setUnreadCount(prev => Math.max(0, prev - readCount));
            
            return {
              ...chat,
              unread_count: 0
            };
          }
          return chat;
        });
        
        return updatedChats;
      });
      
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  // Send a message in a chat
  const sendMessage = async (chatId, message) => {
    if (!currentUser || !chatId) return { success: false };
    
    try {
      const response = await axios.post(`${baseUrl}/api/chat/message`, {
        chatId: parseInt(chatId),
        senderId: currentUser.user_id,
        message
      });
      
      // Update chat in local state with new message
      setChats(prevChats => {
        return prevChats.map(chat => {
          if (chat.chat_id === parseInt(chatId)) {
            return {
              ...chat,
              last_message: message,
              last_message_time: new Date().toISOString()
            };
          }
          return chat;
        });
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error sending message:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to send message' 
      };
    }
  };

  // Get messages for a specific chat
  const getChatMessages = async (chatId) => {
    if (!currentUser || !chatId) return { success: false };
    
    try {
      const response = await axios.get(`${baseUrl}/api/chat/messages/${chatId}`, {
        params: { userId: currentUser.user_id }
      });
      
      return { success: true, data: response.data };
    } catch (err) {
      console.error('Error fetching messages:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to load messages' 
      };
    }
  };

  // Close a chat
  const closeChat = async (chatId) => {
    if (!currentUser || !chatId) return { success: false };
    
    try {
      await axios.post(`${baseUrl}/api/chat/close`, {
        chatId: parseInt(chatId),
        userId: currentUser.user_id
      });
      
      // Remove chat from local state
      setChats(prevChats => prevChats.filter(chat => chat.chat_id !== parseInt(chatId)));
      
      return { success: true };
    } catch (err) {
      console.error('Error closing chat:', err);
      return { 
        success: false, 
        error: err.response?.data?.message || 'Failed to close chat' 
      };
    }
  };

  // Load initial data when context mounts or user changes
  useEffect(() => {
    if (currentUser) {
      fetchChats();
      fetchChatRequests();
    }
  }, [currentUser]);

  const value = {
    chats,
    chatRequests,
    loading,
    error,
    unreadCount,
    socket,
    fetchChats,
    fetchChatRequests,
    sendChatRequest,
    handleChatRequest,
    checkChatRequest,
    markMessagesAsRead,
    sendMessage,
    getChatMessages,
    closeChat
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};