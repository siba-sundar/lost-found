import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

const UserItemsList = () => {
  const [userItems, setUserItems] = useState([]);
  const {currentUser} = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {

    if(!currentUser){
        navigate('/login');
    }
    const fetchUserItems = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/item/user-items`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        setUserItems(response.data.userOwned);
      } catch (err) {
        console.error('Error fetching user items:', err);
        setError('Failed to load your items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchUserItems();
  }, []);

  const handleItemClick = (id) => {
    navigate(`/user/my-items/${id}`);
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Loader className="w-12 h-12 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
        <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Items</h1>
        
        {userItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center bg-gray-800 rounded-lg p-6 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <h3 className="text-lg font-medium mb-2">No Items Found</h3>
            <p className="text-gray-400">You haven't registered any lost or found items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userItems.map((item) => (
              <div 
                key={item.item_id}
                className="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:bg-gray-700 transition-colors cursor-pointer"
                onClick={() => handleItemClick(item.item_id)}
              >
                <div className="relative h-48">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]} 
                      alt={item.item_name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                      <p className="text-gray-400">No image available</p>
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-gray-900 text-xs font-medium px-2 py-1 rounded-full">
                    {item.status === 'found' ? 'Found' : 'Lost'}
                  </div>
                </div>
                
                <div className="p-4">
                  <h3 className="text-lg font-medium mb-1">{item.item_name}</h3>
                  <p className="text-gray-400 text-sm mb-3 line-clamp-2">{item.description}</p>
                  
                  <div className="flex justify-between items-center text-sm text-gray-400">
                    <div>
                      <p>Location: {item.location}</p>
                      <p>Date: {formatDate(item.date_found)}</p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserItemsList;