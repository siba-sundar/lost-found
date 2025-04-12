import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './utils/AuthContext'; // Update this path

const LogoutButton = ({ customClassName, children }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { logout } = useAuth(); // Use the AuthContext

  const handleLogout = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, make the API call to logout
      const refreshToken = localStorage.getItem('refreshToken');
      const accessToken = sessionStorage.getItem('accessToken');
      
      // Try the API call but don't fail if it doesn't work
      try {
        await axios.post(
          'http://localhost:4001/api/auth/logout', 
          { refreshToken }, 
          { 
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${accessToken}`
            }
          }
        );
      } catch (apiError) {
        console.error('API logout failed:', apiError);
        // Continue with local logout even if API call fails
      }
      
      // Then use AuthContext's logout to clear state
      logout();
      
      // Navigate after logout is complete
      navigate('/login', { replace: true });
    } catch (err) {
      console.error('Logout failed:', err.message);
      setError('Failed to logout properly. Please try again.');
      
      // Still try to clean up tokens
      sessionStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      // Still redirect after a delay
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 2000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={customClassName ? "" : "flex flex-col items-center p-6 bg-white rounded-lg shadow-md"}>
      <button
        onClick={handleLogout}
        disabled={loading}
        className={customClassName || "bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-md transition duration-300 ease-in-out w-full mb-4 flex justify-center items-center"}
        aria-label="Logout"
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" aria-hidden="true" />
        )}
        {children || (loading ? 'Logging out...' : 'Logout')}
      </button>
      
      {error && !customClassName && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4 w-full text-center" role="alert">
          {error}
        </div>
      )}
    </div>
  );
};

export default LogoutButton;