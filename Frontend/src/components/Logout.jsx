import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LogoutButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');
      // Get access token from sessionStorage
      const accessToken = sessionStorage.getItem('accessToken');
    
      
      // Make the logout request
      const response = await axios.post(
        'http://localhost:4001/api/auth/logout', 
        { refreshToken }, 
        { 
          withCredentials: true, // This ensures cookies are sent with the request
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );
      
      if (response.data.success) {
        // Clear tokens from their respective storage locations
        sessionStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
        
        // Redirect to login page
        navigate('/login', { replace: true });
      }
    } catch (err) {
      console.error('Logout failed:', err.response?.data?.message || err.message);
      
      // Still clear tokens even if API call fails
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      setError('Failed to logout from server, but cleared local session data.');
      
      // Optional: still redirect after a short delay to show the error
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-md">
      <button
        onClick={handleLogout}
        disabled={loading}
        className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition duration-300 ease-in-out w-full mb-4 flex justify-center items-center"
        aria-label="Logout"
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
        )}
        {loading ? 'Logging out...' : 'Logout'}
      </button>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 w-full text-center" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoutButton;