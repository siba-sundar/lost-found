import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import { useChat } from '../utils/ChatContext';

const ItemDetails = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { sendChatRequest, checkChatRequest } = useChat();
  const item = location.state?.item;
  
  // States for UI
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle case where item might be undefined
  if (!item) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-white text-lg">Item not found or data missing</p>
      </div>
    );
  }

  // Ensure images is an array even if it's not in the data
  const images = item.images && Array.isArray(item.images) ? item.images : [];

  // Handle contact finder button click
  const handleContactFinderClick = async () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: location.pathname, item } });
      return;
    }

    // Check if user is trying to contact themselves
    if (currentUser.user_id === item.found_by) {
      showNotification("This is your own item", "error");
      return;
    }

    // Check if there's an existing chat request
    setLoading(true);
    try {
      const existingRequest = await checkChatRequest(item.item_id);
      if (existingRequest) {
        setRequestStatus(existingRequest.status);
      }
      setContactModalOpen(true);
      setLoading(false);
    } catch (error) {
      console.error("Error checking existing request:", error);
      setLoading(false);
    }
  };

  // Send a chat request
  const submitChatRequest = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    setLoading(true);
    try {
      const result = await sendChatRequest(item.item_id, item.found_by, message);
      
      if (result.success) {
        setContactModalOpen(false);
        showNotification("Request sent successfully", "success");
      } else {
        showNotification(result.error || "Failed to send request", "error");
      }
    } catch (error) {
      showNotification("An error occurred", "error");
      console.error("Error sending chat request:", error);
    }
    setLoading(false);
  };

  // Share item functionality
  const handleShareClick = () => {
    setShareModalOpen(true);
  };

  // Copy item URL to clipboard
  const copyToClipboard = () => {
    const url = `${window.location.origin}/item/${item.item_id}`;
    navigator.clipboard.writeText(url)
      .then(() => {
        showNotification("Link copied to clipboard", "success");
        setShareModalOpen(false);
      })
      .catch(err => {
        showNotification("Failed to copy link", "error");
        console.error("Error copying to clipboard:", err);
      });
  };

  // Share via WhatsApp
  const shareViaWhatsApp = () => {
    const url = `${window.location.origin}/item/${item.item_id}`;
    const text = `Check out this ${item.item_name} I found on LostAndFound: ${url}`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShareModalOpen(false);
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };
  

  return (
    <div className=" text-white bg-[#0a0a0a] w-screen min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg ${
          notification.type === 'success' ? 'bg-green-600' : 'bg-red-600'
        }`}>
          <p>{notification.message}</p>
        </div>
      )}

      <div className="rounded-lg shadow-lg overflow-hidden w-full">
        <div className="flex flex-col md:flex-row">
          {/* Left side - Images Section */}
          <div className="w-full md:w-1/2 p-4">
            {/* Main image display */}
            <div className="bg-black rounded-lg overflow-hidden mb-4 h-80">
              {images.length > 0 ? (
                <img 
                  src={images[currentImageIndex]}
                  alt={`${item.item_name} - View ${currentImageIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>
            
            {/* Thumbnail gallery */}
            {images.length > 1 && (
              <div className="flex space-x-2 overflow-x-auto py-2">
                {images.map((img, index) => (
                  <div 
                    key={index}
                    className={`flex-shrink-0 w-16 h-16 rounded cursor-pointer border-2 ${
                      currentImageIndex === index ? 'border-blue-500' : 'border-transparent'
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img 
                      src={img} 
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right side - Details Section */}
          <div className="w-full md:w-1/2 p-6">
            <h1 className="text-3xl font-bold mb-4">{item.item_name}</h1>
           
            
            <div className="bg-gray-800 rounded-lg p-4 mb-6">
              <div className="flex flex-col space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Location:</span>
                  <span className="font-medium">{item.location}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="font-medium">{formatDate(item.date_found || item.time_entered)}</span>
                </div>
                
                {item.category && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Category:</span>
                    <span className="font-medium">{item.category}</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Description */}
            {item.description && (
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Description</h2>
                <p className="text-gray-300 bg-gray-800 rounded-lg p-4">{item.description}</p>
              </div>
            )}
            
            {/* Contact/Action buttons */}
            <div className="flex flex-col space-y-3">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center"
                onClick={handleContactFinderClick}
                disabled={loading}
              >
                {loading ? (
                  <div className="w-5 h-5 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                ) : null}
                Contact Finder
              </button>
              <button 
                className="bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition duration-300"
                onClick={handleShareClick}
              >
                Share Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Modal */}
      {contactModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Contact Finder</h2>
            
            {requestStatus ? (
              <div>
                {requestStatus === 'pending' && (
                  <div className="bg-yellow-500 bg-opacity-20 text-yellow-400 p-4 rounded-lg mb-4">
                    You've already sent a request for this item. Please wait for the finder to respond.
                  </div>
                )}
                {requestStatus === 'accepted' && (
                  <div className="bg-green-500 bg-opacity-20 text-green-400 p-4 rounded-lg mb-4">
                    Your request was accepted! Go to your chats to continue the conversation.
                  </div>
                )}
                {requestStatus === 'declined' && (
                  <div className="bg-red-500 bg-opacity-20 text-red-400 p-4 rounded-lg mb-4">
                    Your request was declined by the finder.
                  </div>
                )}
              </div>
            ) : (
              <form onSubmit={submitChatRequest}>
                <div className="mb-4">
                  <label className="block text-gray-300 mb-2">Message to finder</label>
                  <textarea 
                    className="w-full bg-gray-700 text-white rounded-lg p-3 border border-gray-600 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                    placeholder="Explain why you're interested in this item..."
                    rows="4"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                  ></textarea>
                </div>
                <div className="flex justify-end space-x-3">
                  <button 
                    type="button"
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                    onClick={() => setContactModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center"
                    disabled={loading || !message.trim()}
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-t-2 border-white rounded-full animate-spin mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      'Send Request'
                    )}
                  </button>
                </div>
              </form>
            )}
            
            {requestStatus && (
              <div className="mt-4 flex justify-end">
                <button 
                  type="button"
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
                  onClick={() => setContactModalOpen(false)}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Share Modal */}
      {shareModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-md p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4">Share Item</h2>
            
            <div className="space-y-4">
              <button 
                onClick={copyToClipboard}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                Copy Link
              </button>
              
              <button 
                onClick={shareViaWhatsApp}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition duration-300 flex items-center justify-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Share via WhatsApp
              </button>
              
              <button 
                onClick={() => setShareModalOpen(false)}
                className="w-full bg-gray-600 hover:bg-gray-500 text-white py-3 px-6 rounded-lg font-medium transition duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ItemDetails;