import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, X } from 'lucide-react';
import { useAuth } from '../utils/AuthContext.jsx'; 

const AddItemForm = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth(); // Use the auth context
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [formData, setFormData] = useState({
    itemName: '',
    description: '',
    location: '',
    dateFound: '',
    timeFound: '',
    type: 'found', // Default value
    images: []
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Check if adding these files would exceed the limit of 3
    if (formData.images.length + files.length > 3) {
      setError('Maximum 3 images allowed');
      return;
    }

    // Store the new files
    setFormData(prevData => ({
      ...prevData,
      images: [...prevData.images, ...files]
    }));
    
    // Generate previews for all new images
    const newPreviews = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImages(prev => [...prev, reader.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prevData => ({
      ...prevData,
      images: prevData.images.filter((_, i) => i !== index)
    }));
    
    setPreviewImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      // Validate form
      if (!formData.itemName || !formData.description || !formData.location || 
          !formData.dateFound || !formData.timeFound || formData.images.length === 0) {
        throw new Error('All fields are required, including at least one image');
      }

      // Check authentication using the auth context
      if (!isAuthenticated) {
        throw new Error('You must be logged in to add an item');
      }

      // Get token from sessionStorage (where AuthContext stores it)
      const token = sessionStorage.getItem('accessToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // Create form data for file upload
      const submitData = new FormData();
      submitData.append('itemName', formData.itemName);
      submitData.append('description', formData.description);
      submitData.append('location', formData.location);
      submitData.append('dateFound', formData.dateFound);
      submitData.append('timeFound', formData.timeFound);
      submitData.append('type', formData.type);
      
      // Append each image with the same field name 'images'
      formData.images.forEach(image => {
        submitData.append('images', image);
      });

      // Submit the form with authorization header
      const response = await fetch('http://localhost:4001/api/item/add', {
        method: 'POST',
        body: submitData,
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type header when sending FormData
        }
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to add item');
      }

      setSuccess('Item added successfully!');
      // Reset form after successful submission
      setFormData({
        itemName: '',
        description: '',
        location: '',
        dateFound: '',
        timeFound: '',
        type: 'found',
        images: []
      });
      setPreviewImages([]);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/items');
      }, 2000);
    } catch (err) {
      setError(err.message);
      console.error('Error adding item:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white rounded-lg shadow-md min-h-screen">
      <h1 className="text-2xl font-bold text-blue-800 mb-6">Add New Item</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}
      
      {!isAuthenticated && (
        <div className="mb-4 p-3 bg-yellow-100 border border-yellow-400 text-yellow-700 rounded">
          Please log in to add an item. <button 
            onClick={() => navigate('/login')} 
            className="text-blue-600 underline hover:text-blue-800"
          >
            Go to Login
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex flex-col md:flex-row md:space-x-4 space-y-6 md:space-y-0">
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Item Type
              </label>
              <div className="flex space-x-4">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="found"
                    checked={formData.type === 'found'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Found Item</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="type"
                    value="lost"
                    checked={formData.type === 'lost'}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600"
                  />
                  <span className="ml-2 text-gray-700">Lost Item</span>
                </label>
              </div>
            </div>
            
            <div className="mb-4">
              <label htmlFor="itemName" className="block text-sm font-medium text-gray-700 mb-1">
                Item Name
              </label>
              <input
                type="text"
                id="itemName"
                name="itemName"
                value={formData.itemName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter item name"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="4"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Describe the item"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Where was it found/lost?"
              />
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <div className="mb-4">
              <label htmlFor="dateFound" className="block text-sm font-medium text-gray-700 mb-1">
                Date
              </label>
              <input
                type="date"
                id="dateFound"
                name="dateFound"
                value={formData.dateFound}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="timeFound" className="block text-sm font-medium text-gray-700 mb-1">
                Time
              </label>
              <input
                type="time"
                id="timeFound"
                name="timeFound"
                value={formData.timeFound}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Upload Images (Up to 3)
              </label>
              <div className="mt-1 border-2 border-gray-300 border-dashed rounded-md">
                {/* Image Previews */}
                {previewImages.length > 0 && (
                  <div className="p-4 grid grid-cols-3 gap-2">
                    {previewImages.map((preview, index) => (
                      <div key={index} className="relative">
                        <img 
                          src={preview} 
                          alt={`Preview ${index + 1}`} 
                          className="h-24 w-24 object-cover rounded"
                        />
                        <button 
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 transform translate-x-1/3 -translate-y-1/3"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                {/* Upload control */}
                {formData.images.length < 3 && (
                  <div className="p-4 flex justify-center">
                    <div className="space-y-2 text-center">
                      <Camera className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none"
                        >
                          <span>Upload images</span>
                          <input
                            id="image-upload"
                            name="images"
                            type="file"
                            accept="image/*"
                            multiple
                            className="sr-only"
                            onChange={handleImageChange}
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, GIF up to 5MB each ({3 - formData.images.length} remaining)
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mr-2 px-4 py-2 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !isAuthenticated}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
          >
            {isSubmitting ? 'Submitting...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;