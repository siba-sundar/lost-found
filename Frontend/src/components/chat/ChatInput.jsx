// ChatInput.jsx
import React, { useState } from 'react';
import { useChatContext } from './ChatContext';

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


export default ChatInput;