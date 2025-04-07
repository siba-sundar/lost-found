// 
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

export default NewRoomModal;