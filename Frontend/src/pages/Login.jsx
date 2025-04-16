import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../components/utils/AuthContext.jsx';
import banner from "/signup.png"

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const navigate = useNavigate();
    const { login, loading, error, setError, isAuthenticated } = useAuth();

    useEffect(() => {
        // If user is already authenticated, redirect to home
        if (isAuthenticated) {
            navigate('/user/home');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        
        const success = await login(email, password);
        if (success) {
            navigate('/user/home');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
            <div className="bg-black rounded-xl overflow-hidden  w-full max-w-6xl flex flex-col md:flex-row  shadow-xl ">
                {/* Left side - Image */}
                <div className="md:w-1/2 relative">
                    <div className="w-full h-48 md:h-full bg-gradient-to-br from-blue-900 via-purple-900 to-black relative overflow-hidden">
                        <img 
                            src={banner} 
                            alt="Login visual" 
                            className="w-full h-full object-cover opacity-70 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h1 className="text-3xl font-bold mb-2">Welcome Back</h1>
                            <p className="text-gray-300">Did you find something this time? </p>
                        </div>
                    </div>
                </div>
                
                {/* Right side - Form */}
                <div className="md:w-1/2 p-8 md:p-12 bg-[#171717]">
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2">Login</h2>
                        <p className="text-gray-400">Please enter your credentials to access your account</p>
                    </div>
                    
                    <form onSubmit={handleLogin} className="space-y-6">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2" htmlFor="email">
                                Email Address
                            </label>
                            <input
                                type="email"
                                id="email"
                                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        
                        <div>
                            <div className="flex justify-between items-center mb-2">
                                <label className="text-gray-300 text-sm font-medium" htmlFor="password">
                                    Password
                                </label>
                                <a href="/forgot-password" className="text-sm text-blue-500 hover:text-blue-400 transition duration-200">
                                    Forgot Password?
                                </a>
                            </div>
                            <input
                                type="password"
                                id="password"
                                className="w-full px-4 py-3 rounded-lg bg-gray-900 text-white border border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        
                        {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
                        
                        <button
                            type="submit"
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Logging in...
                                </span>
                            ) : 'Sign In'}
                        </button>
                    </form>
                    
                    <div className="mt-8 text-center">
                        <p className="text-gray-400">
                            Don't have an account?{' '}
                            <a href="/signup" className="text-blue-500 hover:text-blue-400 font-medium transition duration-200">
                                Create Account
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;