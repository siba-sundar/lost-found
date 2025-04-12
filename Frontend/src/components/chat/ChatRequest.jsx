import React from 'react';
import { useChat } from '../utils/ChatContext';
import { useNavigate } from 'react-router-dom';

const ChatRequestsList = () => {
  const { chatRequests, handleChatRequest, loading, error } = useChat();
  const navigate = useNavigate();

  // Format date for display
  const formatDate = (timestamp) => {
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

  // Handle accepting or declining a chat request
  const handleRequest = async (requestId, action) => {
    const result = await handleChatRequest(requestId, action);
    
    // If accepted and successful, navigate to the new chat
    if (action === 'accepted' && result.success) {
      navigate(`/user/chat/${result.data.chatId}`);
    }
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

  if (chatRequests.length === 0) {
    return (
      <div className="bg-gray-800 rounded-lg p-6 text-center">
        <p className="text-gray-400">No chat requests</p>
        <p className="text-gray-500 text-sm mt-2">When someone wants to discuss an item with you, their request will appear here</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {chatRequests.map((request) => (
        <div key={request.request_id} className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-start">
            {/* User avatar */}
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
              {request.requester_picture ? (
                <img 
                  src={request.requester_picture} 
                  alt={request.requester_name} 
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-white text-lg font-medium">
                  {request.requester_name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            
            {/* Request details */}
            <div className="ml-4 flex-grow">
              <div className="flex justify-between items-center">
                <h3 className="font-medium text-white">{request.requester_name}</h3>
                <span className="text-xs text-gray-400">{formatDate(request.created_at)}</span>
              </div>
              
              <p className="text-sm text-gray-400 mt-1">Interested in: <span className="text-white">{request.item_name}</span></p>
              <p className="text-sm text-gray-300 mt-2 bg-gray-700 p-3 rounded-lg">{request.request_message}</p>
              
              {/* Action buttons for pending requests */}
              {request.status === 'pending' && (
                <div className="flex mt-3 space-x-3">
                  <button
                    onClick={() => handleRequest(request.request_id, 'accepted')}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition duration-300"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleRequest(request.request_id, 'declined')}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-300"
                  >
                    Decline
                  </button>
                </div>
              )}
              
              {/* Status badge for non-pending requests */}
              {request.status !== 'pending' && (
                <div className={`mt-3 inline-block px-3 py-1 rounded-full text-xs font-medium ${
                  request.status === 'accepted' ? 'bg-green-500 bg-opacity-20 text-green-400' : 'bg-red-500 bg-opacity-20 text-red-400'
                }`}>
                  {request.status === 'accepted' ? 'Accepted' : 'Declined'}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ChatRequestsList;