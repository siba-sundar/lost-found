import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { ArrowLeft, Trash2, Edit, Loader, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';


const ItemDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingItem, setDeletingItem] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const{currentUser} = useAuth();


  useEffect(() =>{
    if(!currentUser){
        navigate('/login');0
    }
  },[])

  useEffect(() => {

    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${import.meta.env.VITE_BASE_URL}/api/item/single-item/${id}`,
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
            },
          }
        );
        setItem(response.data.item);
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load item details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchItemDetails();
  }, [id]);

  const handleEdit = () => {
    navigate(`/my-items/edit/${id}`);
  };

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    
    try {
      setDeletingItem(true);
      await axios.delete(
        `${import.meta.env.VITE_BASE_URL}/api/item/delete/${id}`,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`,
          },
        }
      );
      navigate('/my-items', { replace: true });
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete the item. Please try again later.');
      setDeletingItem(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const nextImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === item.images.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  const prevImage = () => {
    if (item?.images && item.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? item.images.length - 1 : prevIndex - 1
      );
    }
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
        <button 
          onClick={handleBack}
          className="mt-6 flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4 text-white">
        <AlertCircle className="w-16 h-16 text-gray-400 mb-4" />
        <h2 className="text-xl font-semibold mb-2">Item Not Found</h2>
        <p>The item you're looking for doesn't exist or has been removed.</p>
        <button 
          onClick={handleBack}
          className="mt-6 flex items-center px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 md:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back button and action buttons */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handleBack}
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          <div className="flex space-x-3">
            <button 
              onClick={handleEdit}
              className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </button>
            
            <button 
              onClick={handleDelete}
              disabled={deletingItem}
              className={`flex items-center px-4 py-2 ${
                confirmDelete 
                  ? 'bg-red-600 hover:bg-red-700' 
                  : 'bg-gray-700 hover:bg-gray-600'
              } rounded-lg transition-colors`}
            >
              {deletingItem ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4 mr-2" />
              )}
              {confirmDelete ? 'Confirm Delete' : 'Delete'}
            </button>
          </div>
        </div>
        
        {/* Item details */}
        <div className="bg-gray-800 rounded-xl overflow-hidden shadow-xl">
          {/* Image carousel */}
          {item.images && item.images.length > 0 ? (
            <div className="relative h-64 md:h-96">
              <img 
                src={item.images[currentImageIndex]} 
                alt={`${item.item_name} - image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              
              {item.images.length > 1 && (
                <>
                  <button 
                    onClick={prevImage}
                    className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button 
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-70 transition-opacity"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                  
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
                    {item.images.map((_, index) => (
                      <div 
                        key={index}
                        className={`w-2 h-2 rounded-full ${
                          index === currentImageIndex ? 'bg-white' : 'bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-64 md:h-96 bg-gray-700 flex items-center justify-center">
              <p className="text-gray-400">No image available</p>
            </div>
          )}
          
          {/* Status badge */}
          <div className="px-6 pt-6">
            <span className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
              item.status === 'found' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
            }`}>
              {item.status === 'found' ? 'Found Item' : 'Lost Item'}
            </span>
          </div>
          
          {/* Item info */}
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">{item.item_name}</h1>
            
            <div className="mb-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-300">{item.description}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-medium mb-2">Location</h2>
                <p className="text-gray-300">{item.location}</p>
              </div>
              
              <div>
                <h2 className="text-lg font-medium mb-2">Date & Time</h2>
                <p className="text-gray-300">
                  {formatDate(item.date_found)} at {item.time_found}
                </p>
              </div>
            </div>
            
            <div className="mt-6 pt-6 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Item ID: {item.item_id}
              </p>
              <p className="text-sm text-gray-400">
                Registered on: {new Date(item.time_entered).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemDetails;