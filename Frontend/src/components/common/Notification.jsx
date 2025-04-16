import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, ArrowLeft, Check, X, MessageCircle, Package } from 'lucide-react';
import { useAuth } from '../utils/AuthContext.jsx';
import axios from 'axios';
import LoadingSpinner from '../utils/spinner.jsx'; // Assuming you have this component

const Notifications = () => {
  const [loading, setLoading] = useState(true);
  const [chatRequests, setChatRequests] = useState([]);
  const [systemNotifications, setSystemNotifications] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const { currentUser, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const baseURL = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    // Redirect if not authenticated
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/notifications' } });
      return;
    }

    fetchNotifications();
  }, [isAuthenticated, currentUser, navigate, baseURL]);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Fetch chat requests
      const requestsResponse = await axios.get(`${baseURL}/api/chat/requests/${currentUser.user_id}`);
      
      // Fetch system notifications (assumes you have this endpoint)
      const systemResponse = await axios.get(`${baseURL}/api/notifications/${currentUser.user_id}`);
      
      setChatRequests(requestsResponse.data);
      setSystemNotifications(systemResponse.data || []); // Use empty array if no data
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Set empty arrays if there's an error
      setChatRequests([]);
      setSystemNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptChat = async (requestId) => {
    try {
      await axios.post(`${baseURL}/api/chat/accept/${requestId}`);
      // Refresh the list after accepting
      fetchNotifications();
      // Optionally redirect to chat
      navigate('/user/chat');
    } catch (error) {
      console.error('Error accepting chat request:', error);
    }
  };

  const handleRejectChat = async (requestId) => {
    try {
      await axios.post(`${baseURL}/api/chat/reject/${requestId}`);
      // Refresh the list after rejecting
      fetchNotifications();
    } catch (error) {
      console.error('Error rejecting chat request:', error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await axios.put(`${baseURL}/api/notifications/${notificationId}/read`);
      // Update the list to reflect the change
      setSystemNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await axios.put(`${baseURL}/api/notifications/mark-all-read/${currentUser.user_id}`);
      // Update all notifications as read
      setSystemNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getFilteredNotifications = () => {
    if (activeTab === 'all') {
      return [...chatRequests, ...systemNotifications].sort((a, b) => 
        new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp)
      );
    } else if (activeTab === 'messages') {
      return chatRequests;
    } else {
      return systemNotifications;
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const notificationDate = new Date(timestamp);
    const diffInSeconds = Math.floor((now - notificationDate) / 1000);
    
    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    
    return notificationDate.toLocaleDateString();
  };

  const filteredNotifications = getFilteredNotifications();
  const unreadCount = systemNotifications.filter(n => !n.read).length + chatRequests.length;

  return (
    <div className="bg-black min-h-screen text-white">
      {/* Header */}
      <div className="border-b border-gray-800 py-4 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => navigate(-1)} 
                className="p-2 rounded-full hover:bg-gray-800"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="text-xl font-bold flex items-center">
                <Bell size={20} className="mr-2" /> Notifications
                {unreadCount > 0 && (
                  <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                    {unreadCount}
                  </span>
                )}
              </h1>
            </div>
            
            {filteredNotifications.length > 0 && (
              <button 
                onClick={handleMarkAllAsRead}
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Mark all as read
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex space-x-4">
            <button 
              onClick={() => setActiveTab('all')}
              className={`py-3 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'all' 
                  ? 'border-b-2 border-blue-500 text-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button 
              onClick={() => setActiveTab('messages')}
              className={`py-3 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'messages' 
                  ? 'border-b-2 border-blue-500 text-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Messages
              {chatRequests.length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {chatRequests.length}
                </span>
              )}
            </button>
            <button 
              onClick={() => setActiveTab('system')}
              className={`py-3 px-4 font-medium text-sm focus:outline-none ${
                activeTab === 'system' 
                  ? 'border-b-2 border-blue-500 text-blue-400' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              System
              {systemNotifications.filter(n => !n.read).length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {systemNotifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="container mx-auto px-4 md:px-6 py-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <LoadingSpinner />
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-10">
            <Bell size={40} className="mx-auto text-gray-600 mb-4" />
            <p className="text-gray-500">No notifications to display</p>
          </div>
        ) : (
          <div className="space-y-1">
            {filteredNotifications.map((notification) => {
              // Check if it's a chat request
              if (notification.request_id) {
                return (
                  <div 
                    key={notification.request_id} 
                    className="flex items-start p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex-shrink-0 mr-4">
                      {notification.requester_picture ? (
                        <img 
                          src={notification.requester_picture} 
                          alt="" 
                          className="h-10 w-10 rounded-full"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                          <MessageCircle size={18} className="text-gray-300" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {notification.requester_name}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.created_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mt-1">
                        Wants to talk about <span className="font-medium">{notification.item_name}</span>
                      </p>
                      
                      <div className="flex space-x-2 mt-3">
                        <button 
                          onClick={() => handleAcceptChat(notification.request_id)}
                          className="flex items-center px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm"
                        >
                          <Check size={16} className="mr-1" /> Accept
                        </button>
                        <button 
                          onClick={() => handleRejectChat(notification.request_id)}
                          className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm"
                        >
                          <X size={16} className="mr-1" /> Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              } else {
                // System notification
                return (
                  <div 
                    key={notification.id}
                    className={`flex items-start p-4 rounded-lg hover:bg-gray-800 transition-colors ${
                      notification.read ? 'bg-gray-900' : 'bg-gray-800'
                    }`}
                    onClick={() => !notification.read && handleMarkAsRead(notification.id)}
                  >
                    <div className="flex-shrink-0 mr-4">
                      <div className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                        {notification.type === 'item_found' ? (
                          <Package size={18} className="text-green-400" />
                        ) : notification.type === 'item_claimed' ? (
                          <Package size={18} className="text-blue-400" />
                        ) : (
                          <Bell size={18} className="text-gray-300" />
                        )}
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          {notification.title || 'System Notification'}
                        </p>
                        <span className="text-xs text-gray-400">
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-300 mt-1">
                        {notification.message}
                      </p>
                      
                      {notification.action_url && (
                        <Link 
                          to={notification.action_url}
                          className="inline-block mt-2 text-sm text-blue-400 hover:text-blue-300"
                        >
                          View details
                        </Link>
                      )}
                      
                      {!notification.read && (
                        <div className="mt-2 flex justify-end">
                          <span className="inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;