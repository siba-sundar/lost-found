import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Navigate, useNavigate } from 'react-router-dom';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate()
    useEffect(() =>{
        const token  = localStorage.getItem('token');
        if(token){
            navigate('/user/home');
        }
    },[])

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log(email, password);

        
       

        try {
            const response = await axios.post('http://localhost:4001/users/login', {
                email,  // Correcting this to send email instead of username
                password,
            });

            console.log(response.data.success)
            if (response.data.success === true) {
                if (response.data.token) {
                    // Handle successful login, like saving the token
                    localStorage.setItem('token', response.data.token);
                    console.log(response)

                }


                navigate('/user/home')
            }else{
                setError("Please enter valid details")
            }


        } catch (err) {
            setError('An error occurred during login. Please try again.');
            console.error(err);
        } finally {
            setLoading(false);
        }
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
