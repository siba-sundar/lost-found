import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="bg-blue-600 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-xl font-bold">
          <Link to="/">MySite</Link>
        </div>
        <ul className="flex space-x-6">
          <li>
            <Link to="/" className="hover:text-gray-300">Home</Link>
          </li>
          <li>
            <Link to="/about" className="hover:text-gray-300">About</Link>
          </li>
          <li>
            <Link to="/services" className="hover:text-gray-300">Services</Link>
          </li>
          <li>
            <Link to="/contact" className="hover:text-gray-300">Contact</Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
