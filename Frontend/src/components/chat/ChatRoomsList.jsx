import React from 'react';
import { useChatContext } from './ChatContext';

const ChatRoomsList = ({ rooms, loading }) => {
  const { joinRoom, currentRoom } = useChatContext();
  
  // Check if rooms is undefined or not an array
  const validRooms = Array.isArray(rooms) ? rooms : [];
  
  if (loading && validRooms.length === 0) {
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
      {validRooms.length === 0 ? (
        <div className="p-4 text-center text-gray-500">
          <p>No chats yet</p>
        </div>
      ) : (
        <ul>
          {validRooms.map((room) => (
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

export default ChatRoomsList;