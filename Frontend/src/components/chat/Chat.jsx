import React, { useState, useEffect } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useChat } from '../utils/ChatContext';
import ChatList from './ChatList';
import ChatDetails from './ChatDetails';
import ChatRequestsList from './ChatRequest';

const Chat = () => {
  const [activeTab, setActiveTab] = useState('chats');
  const { currentUser } = useAuth();
  const { chatRequests, fetchChatRequests, unreadCount } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Determine active tab based on URL
    if (location.pathname === '/user/chat/requests') {
      setActiveTab('requests');
    } else {
      setActiveTab('chats');
    }

    // Fetch chat requests when component mounts
    if (currentUser) {
      fetchChatRequests();
    }
  }, [location.pathname, currentUser]);

  // Handle tab switching
  const switchTab = (tab) => {
    setActiveTab(tab);
    if (tab === 'chats') {
      navigate('/user/chat');
    } else if (tab === 'requests') {
      navigate('/user/chat/requests');
    }
  };

  if (!currentUser) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-red-500 bg-opacity-10 border border-red-500 text-red-500 p-4 rounded-lg">
          <p>You must be logged in to view chats.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 min-h-screen">
      <div className="bg-black rounded-lg overflow-hidden shadow-lg">
        {/* Tab navigation */}
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => switchTab('chats')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'chats' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Conversations
            {unreadCount > 0 && (
              <span className="ml-2 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => switchTab('requests')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'requests' 
                ? 'border-b-2 border-blue-500 text-blue-500' 
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Requests
            {chatRequests.filter(req => req.status === 'pending').length > 0 && (
              <span className="ml-2 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {chatRequests.filter(req => req.status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {/* Content area */}
        <div className="p-4">
          <Routes>
            <Route index element={<ChatList />} />
            <Route path=":chatId" element={<ChatDetails />} />
            <Route path="requests" element={<ChatRequestsList />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Chat;