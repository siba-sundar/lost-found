import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import io from 'socket.io-client';

const ChatDetails = () => {
  const { chatId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [chatInfo, setChatInfo] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  
  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Establish socket connection
  useEffect(() => {
    if (!currentUser) return;
    
    // Connect to socket server
    const newSocket = io(baseUrl);
    
    // Authenticate the socket with user ID
    newSocket.emit('authenticate', currentUser.user_id);
    
    setSocket(newSocket);
    
    // Clean up socket on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [currentUser, baseUrl]);

  // Set up socket listeners
  useEffect(() => {
    if (!socket || !chatId) return;
    
    // Listen for new messages
    socket.on('receive_message', (data) => {
      if (data.chat_id === parseInt(chatId)) {
        setMessages(prev => [...prev, data]);
      }
    });
    
    // Listen for typing indicators
    socket.on('user_typing', ({ userId }) => {
      if (userId !== currentUser.user_id) {
        setIsTyping(true);
        // Clear typing indicator after 2 seconds of no updates
        setTimeout(() => setIsTyping(false), 2000);
      }
    });
    
    return () => {
      socket.off('receive_message');
      socket.off('user_typing');
    };
  }, [socket, chatId, currentUser]);

  // Fetch messages for the current chat
  useEffect(() => {
    const fetchMessages = async () => {
      if (!chatId || !currentUser) return;
      
      try {
        setLoading(true);
        
        // Get chat messages
        const messagesResponse = await axios.get(
          `${baseUrl}/api/chat/messages/${chatId}`,
          { params: { userId: currentUser.user_id } }
        );
        
        setMessages(messagesResponse.data);
        
        // Get chat info from user chats
        const chatsResponse = await axios.get(`${baseUrl}/api/chat/user/${currentUser.user_id}`);
        const currentChat = chatsResponse.data.find(chat => chat.chat_id === parseInt(chatId));
        
        if (currentChat) {
          setChatInfo(currentChat);
        } else {
          // If chat not found in user's chats, they might not have access
          setError('Chat not found or you do not have access');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching chat data:', err);
        setError('Failed to load chat data');
        setLoading(false);
      }
    };
    
    fetchMessages();
  }, [chatId, currentUser, baseUrl]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle message sending
  const sendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || !chatId) return;
    
    try {
      const response = await axios.post(`${baseUrl}/api/chat/message`, {
        chatId: parseInt(chatId),
        senderId: currentUser.user_id,
        message: newMessage
      });
      
      // Add message to UI
      setMessages(prev => [...prev, response.data]);
      
      // Clear input
      setNewMessage('');
      
      // Send through socket
      if (socket && chatInfo) {
        socket.emit('send_message', {
          chatId: parseInt(chatId),
          senderId: currentUser.user_id,
          receiverId: chatInfo.other_user_id,
          message: newMessage
        });
      }
    } catch (err) {
      console.error('Error sending message:', err);
      // Show temporary error
      setError('Failed to send message');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Handle user typing
  const handleTyping = () => {
    if (socket && chatId) {
      socket.emit('typing', { 
        chatId: parseInt(chatId),
        userId: currentUser.user_id 
      });
    }
  };

  // Format the message time
  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Close chat
  const closeChat = async () => {
    try {
      await axios.post(`${baseUrl}/api/chat/close`, {
        chatId: parseInt(chatId),
        userId: currentUser.user_id
      });
      
      navigate('/user/chats');
    } catch (err) {
      console.error('Error closing chat:', err);
      setError('Failed to close chat');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg">
          <p>{error}</p>
          <button 
            onClick={() => navigate('/user/chat')}
            className="mt-4 bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to Chats
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <div className="bg-gray-900 rounded-lg overflow-hidden flex flex-col h-full">
        {/* Chat header */}
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700">
          <div className="flex items-center">
            {/* Back button for mobile */}
            <button
              onClick={() => navigate('/chats')}
              className="mr-3 text-gray-400 hover:text-white md:hidden"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            {/* User avatar */}
            <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {chatInfo?.other_user_picture ? (
                <img 
                  src={chatInfo.other_user_picture} 
                  alt={chatInfo.other_user_name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-lg font-medium">
                  {chatInfo?.other_user_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* User info */}
            <div className="ml-3">
              <h3 className="font-medium text-white">{chatInfo?.other_user_name}</h3>
              <p className="text-xs text-gray-400">
                {chatInfo?.item_name ? `About: ${chatInfo.item_name}` : 'Loading...'}
              </p>
            </div>
          </div>
          
          {/* Action buttons */}
          <div>
            <button
              onClick={closeChat}
              className="text-gray-400 hover:text-red-500"
              title="Close chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Messages area */}
        <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-900">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 my-8">
              <p>No messages yet.</p>
              <p className="text-sm">Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={msg.message_id || index}
                className={`flex ${msg.sender_id === currentUser?.user_id ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-2 ${
                    msg.sender_id === currentUser?.user_id 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-700 text-white'
                  }`}
                >
                  <p>{msg.message}</p>
                  <p className={`text-xs mt-1 ${
                    msg.sender_id === currentUser?.user_id ? 'text-blue-200' : 'text-gray-400'
                  }`}>
                    {formatMessageTime(msg.created_at)}
                  </p>
                </div>
              </div>
            ))
          )}
          
          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-700 text-white rounded-lg px-4 py-2 max-w-xs">
                <div className="flex space-x-1">
                  <div className="bg-gray-500 rounded-full h-2 w-2 animate-bounce"></div>
                  <div className="bg-gray-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  <div className="bg-gray-500 rounded-full h-2 w-2 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          {/* For auto-scrolling */}
          <div ref={messagesEndRef} />
        </div>
        
        {/* Message input */}
        <form onSubmit={sendMessage} className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="flex space-x-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleTyping}
              placeholder="Type a message..."
              className="flex-grow bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg px-4 py-2 font-medium transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatDetails;