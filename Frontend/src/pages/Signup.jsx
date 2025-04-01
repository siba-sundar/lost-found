import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Signup = () => {
    const navigate = useNavigate();
    
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
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
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
        
        setLoading(true);
        
        try {
            // Create form data if there's profile picture
            let requestData = { ...formData };
            delete requestData.confirmPassword;
            
            if (profilePicture) {
                // Convert the image to base64 for sending in JSON
                // Note: For large files, a multipart form approach would be better
                const reader = new FileReader();
                reader.readAsDataURL(profilePicture);
                reader.onload = async () => {
                    requestData.profile_picture = reader.result;
                    await submitData(requestData);
                };
            } else {
                await submitData(requestData);
            }
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || "An error occurred during signup");
            console.error("Signup error:", err);
        }
    };
    
    const submitData = async (data) => {
        try {
            const response = await axios.post('http://localhost:4001/api/auth/signup', data);
            
            // Store tokens if signup was successful
            if (response.data.accessToken) {
                localStorage.setItem('accessToken', response.data.accessToken);
                // Refresh token should be handled by HttpOnly cookie on the backend
            }
            
            setLoading(false);
            
            // Redirect to login or dashboard
            alert("Signup successful!");
            navigate('/login'); // Redirect to login page or dashboard
            
        } catch (err) {
            setLoading(false);
            setError(err.response?.data?.message || "An error occurred during signup");
            console.error("Signup error:", err);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 py-8">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h1 className="text-2xl font-semibold mb-6 text-center">Create Your Account</h1>

                {error && (
                    <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
                        <p>{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="h-24 w-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-gray-300">
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
                                className="absolute bottom-0 right-0 bg-blue-500 text-white rounded-full p-1 cursor-pointer hover:bg-blue-600"
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
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label htmlFor="email_id" className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                            <input
                                type="email"
                                id="email_id"
                                name="email_id"
                                value={formData.email_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="college_id" className="block text-sm font-medium text-gray-700 mb-1">College ID <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                id="college_id"
                                name="college_id"
                                value={formData.college_id}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                            <input
                                type="tel"
                                id="phone_number"
                                name="phone_number"
                                value={formData.phone_number}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                            <input
                                type="password"
                                id="confirmPassword"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300"
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-6">
                        <p className="text-xs text-gray-500 mb-4">
                            Password must be at least 8 characters long and include uppercase, lowercase, numbers, and special characters.
                        </p>
                    
                        <button
                            type="submit"
                            className={`w-full py-2 text-white rounded-md transition-colors ${
                                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                            } focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2`}
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
                    
                    <div className="mt-4 text-center">
                        <p className="text-sm text-gray-600">
                            Already have an account? <a href="/login" className="text-blue-500 hover:underline">Log in</a>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Signup;