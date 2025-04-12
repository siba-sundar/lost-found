import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './Logout';
import { Bell, Plus, User, Settings, LogOut, Package, MessageCircle } from 'lucide-react';
import { useAuth } from '../components/utils/AuthContext.jsx';
import InputForm from './common/InputForm.jsx';
import axios from 'axios';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [chatRequests, setChatRequests] = useState([]);
  const [isInputFormOpen, setIsInputFormOpen] = useState(false);
  const dropdownRef = useRef(null);
  const notificationRef = useRef(null);
  const { currentUser, isAuthenticated, logout } = useAuth();
  const baseURL = import.meta.env.VITE_BASE_URL;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch unread message count and chat requests
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;
    
    const fetchChatData = async () => {
      try {
        // Get active chats to count unread messages
        const chatsResponse = await axios.get(`${baseURL}/api/chat/user/${currentUser.user_id}`);
        const totalUnread = chatsResponse.data.reduce(
          (total, chat) => total + (chat.unread_count || 0), 
          0
        );
        
        // Get pending chat requests
        const requestsResponse = await axios.get(`${baseURL}/api/chat/requests/${currentUser.user_id}`);
        
        setUnreadCount(totalUnread + requestsResponse.data.length);
        setChatRequests(requestsResponse.data);
      } catch (error) {
        console.error('Error fetching chat data:', error);
      }
    };
    
    fetchChatData();
    
    // Poll for updates every 30 seconds
    const interval = setInterval(fetchChatData, 30000);
    return () => clearInterval(interval);
  }, [currentUser, isAuthenticated, baseURL]);

  // Handle opening the InputForm instead of navigation
  const handleAddButtonClick = (e) => {
    e.preventDefault();
    if (isAuthenticated) {
      setIsInputFormOpen(true);
    } else {
      // Redirect to login if not authenticated
      window.location.href = '/login';
    }
  };

  // Handle closing the InputForm
  const handleCloseInputForm = () => {
    setIsInputFormOpen(false);
  };

  return (
    <>
      <nav className="bg-black text-white shadow-md border-b border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Left - Brand Name */}
            <div className="flex-shrink-0">
              <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
                MySite
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white hover:text-gray-300 focus:outline-none"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Right side - Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-4">
              <Link to="/" className="text-white hover:text-gray-300 px-3 py-2">
                Home
              </Link>
              <Link to="/contact" className="text-white hover:text-gray-300 px-3 py-2">
                Contact
              </Link>
              
              {/* Icons - Always visible regardless of user status */}
              <div className="flex items-center space-x-2 ml-4">
                {/* Messages Icon */}
                <Link to={isAuthenticated ? "/chats" : "/login"} className="p-2 rounded-full hover:bg-gray-800 focus:outline-none relative">
                  <MessageCircle size={20} />
                  {isAuthenticated && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                
                {/* Notification Icon */}
                <div className="relative" ref={notificationRef}>
                  <button 
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                  >
                    <Bell size={20} />
                  </button>
                  
                  {/* Notification Dropdown */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-80 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                      <div className="px-4 py-2 border-b border-gray-800">
                        <h3 className="text-sm font-medium">Notifications</h3>
                      </div>
                      
                      {isAuthenticated ? (
                        <>
                          {/* Chat Request Notifications */}
                          {chatRequests.length > 0 ? (
                            <div>
                              {chatRequests.slice(0, 3).map(request => (
                                <Link 
                                  key={request.request_id}
                                  to="/chats" 
                                  className="flex items-start px-4 py-3 hover:bg-gray-800 border-b border-gray-800"
                                >
                                  <div className="flex-shrink-0">
                                    {request.requester_picture ? (
                                      <img 
                                        src={request.requester_picture} 
                                        alt="" 
                                        className="h-8 w-8 rounded-full"
                                      />
                                    ) : (
                                      <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
                                        <span className="text-white text-sm font-bold">
                                          {request.requester_name?.charAt(0).toUpperCase() || '?'}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-3 flex-1">
                                    <p className="text-sm text-white">
                                      <span className="font-medium">{request.requester_name}</span> wants to talk about <span className="font-medium">{request.item_name}</span>
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                      {new Date(request.created_at).toLocaleDateString()}
                                    </p>
                                  </div>
                                </Link>
                              ))}
                              {chatRequests.length > 3 && (
                                <Link to="/chats" className="block text-center text-sm text-blue-400 py-2 hover:bg-gray-800">
                                  View all requests
                                </Link>
                              )}
                            </div>
                          ) : (
                            <div className="px-4 py-6 text-center text-sm text-gray-500">
                              No new notifications
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="px-4 py-6 text-center text-sm text-gray-500">
                          <p>Please log in to view notifications</p>
                          <Link to="/login" className="mt-2 inline-block text-blue-400 hover:text-blue-300">
                            Login
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Add Items Icon */}
                <button
                  onClick={handleAddButtonClick}
                  className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                >
                  <Plus size={20} />
                </button>
                
                {/* User Profile Icon with Dropdown */}
                <div className="relative" ref={dropdownRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                  >
                    <User size={20} />
                  </button>
                  
                  {/* Profile Dropdown */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                      {isAuthenticated ? (
                        <>
                          <Link 
                            to="/settings" 
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <Settings size={16} className="mr-2 text-gray-400" />
                            Settings
                          </Link>
                          <Link 
                            to="/handle-items" 
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <Package size={16} className="mr-2 text-gray-400" />
                            Handle Items
                          </Link>
                          <Link 
                            to="/user/chat" 
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <MessageCircle size={16} className="mr-2 text-gray-400" />
                            Messages
                            {unreadCount > 0 && (
                              <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                                {unreadCount}
                              </span>
                            )}
                          </Link>
                          <button 
                            onClick={logout}
                            className="flex items-center w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <LogOut size={16} className="mr-2 text-gray-400" />
                            Logout
                          </button>
                        </>
                      ) : (
                        <>
                          <Link 
                            to="/login" 
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <LogOut size={16} className="mr-2 text-gray-400" />
                            Login
                          </Link>
                          <Link 
                            to="/register" 
                            className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                          >
                            <User size={16} className="mr-2 text-gray-400" />
                            Register
                          </Link>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-gray-900`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link to="/" className="block px-3 py-2 text-white hover:bg-gray-800 rounded">
              Home
            </Link>
            <Link to="/about" className="block px-3 py-2 text-white hover:bg-gray-800 rounded">
              About
            </Link>
            <Link to="/contact" className="block px-3 py-2 text-white hover:bg-gray-800 rounded">
              Contact
            </Link>
            
            {/* Mobile Icons - Always visible */}
            <div className="flex justify-between items-center px-3 py-2">
              <div className="flex space-x-4">
                {/* Messages Icon */}
                <Link to={isAuthenticated ? "/chats" : "/login"} className="text-white hover:text-gray-300 relative">
                  <MessageCircle size={20} />
                  {isAuthenticated && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Link>
                
                {/* Notification Icon */}
                <Link to={isAuthenticated ? "/notifications" : "/login"} className="text-white hover:text-gray-300">
                  <Bell size={20} />
                </Link>
                
                {/* Add Items Button */}
                <button
                  onClick={handleAddButtonClick}
                  className="text-white hover:text-gray-300"
                >
                  <Plus size={20} />
                </button>
              </div>
            </div>
            
            {/* Mobile User Options */}
            {isAuthenticated ? (
              <div className="space-y-1 mt-2">
                <Link to="/settings" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
                <Link to="/handle-items" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                  <Package size={16} className="mr-2" />
                  Handle Items
                </Link>
                <Link to="/chats" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                  <MessageCircle size={16} className="mr-2" />
                  Messages
                  {unreadCount > 0 && (
                    <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                      {unreadCount}
                    </span>
                  )}
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full text-left px-3 py-2 text-white hover:bg-gray-800 rounded"
                >
                  <LogOut size={16} className="mr-2" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="space-y-1 mt-2">
                <Link to="/login" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                  <LogOut size={16} className="mr-2" />
                  Login
                </Link>
                <Link to="/register" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                  <User size={16} className="mr-2" />
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* InputForm Modal */}
      {isInputFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg w-full max-w-lg p-6 relative">
            <button 
              onClick={handleCloseInputForm}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <h2 className="text-xl font-bold text-white mb-4">Add New Item</h2>
            <InputForm onClose={handleCloseInputForm} />
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;