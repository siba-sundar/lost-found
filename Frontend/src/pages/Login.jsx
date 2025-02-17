import React, { useState } from 'react';
import axios from 'axios';

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // try {
        //     const response = await axios.post('/api/login', { username, password });
        //     // Save the token in localStorage or any preferred storage
        //     localStorage.setItem('token', response.data.token);

        //     // Redirect to a dashboard or any other protected route
        //     window.location.href = '/dashboard';
        // } catch (err) {
        //     setLoading(false);
        //     if (err.response && err.response.data.message) {
        //         setError(err.response.data.message);
        //     } else {
        //         setError('An error occurred. Please try again.');
        //     }
        // }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-semibold text-center mb-6">Login</h2>
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
                            Username
                        </label>
                        <input
                            type="text"
                            id="username"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
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
