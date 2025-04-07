// ChatRoomsList.jsx
import React from 'react';
import { useChatContext } from '../context/ChatContext';

const ChatRoomsList = ({ rooms, loading }) => {
  const { joinRoom, currentRoom } = useChatContext();
  
  if (loading && rooms.length === 0) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-14 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }
  
  return (
    <div className="overflow-y-auto h-full">
      {rooms.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No chats yet</p>
        </div>
      ) : (
        <ul>
          {rooms.map((room) => (
            <li 
              key={room.id}
              onClick={() => joinRoom(room)}
              className={`p-3 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                currentRoom?.id === room.id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">{room.name}</h4>
                  <p className="text-sm text-gray-500">{room.message_count} messages</p>
                </div>
                {room.unread_count > 0 && (
                  <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                    {room.unread_count}
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

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

// ChatInput.jsx
import React, { useState } from 'react';
import { useChatContext } from '../context/ChatContext';

const ChatInput = () => {
  const [message, setMessage] = useState('');
  const { sendMessage } = useChatContext();
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim()) {
      sendMessage(message);
      setMessage('');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white border-t border-gray-300">
      <div className="flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
          type="submit"
          disabled={!message.trim()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-300"
        >
          Send
        </button>
      </div>
    </form>
  );
};

// NewRoomModal.jsx
import React, { useState, useEffect } from 'react';
import { useChatContext } from '../context/ChatContext';
import axios from 'axios';

const NewRoomModal = ({ onClose }) => {
  const [roomName, setRoomName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const { createChatRoom } = useChatContext();
  
  // Fetch users for selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/auth/users', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        setUsers(response.data);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUsers();
  }, []);
  
  const handleUserSelect = (userId) => {
    setSelectedUsers((prev) => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomName.trim()) return;
    
    try {
      await createChatRoom(roomName, selectedUsers);
      onClose();
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-xl font-semibold mb-4">Create New Chat</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Chat Name</label>
            <input
              type="text"
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              placeholder="Enter chat name"
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Select Participants</label>
            {loading ? (
              <div className="animate-pulse space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 bg-gray-200 rounded"></div>
                ))}
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto border border-gray-300 rounded p-2">
                {users.length === 0 ? (
                  <p className="text-gray-500 text-center">No users found</p>
                ) : (
                  users.map((user) => (
                    <div key={user.id} className="flex items-center mb-2 last:mb-0">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleUserSelect(user.id)}
                        className="mr-2"
                      />
                      <label htmlFor={`user-${user.id}`} className="cursor-pointer">
                        {user.username}
                      </label>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!roomName.trim() || selectedUsers.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export { ChatRoomsList, MessagesList, ChatInput, NewRoomModal };