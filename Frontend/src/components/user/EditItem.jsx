import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const EditItem = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [item, setItem] = useState({
    itemName: '',
    description: '',
    location: '',
    dateFound: '',
    timeFound: '',
    type: ''
  });
  const [images, setImages] = useState([]);
  const [currentImages, setCurrentImages] = useState([]);
  const [imagePreview, setImagePreview] = useState([]);

  // Fetch item details when component mounts
  useEffect(() => {
    const fetchItem = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`/api/items/single/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          const itemData = response.data.item;
          setItem({
            itemName: itemData.item_name,
            description: itemData.description,
            location: itemData.location,
            dateFound: itemData.date_found.split('T')[0], // Format date
            timeFound: itemData.time_found,
            type: itemData.status
          });
          
          // Set current images
          if (itemData.images && Array.isArray(itemData.images)) {
            setCurrentImages(itemData.images);
          }
          
          setLoading(false);
        }
      } catch (error) {
        console.error('Error fetching item:', error);
        toast.error('Failed to load item details');
        setLoading(false);
      }
    };

    fetchItem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setItem(prevItem => ({
      ...prevItem,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 3) {
      toast.warning('Maximum 3 images allowed');
      return;
    }
    
    setImages(files);
    
    // Create preview URLs
    const previewUrls = files.map(file => URL.createObjectURL(file));
    setImagePreview(previewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('itemName', item.itemName);
      formData.append('description', item.description);
      formData.append('location', item.location);
      formData.append('dateFound', item.dateFound);
      formData.append('timeFound', item.timeFound);
      formData.append('type', item.type);

      // Append images if there are any new ones
      if (images.length > 0) {
        images.forEach(image => {
          formData.append('images', image);
        });
      }

      const token = localStorage.getItem('token');
      const response = await axios.put(`/api/items/edit/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        toast.success('Item updated successfully');
        navigate('/dashboard/my-items');
      }
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(error.response?.data?.message || 'Failed to update item');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-400">Edit Item</h2>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">
                Item Name
              </label>
              <input
                type="text"
                name="itemName"
                value={item.itemName}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={item.location}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Date Found/Lost
              </label>
              <input
                type="date"
                name="dateFound"
                value={item.dateFound}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Time Found/Lost
              </label>
              <input
                type="time"
                name="timeFound"
                value={item.timeFound}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Type
              </label>
              <select
                name="type"
                value={item.type}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Type</option>
                <option value="found">Found</option>
                <option value="lost">Lost</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={item.description}
              onChange={handleChange}
              rows="4"
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Current Images
            </label>
            {currentImages.length > 0 ? (
              <div className="grid grid-cols-3 gap-4">
                {currentImages.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Current ${index + 1}`}
                    className="h-32 w-full object-cover rounded-md"
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-400">No current images</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload New Images (replaces current images)
            </label>
            <input
              type="file"
              name="images"
              onChange={handleImageChange}
              multiple
              accept="image/*"
              className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">Max 3 images. Uploading new images will replace all current images.</p>
            
            {imagePreview.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium mb-2">New Image Preview</p>
                <div className="grid grid-cols-3 gap-4">
                  {imagePreview.map((src, index) => (
                    <img
                      key={index}
                      src={src}
                      alt={`Preview ${index + 1}`}
                      className="h-32 w-full object-cover rounded-md"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-md text-white focus:outline-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className={`px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white focus:outline-none ${submitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {submitting ? 'Updating...' : 'Update Item'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItem;