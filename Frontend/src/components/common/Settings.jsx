import { useState, useEffect } from 'react';
import { useAuth } from '../utils/AuthContext'; // Adjust this import path as needed
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
  const { currentUser, error, setError } = useAuth();
  
  // Profile states
  const [profileData, setProfileData] = useState({
    username: '',
    email: ''
  });
  
  // Password states
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI states
  const [isLoading, setIsLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [profileError, setProfileError] = useState('');
  
  // Load user data on component mount
  useEffect(() => {
    if (currentUser) {
      setProfileData({
        username: currentUser.name || '',
        email: currentUser.email_id || ''
      });
    }
  }, [currentUser]);
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setProfileError('');
    setProfileSuccess('');
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };
  
  // Submit profile update
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setIsLoading(true);
    
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.put('http://localhost:4001/api/user/edit', {
        username: profileData.username,
        email: profileData.email
      }, {headers: { Authorization: `Bearer ${token}` }});
      
      if (response.data.success) {
        setProfileSuccess('Profile updated successfully');
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update profile';
      setProfileError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Submit password update
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const token = sessionStorage.getItem('accessToken');
      const response = await axios.put('http://localhost:4001/api/user/change-password', {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      },{headers: { Authorization: `Bearer ${token}` }});
      
      if (response.data.success) {
        setPasswordSuccess('Password updated successfully');
        // Clear password fields
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update password';
      setPasswordError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete account functionality
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const handleDeleteAccount = async () => {
    if (!window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }
    
    setDeleteLoading(true);
    
    try {
      const response = await axios.delete('http://localhost:4001/api/user/delete');
      
      if (response.data.success) {
        // Redirect to login page or home page after successful deletion
        window.location.href = '/login';
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to delete account';
      alert(errorMessage);
    } finally {
      setDeleteLoading(false);
    }
  };
  
  if (!currentUser) {
    return (
      <div className="flex min-h-screen bg-[#0a0a0a] text-gray-200 justify-center items-center">
        <div className="text-center p-6">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p>Please log in to access settings.</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-indigo-400">Account Settings</h1>
        
        <div className="bg-black rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-300">Profile Information</h2>
            
            {profileSuccess && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded">
                {profileSuccess}
              </div>
            )}
            
            {profileError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded">
                {profileError}
              </div>
            )}
            
            <form onSubmit={handleProfileSubmit}>
              <div className="mb-6">
                <label htmlFor="username" className="block mb-2 text-sm font-medium text-gray-300">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={profileData.username}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 rounded-md bg-black border border-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleProfileChange}
                  className="w-full px-4 py-3 rounded-md bg-black border border-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-70"
              >
                {isLoading ? 'Updating...' : 'Update Profile'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="bg-black rounded-lg shadow-lg overflow-hidden mb-8">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold mb-6 text-indigo-300">Change Password</h2>
            
            {passwordSuccess && (
              <div className="mb-4 p-3 bg-green-900/50 border border-green-700 text-green-300 rounded">
                {passwordSuccess}
              </div>
            )}
            
            {passwordError && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-700 text-red-300 rounded">
                {passwordError}
              </div>
            )}
            
            <form onSubmit={handlePasswordSubmit}>
              <div className="mb-6">
                <label htmlFor="currentPassword" className="block mb-2 text-sm font-medium text-gray-300">
                  Current Password
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-md bg-black border border-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label htmlFor="newPassword" className="block mb-2 text-sm font-medium text-gray-300">
                  New Password
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-md bg-blackborder border-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  required
                  minLength="8"
                />
                <p className="mt-1 text-sm text-gray-400">Password must be at least 8 characters long</p>
              </div>
              
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block mb-2 text-sm font-medium text-gray-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-4 py-3 rounded-md bg-black border border-gray-700 text-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition duration-200"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200 disabled:opacity-70"
              >
                {isLoading ? 'Updating...' : 'Change Password'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="bg-black rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-semibold mb-6 text-red-400">Danger Zone</h2>
            
            <div className="border border-red-800 rounded-md p-4">
              <h3 className="text-lg font-medium text-red-300 mb-2">Delete Account</h3>
              <p className="text-gray-400 mb-4">
                Once you delete your account, there is no going back. Please be certain.
              </p>
              
              {!showDeleteConfirm ? (
                <button 
                  onClick={() => setShowDeleteConfirm(true)}
                  className="bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200"
                >
                  Delete Account
                </button>
              ) : (
                <div className="flex items-center gap-4">
                  <button 
                    onClick={handleDeleteAccount}
                    disabled={deleteLoading}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition duration-200 disabled:opacity-70"
                  >
                    {deleteLoading ? 'Deleting...' : 'Confirm Delete'}
                  </button>
                  <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md transition duration-200"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;