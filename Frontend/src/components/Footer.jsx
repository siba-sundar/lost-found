import React from 'react';
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin, GitHub } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Your Company</h3>
            <p className="mb-4">Creating innovative solutions for tomorrow's challenges.</p>
            <div className="flex items-center mb-2">
              <MapPin size={16} className="mr-2 text-blue-400" />
              <span>123 Business Street, City, Country</span>
            </div>
            <div className="flex items-center mb-2">
              <Phone size={16} className="mr-2 text-blue-400" />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center mb-2">
              <Mail size={16} className="mr-2 text-blue-400" />
              <span>contact@yourcompany.com</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Quick Links</h3>
            <ul>
              <li className="mb-2">
                <a href="/about" className="hover:text-blue-400 transition duration-300">About Us</a>
              </li>
              <li className="mb-2">
                <a href="/services" className="hover:text-blue-400 transition duration-300">Services</a>
              </li>
              <li className="mb-2">
                <a href="/blog" className="hover:text-blue-400 transition duration-300">Blog</a>
              </li>
              <li className="mb-2">
                <a href="/careers" className="hover:text-blue-400 transition duration-300">Careers</a>
              </li>
              <li className="mb-2">
                <a href="/contact" className="hover:text-blue-400 transition duration-300">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Resources</h3>
            <ul>
              <li className="mb-2">
                <a href="/faq" className="hover:text-blue-400 transition duration-300">FAQ</a>
              </li>
              <li className="mb-2">
                <a href="/support" className="hover:text-blue-400 transition duration-300">Support</a>
              </li>
              <li className="mb-2">
                <a href="/documentation" className="hover:text-blue-400 transition duration-300">Documentation</a>
              </li>
              <li className="mb-2">
                <a href="/tutorials" className="hover:text-blue-400 transition duration-300">Tutorials</a>
              </li>
              <li className="mb-2">
                <a href="/privacy" className="hover:text-blue-400 transition duration-300">Privacy Policy</a>
              </li>
              <li className="mb-2">
                <a href="/terms" className="hover:text-blue-400 transition duration-300">Terms of Service</a>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-white text-lg font-bold mb-4">Stay Updated</h3>
            <p className="mb-4">Subscribe to our newsletter for the latest updates.</p>
            <form className="mb-4">
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Your email" 
                  className="bg-gray-800 text-white px-3 py-2 w-full rounded-l outline-none border border-gray-700 focus:border-blue-400"
                />
                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-r transition duration-300"
                >
                  Subscribe
                </button>
              </div>
            </form>
            <div className="flex space-x-4">
              <a href="https://facebook.com" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <Facebook size={20} />
              </a>
              <a href="https://twitter.com" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <Twitter size={20} />
              </a>
              <a href="https://instagram.com" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <Instagram size={20} />
              </a>
              <a href="https://linkedin.com" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <Linkedin size={20} />
              </a>
              <a href="https://github.com" className="text-gray-400 hover:text-blue-400 transition duration-300">
                <GitHub size={20} />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800 mt-6">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p>&copy; {new Date().getFullYear()} Your Company. All rights reserved.</p>
            <div className="mt-2 md:mt-0">
              <a href="/privacy" className="text-gray-400 hover:text-blue-400 transition duration-300">Privacy</a>
              <span className="mx-2">|</span>
              <a href="/terms" className="text-gray-400 hover:text-blue-400 transition duration-300">Terms</a>
              <span className="mx-2">|</span>
              <a href="/cookies" className="text-gray-400 hover:text-blue-400 transition duration-300">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;