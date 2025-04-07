import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LogoutButton from './Logout';
import { Bell, Plus, User, Settings, LogOut, Package } from 'lucide-react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-black text-white shadow-md border-b border-gray-800">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Left - Brand Name */}
          <div className="flex-shrink-0">
            <Link to="/" className="text-xl font-bold text-white hover:text-gray-300">
              MySite
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Right side - Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/" className="text-white hover:text-gray-300 px-3 py-2">
              Home
            </Link>
            <Link to="/about" className="text-white hover:text-gray-300 px-3 py-2">
              About
            </Link>
            <Link to="/services" className="text-white hover:text-gray-300 px-3 py-2">
              Services
            </Link>
            <Link to="/contact" className="text-white hover:text-gray-300 px-3 py-2">
              Contact
            </Link>
            
            {/* Icons */}
            <div className="flex items-center space-x-2 ml-4">
              {/* Notification Icon */}
              <button className="p-2 rounded-full hover:bg-gray-800 focus:outline-none">
                <Bell size={20} />
              </button>
              
              {/* Add Items Icon */}
              <Link to="/user/add-item" className="p-2 rounded-full hover:bg-gray-800 focus:outline-none">
                <Plus size={20} />
              </Link>
              
              {/* User Profile Icon with Dropdown */}
              <div className="relative" ref={dropdownRef}>
                <button 
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="p-2 rounded-full hover:bg-gray-800 focus:outline-none"
                >
                  <User size={20} />
                </button>
                
                {/* Profile Dropdown */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-900 border border-gray-700 rounded-md shadow-lg py-1 z-50">
                    <Link 
                      to="/settings" 
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <Settings size={16} className="mr-2 text-gray-400" />
                      Settings
                    </Link>
                    <Link 
                      to="/handle-items" 
                      className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-800"
                    >
                      <Package size={16} className="mr-2 text-gray-400" />
                      Handle Items
                    </Link>
                    <div className="px-4 py-2 text-sm text-gray-300 hover:bg-gray-800">
                      <LogoutButton customClassName="flex items-center w-full text-left">
                        <LogOut size={16} className="mr-2 text-gray-400" />
                        Logout
                      </LogoutButton>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden bg-gray-900`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link to="/user" className="block px-3 py-2 text-white hover:bg-gray-800 rounded">
            Home
          </Link>
          <Link to="/about" className="block px-3 py-2 text-white hover:bg-gray-800 rounded">
            About
          </Link>
          <Link to="/contact" className="block px-3 py-2 text-white hover:bg-gray-800 rounded">
            Contact
          </Link>
          
          {/* Mobile Icons */}
          <div className="flex justify-between items-center px-3 py-2">
            <div className="flex space-x-4">
              {/* Notification Icon */}
              <Link to="/notifications" className="text-white hover:text-gray-300">
                <Bell size={20} />
              </Link>
              
              {/* Add Items Icon */}
              <Link to="/add-item" className="text-white hover:text-gray-300">
                <Plus size={20} />
              </Link>
            </div>
            
            {/* Mobile User Options */}
            <div className="space-y-1 mt-2">
              <Link to="/settings" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                <Settings size={16} className="mr-2" />
                Settings
              </Link>
              <Link to="/handle-items" className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                <Package size={16} className="mr-2" />
                Handle Items
              </Link>
              <div className="flex items-center px-3 py-2 text-white hover:bg-gray-800 rounded">
                <LogoutButton customClassName="flex items-center w-full">
                  <LogOut size={16} className="mr-2" />
                  Logout
                </LogoutButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;