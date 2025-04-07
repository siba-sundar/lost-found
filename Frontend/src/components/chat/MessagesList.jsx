// MessagesList.jsx

import React, { useEffect, useRef } from 'react';
import { format } from 'date-fns';

const MessagesList = ({ messages, loading }) => {
  const messagesEndRef = useRef(null);
  
  // Auto scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  if (loading && messages.length === 0) {
    return (
      <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {messages.length === 0 ? (
        <div className="h-full flex items-center justify-center text-gray-500">
          <p>No messages yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id} className="flex items-start gap-2">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center text-gray-700 font-bold">
                {message.sender.username.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{message.sender.username}</p>
                  <span className="text-xs text-gray-500">
                    {format(new Date(message.created_at), 'MMM d, h:mm a')}
                  </span>
                </div>
                <div className="mt-1 bg-white p-3 rounded-lg shadow-sm">
                  {message.content}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};


export default MessagesList;