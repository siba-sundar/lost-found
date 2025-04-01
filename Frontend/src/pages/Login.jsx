import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const navigate = useNavigate();

    useEffect(() => {
        // Check if we have an access token in memory first
        const accessToken = sessionStorage.getItem('accessToken');
        if (accessToken) {
            navigate('/user/home');
            return;
        }

        // If no access token, check for a refresh token and try to get a new access token
        const refreshToken = localStorage.getItem('refreshToken');
        if (refreshToken) {
            refreshAccessToken(refreshToken);
        }
    }, [navigate]);

    // Function to refresh the access token using refresh token
    const refreshAccessToken = async (refreshToken) => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:4001/users/refresh-token', {
                refreshToken: refreshToken
            });

            if (response.data.success) {
                // Store the new tokens
                sessionStorage.setItem('accessToken', response.data.accessToken);
                localStorage.setItem('refreshToken', response.data.refreshToken);
                
                // Navigate to home page
                navigate('/user/home');
            } else {
                // If refresh token is invalid, remove it
                localStorage.removeItem('refreshToken');
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            // Clear stored tokens on error
            localStorage.removeItem('refreshToken');
            sessionStorage.removeItem('accessToken');
        } finally {
            setLoading(false);
        }
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await axios.post('http://localhost:4001/api/auth/login', {
                email,
                password,
            });

            if (response.data.success === true) {
                // Store access token in sessionStorage (memory) for security
                // This will be cleared when the browser tab is closed
                sessionStorage.setItem('accessToken', response.data.accessToken);
                
                // Store refresh token in localStorage
                // This persists even when browser is closed
                localStorage.setItem('refreshToken', response.data.refreshToken);
                
                // Set up axios interceptor for automatic token refresh
                setupAxiosInterceptors();
                
                // Navigate to home page
                navigate('/user/home');
            } else {
                setError("Please enter valid details");
            }
        } catch (err) {
            if (err.response && err.response.data && err.response.data.message) {
                setError(err.response.data.message);
            } else {
                setError('An error occurred during login. Please try again.');
            }
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Set up axios interceptor to handle token refresh
    const setupAxiosInterceptors = () => {
        // Remove any existing interceptors
        axios.interceptors.response.eject(axios.interceptors.response.handlers[0]);
        
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
                            // No refresh token, redirect to login
                            navigate('/login');
                            return Promise.reject(error);
                        }
                        
                        // Get a new access token
                        const response = await axios.post('http://localhost:4001/users/refresh-token', {
                            refreshToken: refreshToken
                        });
                        
                        if (response.data.success) {
                            // Update tokens
                            sessionStorage.setItem('accessToken', response.data.accessToken);
                            localStorage.setItem('refreshToken', response.data.refreshToken);
                            
                            // Update Authorization header
                            axios.defaults.headers.common['Authorization'] = 
                                `Bearer ${response.data.accessToken}`;
                            originalRequest.headers['Authorization'] = 
                                `Bearer ${response.data.accessToken}`;
                            
                            // Retry the original request
                            return axios(originalRequest);
                        }
                    } catch (refreshError) {
                        // Refresh token is invalid, redirect to login
                        localStorage.removeItem('refreshToken');
                        sessionStorage.removeItem('accessToken');
                        navigate('/login');
                        return Promise.reject(refreshError);
                    }
                }
                
                return Promise.reject(error);
            }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                            Password
                        </label>
                        <input
                            type="password"
                            id="password"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                
                <p className="mt-4 text-gray-600 text-sm text-center">
                    Don't have an account? <a href="/signup" className="text-blue-500">Sign up</a>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;