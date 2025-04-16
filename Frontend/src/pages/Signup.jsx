import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/utils/AuthContext.jsx";
import banner from "/login.png";

const Signup = () => {
    const navigate = useNavigate();
    const { signup, error, setError, loading, isAuthenticated } = useAuth();
    
    // User data state
    const [formData, setFormData] = useState({
        name: '',
        email_id: '',
        college_id: '',
        phone_number: '',
        password: '',
        confirmPassword: ''
    });
    
    // UI state
    const [profilePicture, setProfilePicture] = useState(null);
    const [profilePreview, setProfilePreview] = useState(null);

    // Password Regex (at least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character)
    const pass_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    // Email Regex (basic email validation)
    const email_REGEX = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleProfilePicture = (e) => {
        const file = e.target.files[0];
        if (file) {
            setProfilePicture(file);
            // Create a preview URL
            setProfilePreview(URL.createObjectURL(file));
        }
    };

    const validateForm = () => {
        // Check for required fields
        if (!formData.email_id || !formData.college_id) {
            setError("Email and college ID are required");
            return false;
        }

        // Validate email format
        if (!email_REGEX.test(formData.email_id)) {
            setError("Please enter a valid email address");
            return false;
        }

        // Validate password
        if (!pass_REGEX.test(formData.password)) {
            setError("Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters");
            return false;
        }

        // Check if passwords match
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return false;
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        
        if (!validateForm()) {
            return;
        }
        
        // Call the signup function from AuthContext
        const result = await signup(formData, profilePicture);
        
        if (result.success) {
            alert("Signup successful!");
            navigate('/login');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] py-8">
            <div className="bg-black rounded-xl overflow-hidden shadow-2xl w-full max-w-6xl flex flex-col md:flex-row">
                {/* Left side - Image */}
                <div className="md:w-1/2 relative">
                    <div className="w-full h-48 md:h-full bg-gradient-to-br from-indigo-900 via-purple-900 to-black relative overflow-hidden">
                        <img 
                            src={banner} 
                            alt="Signup visual" 
                            className="w-full h-full object-cover opacity-70 mix-blend-overlay"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                        <div className="absolute bottom-0 left-0 p-8 text-white">
                            <h1 className="text-3xl font-bold mb-2">Lost Something?</h1>
                            <p className="text-gray-300">Create your account and find what's yours.</p>
                        </div>
                    </div>
                </div>
                
                {/* Right side - Form */}
                <div className="md:w-1/2 p-6 md:p-8 bg-[#171717] overflow-y-auto max-h-screen">
                    <div className="mb-6">
                        <h2 className="text-2xl font-bold text-white mb-2">Create Your Account</h2>
                        <p className="text-gray-400">Fill in your details to sign up</p>
                    </div>

                    {error && (
                        <div className="bg-red-900/20 border-l-4 border-red-500 text-red-400 p-4 mb-6 rounded" role="alert">
                            <p>{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div className="mb-6 flex justify-center">
                            {/* <div className="relative">
                                <div className="h-24 w-24 rounded-full bg-gray-800 flex items-center justify-center overflow-hidden border-2 border-gray-700">
                                    {profilePreview ? (
                                        <img 
                                            src={profilePreview} 
                                            alt="Profile Preview" 
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <span className="text-gray-400 text-4xl">👤</span>
                                    )}
                                </div>
                                <label 
                                    htmlFor="profile_picture" 
                                    className="absolute bottom-0 right-0 bg-blue-600 text-white rounded-full p-2 cursor-pointer hover:bg-blue-700 transition-colors duration-200"
                                    title="Upload picture"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                    <input
                                        type="file"
                                        id="profile_picture"
                                        className="hidden"
                                        onChange={handleProfilePicture}
                                        accept="image/*"
                                    />
                                </label>
                            </div> */}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label htmlFor="email_id" className="block text-sm font-medium text-gray-300 mb-1">Email <span className="text-red-500">*</span></label>
                                <input
                                    type="email"
                                    id="email_id"
                                    name="email_id"
                                    value={formData.email_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                    placeholder="your@email.com"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="college_id" className="block text-sm font-medium text-gray-300 mb-1">College ID <span className="text-red-500">*</span></label>
                                <input
                                    type="text"
                                    id="college_id"
                                    name="college_id"
                                    value={formData.college_id}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                    placeholder="SID123456"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="phone_number" className="block text-sm font-medium text-gray-300 mb-1">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phone_number"
                                    name="phone_number"
                                    value={formData.phone_number}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                    placeholder="+1 (123) 456-7890"
                                />
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                                <input
                                    type="password"
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg bg-gray-900 text-white border-gray-800 focus:border-blue-500 focus:ring-blue-500 focus:outline-none transition duration-200"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <div className="mt-6">
                            <p className="text-xs text-gray-400 mb-4">
                                Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                            </p>
                        
                            <button
                                type="submit"
                                className={`w-full py-3 text-white rounded-lg transition-colors ${
                                    loading ? 'bg-gray-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                                } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900`}
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Creating Account...
                                    </div>
                                ) : "Create Account"}
                            </button>
                        </div>
                        
                        <div className="mt-6 text-center">
                            <p className="text-gray-400">
                                Already have an account? <a href="/login" className="text-blue-500 hover:text-blue-400 transition duration-200 font-medium">Log in</a>
                            </p>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Signup;