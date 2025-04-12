import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Create the context
export const AuthContext = createContext(null);

// Create a custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Provider component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  useEffect(() => {
    // Check authentication status on initial load
    checkAuthStatus();
    
    // Set up axios interceptors for token refresh
    setupAxiosInterceptors();
  }, []);
  
  // Check if user is authenticated
  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Check if we have an access token in memory first
      const accessToken = sessionStorage.getItem('accessToken');
      
      if (accessToken) {
        // Set authorization header for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        
        // Get user data
        const userResponse = await axios.get('http://localhost:4001/api/user/profile');
        setCurrentUser(userResponse.data.user);
        setLoading(false);
        return true;
      }

      // If no access token, check for a refresh token
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        await refreshAccessToken(refreshToken);
        return true;
      }
      
      setLoading(false);
      return false;
    } catch (err) {
      console.error('Auth check error:', err);
      setCurrentUser(null);
      setLoading(false);
      return false;
    }
  };

  // Set up axios interceptor to handle token refresh
  const setupAxiosInterceptors = () => {
    // Remove any existing interceptors
    axios.interceptors.response.handlers?.forEach((handler, index) => {
      axios.interceptors.response.eject(index);
    });
    
    // Add a response interceptor
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        
        // If the error is due to an expired token and we haven't retried yet
        if (error.response?.status === 401 && 
            error.response?.data?.expired === true && 
            !originalRequest._retry) {
            
            originalRequest._retry = true;
            
            try {
              const refreshToken = localStorage.getItem('refreshToken');
              
              if (!refreshToken) {
                // No refresh token, logout
                logout();
                return Promise.reject(error);
              }
              
              // Get a new access token
              const refreshed = await refreshAccessToken(refreshToken);
              
              if (refreshed) {
                // Update Authorization header
                const newAccessToken = sessionStorage.getItem('accessToken');
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
                
                // Retry the original request
                return axios(originalRequest);
              }
            } catch (refreshError) {
              // Refresh token is invalid, logout
              logout();
              return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
      }
    );
  };

  // Function to refresh the access token using refresh token
  const refreshAccessToken = async (refreshToken) => {
    try {
      console.log('Sending refresh token:', refreshToken);

      const response = await axios.post('http://localhost:4001/api/auth/refresh-token', {
        refreshToken: refreshToken
      });

      if (response.data.success) {
        // Store the new tokens
        const newAccessToken = response.data.accessToken;
        sessionStorage.setItem('accessToken', newAccessToken);
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        
        // Get user data
        const userResponse = await axios.get('http://localhost:4001/api/user/profile');
        setCurrentUser(userResponse.data.user);
        
        setLoading(false);
        return true;
      } else {
        // If refresh token is invalid, remove it
        localStorage.removeItem('refreshToken');
        sessionStorage.removeItem('accessToken');
        setCurrentUser(null);
        setLoading(false);
        return false;
      }
    } catch (error) {
      console.error('Error refreshing token:', error);
      // Clear stored tokens on error
      localStorage.removeItem('refreshToken');
      sessionStorage.removeItem('accessToken');
      setCurrentUser(null);
      setLoading(false);
      return false;
    }
  };

  // Login function
  const login = async (email, password) => {
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('http://localhost:4001/api/auth/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Store access token in sessionStorage (memory) for security
        // This will be cleared when the browser tab is closed
        sessionStorage.setItem('accessToken', response.data.accessToken);
        
        // Store refresh token in localStorage
        // This persists even when browser is closed
        localStorage.setItem('refreshToken', response.data.refreshToken);
        
        // Set authorization header
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.accessToken}`;
        
        // Get user data
        const userResponse = await axios.get('http://localhost:4001/api/user/profile');
        setCurrentUser(userResponse.data.user);
        
        setLoading(false);
        return true;
      } else {
        setError("Please enter valid details");
        setLoading(false);
        return false;
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('An error occurred during login. Please try again.');
      }
      console.error(err);
      setLoading(false);
      return false;
    }
  };

  // Signup function
  const signup = async (userData, profilePicture = null) => {
    setError('');
    setLoading(true);
    
    try {
      // Create request data
      let requestData = { ...userData };
      delete requestData.confirmPassword;
      
      // Handle profile picture if provided
      if (profilePicture) {
        // Convert the image to base64
        const base64Image = await convertToBase64(profilePicture);
        requestData.profile_picture = base64Image;
      }
      
      // Send signup request
      const response = await axios.post('http://localhost:4001/api/auth/signup', requestData);
      
      setLoading(false);
      
      if (response.data.accessToken) {
        // If the API returns tokens immediately after signup, store them
        sessionStorage.setItem('accessToken', response.data.accessToken);
        // Refresh token should be handled by HttpOnly cookie on the backend or in localStorage
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        
        // Set current user if available in response
        if (response.data.user) {
          setCurrentUser(response.data.user);
        }
        
        return { success: true };
      }
      
      return { success: true, message: "Signup successful! Please login." };
      
    } catch (err) {
      const errorMessage = err.response?.data?.message || "An error occurred during signup";
      setError(errorMessage);
      console.error("Signup error:", err);
      setLoading(false);
      return { success: false, message: errorMessage };
    }
  };

  // Helper function to convert file to base64
  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
  };

  // Logout function
  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    delete axios.defaults.headers.common['Authorization'];
    
    // You can also call a logout endpoint if needed
    // axios.post('http://localhost:4001/api/auth/logout');
    
    return true;
  };

  // Value object to be provided to consumers
  const value = {
    currentUser,
    loading,
    error,
    setError,
    login,
    signup,
    logout,
    checkAuthStatus,
    isAuthenticated: !!currentUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};