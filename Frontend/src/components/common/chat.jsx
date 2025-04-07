import React, { useState, useEffect, useRef } from 'react';
import { useChatContext } from '../context/ChatContext';
import ChatRoomsList from './ChatRoomsList';
import MessagesList from './MessagesList';
import ChatInput from './ChatInput';
import NewRoomModal from './NewRoomModal';

const Chat = () => {
  const { 
    chatRooms, 
    currentRoom, 
    messages, 
    loading, 
    fetchChatRooms 
  } = useChatContext();
  
  const [showNewRoomModal, setShowNewRoomModal] = useState(false);
  
  // Fetch chat rooms on component mount
  useEffect(() => {
    fetchChatRooms();
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Chat sidebar */}
      <div className="w-1/4 bg-white border-r border-gray-300">
        <div className="p-4 border-b border-gray-300 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Chats</h2>
          <button 
            onClick={() => setShowNewRoomModal(true)}
            className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
        <ChatRoomsList rooms={chatRooms} loading={loading} />
      </div>
      
      {/* Chat main area */}
      <div className="w-3/4 flex flex-col">
        {currentRoom ? (
          <>
            {/* Chat header */}
            <div className="p-4 border-b border-gray-300 bg-white">
              <h3 className="text-lg font-medium">{currentRoom.name}</h3>
            </div>
            
            {/* Messages area */}
            <MessagesList messages={messages} loading={loading} />
            
            {/* Chat input */}
            <ChatInput />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center text-gray-500">
              <p className="text-xl">Select a chat or create a new one</p>
            </div>
          </div>
        )}
      </div>
      
      {/* New Room Modal */}
      {showNewRoomModal && (
        <NewRoomModal onClose={() => setShowNewRoomModal(false)} />
      )}
    </div>
  );
};

export default Chat;