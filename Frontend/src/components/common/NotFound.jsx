import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
            <div className="max-w-md w-full text-center">
                {/* Error Code and Glitch Effect */}
                <div className="relative mb-8">
                    <h1 className="text-9xl font-bold text-gray-700">404</h1>
                    <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 
                        text-9xl font-bold text-blue-500 opacity-20 animate-pulse">
                        404
                    </span>
                </div>

                {/* Error Message */}
                <div className="mb-8">
                    <h2 className="text-2xl font-semibold text-white mb-2">
                        Page Not Found
                    </h2>
                    <p className="text-gray-400">
                        The page you're looking for doesn't exist or has been moved.
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg 
                            hover:bg-blue-700 transition duration-300 flex items-center 
                            justify-center space-x-2"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path 
                                fillRule="evenodd" 
                                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" 
                                clipRule="evenodd" 
                            />
                        </svg>
                        <span>Go Back</span>
                    </button>

                    <button
                        onClick={() => navigate('/user/home')}
                        className="w-full px-6 py-3 bg-gray-700 text-white rounded-lg 
                            hover:bg-gray-600 transition duration-300 flex items-center 
                            justify-center space-x-2"
                    >
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            className="h-5 w-5" 
                            viewBox="0 0 20 20" 
                            fill="currentColor"
                        >
                            <path 
                                d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" 
                            />
                        </svg>
                        <span>Go Home</span>
                    </button>
                </div>

                {/* Optional: Custom Graphics or Animation */}
                <div className="mt-8">
                    <div className="w-32 h-32 mx-auto opacity-20 animate-bounce">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            className="text-gray-400"
                            strokeWidth="1"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M8 15h8M9.5 9h.01M14.5 9h.01" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NotFound;