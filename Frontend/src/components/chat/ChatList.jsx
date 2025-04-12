import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';
import { Link } from 'react-router-dom';

const ChatList = () => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchChats = async () => {
      if (!currentUser) return;
      
      try {
        const response = await axios.get(`${baseUrl}/api/chat/user/${currentUser.user_id}`);
        setChats(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch chats');
        setLoading(false);
        console.error('Error fetching chats:', err);
      }
    };
    
    fetchChats();
    
    // Set up polling for new messages (you can replace this with socket.io)
    const interval = setInterval(fetchChats, 10000); // Poll every 10 seconds
    
    return () => clearInterval(interval);
  }, [currentUser]);

  // Format the time for display
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    
    // If today, show time only
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
    
    // Show full date for older messages
    return date.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg">
        <p>{error}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">No active chats</p>
        <p className="text-gray-500 text-sm mt-2">Start a conversation by contacting an item owner</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="p-4 bg-gray-800 border-b border-gray-700">
        <h2 className="text-xl font-semibold text-white">Your Conversations</h2>
      </div>
      
      <div className="divide-y divide-gray-700">
        {chats.map((chat) => (
          <Link 
            key={chat.chat_id} 
            to={`/chat/${chat.chat_id}`}
            className="flex items-center p-4 hover:bg-gray-800 transition-colors"
          >
            {/* Avatar */}
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {chat.other_user_picture ? (
                <img 
                  src={chat.other_user_picture} 
                  alt={chat.other_user_name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-lg font-medium">
                  {chat.other_user_name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Chat info */}
            <div className="ml-4 flex-grow overflow-hidden">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-white truncate">{chat.other_user_name}</h3>
                <span className="text-xs text-gray-400">{formatTime(chat.last_message_time)}</span>
              </div>
              
              <div className="flex justify-between items-center mt-1">
                <p className="text-sm text-gray-400 truncate">{chat.last_message || 'No messages yet'}</p>
                
                {/* Unread counter */}
                {chat.unread_count > 0 && (
                  <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2">
                    {chat.unread_count}
                  </span>
                )}
              </div>
              
              {/* Item name */}
              <p className="text-xs text-gray-500 mt-1 truncate">About: {chat.item_name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ChatList;