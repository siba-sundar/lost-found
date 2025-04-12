import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../utils/AuthContext';

const ItemListing = () => {
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  
  // State for items and pagination
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });
  
  // State for filters - added sortBy
  const [filters, setFilters] = useState({
    status: '',
    location: '',
    search: '',
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest' // default sort option
  });
  
  // State for showing filter panel
  const [showFilters, setShowFilters] = useState(false);

  // Fetch items on component mount and when filters or pagination changes
  useEffect(() => {
    fetchItems();
  }, [pagination.currentPage, filters]);

  // Function to fetch items
  const fetchItems = async () => {
    setLoading(true);
    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 10 // Fixed limit of 10 items per page
      });
      
      // Add filters to params if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
      
      // Make API request
      const response = await axios.get(`http://localhost:4001/api/item/items?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('accessToken')}`
        }
      });
      
      if (response.data.success) {
        setItems(response.data.items);
        setPagination(response.data.pagination);
      } else {
        setError('Failed to fetch items');
      }
    } catch (err) {
      console.error('Error fetching items:', err);
      setError('Error fetching items. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Handle item click to navigate to details
  const handleItemClick = (item) => {
    navigate(`/item/${item.item_id}`, { state: { item } });
  };

  // Handle filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      status: '',
      location: '',
      search: '',
      dateFrom: '',
      dateTo: '',
      sortBy: 'newest' // Reset to default sort
    });
  };

  // Format date to be more readable
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Handle page navigation
  const goToPage = (page) => {
    setPagination(prev => ({ ...prev, currentPage: page }));
  };

  // If not authenticated, redirect to login
  useEffect(() => {
    if (!isAuthenticated && !loading) {
      navigate('/login', { state: { from: '/items' } });
    }
  }, [isAuthenticated, loading]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with filter toggle */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Items Listing</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="bg-gray-900 p-4 rounded-lg mb-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Status</label>
                <select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="">All Status</option>
                  <option value="found">Found</option>
                  <option value="lost">Lost</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Filter by location"
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Search</label>
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search items..."
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date From</label>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Date To</label>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                />
              </div>
              
              {/* Added Sort By dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Sort By</label>
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="found_first">Found Items First</option>
                  <option value="lost_first">Lost Items First</option>
                  <option value="a_to_z">A to Z</option>
                  <option value="z_to_a">Z to A</option>
                </select>
              </div>
              
              <div className="flex items-end md:col-span-3">
                <button
                  onClick={clearFilters}
                  className="w-full md:w-auto bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-lg"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Quick sort for mobile (always visible) */}
        <div className="mb-6">
          <div className="flex items-center">
            <label className="text-sm font-medium text-gray-400 mr-2">Sort:</label>
            <select
              name="sortBy"
              value={filters.sortBy}
              onChange={handleFilterChange}
              className="bg-gray-800 text-white rounded-lg p-2 border border-gray-700 focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 text-sm"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="found_first">Found Items First</option>
              <option value="lost_first">Lost Items First</option>
              <option value="a_to_z">A to Z</option>
              <option value="z_to_a">Z to A</option>
            </select>
          </div>
        </div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="bg-red-900 bg-opacity-20 border border-red-500 text-red-400 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}
        
        {/* No items message */}
        {!loading && !error && items.length === 0 && (
          <div className="bg-gray-900 rounded-lg p-12 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="text-xl font-medium text-gray-400">No items found</h3>
            <p className="text-gray-500 mt-2">Try adjusting your filters or check back later</p>
          </div>
        )}
        
        {/* Items grid */}
        {!loading && !error && items.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map(item => (
              <div 
                key={item.item_id} 
                className="bg-gray-900 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                {/* Item image */}
                <div className="h-48 overflow-hidden bg-gray-800">
                  {item.images && item.images.length > 0 ? (
                    <img 
                      src={item.images[0]?.image_url || item.primary_image_url} 
                      alt={item.item_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-600">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Item details */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold line-clamp-1">{item.item_name}</h3>
                    <span className={`text-xs uppercase font-bold px-2 py-1 rounded ${
                      item.status === 'found' ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-sm line-clamp-2 mb-3">{item.description}</p>
                  
                  <div className="text-xs text-gray-500 flex justify-between">
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {item.location}
                    </div>
                    <div className="flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {formatDate(item.date_found || item.time_entered)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Pagination */}
        {!loading && !error && pagination.totalPages > 0 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-2">
              <button
                onClick={() => goToPage(1)}
                disabled={!pagination.hasPreviousPage}
                className={`px-3 py-1 rounded ${
                  pagination.hasPreviousPage ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-700 cursor-not-allowed'
                }`}
              >
                First
              </button>
              
              <button
                onClick={() => goToPage(pagination.currentPage - 1)}
                disabled={!pagination.hasPreviousPage}
                className={`px-3 py-1 rounded ${
                  pagination.hasPreviousPage ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-700 cursor-not-allowed'
                }`}
              >
                &laquo;
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                // Logic to show current page and pages around it
                let pageNum;
                if (pagination.totalPages <= 5) {
                  pageNum = i + 1;
                } else {
                  const middlePage = Math.min(
                    Math.max(pagination.currentPage, 3),
                    pagination.totalPages - 2
                  );
                  pageNum = middlePage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => goToPage(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded ${
                      pageNum === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-800 hover:bg-gray-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => goToPage(pagination.currentPage + 1)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1 rounded ${
                  pagination.hasNextPage ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-700 cursor-not-allowed'
                }`}
              >
                &raquo;
              </button>
              
              <button
                onClick={() => goToPage(pagination.totalPages)}
                disabled={!pagination.hasNextPage}
                className={`px-3 py-1 rounded ${
                  pagination.hasNextPage ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-900 text-gray-700 cursor-not-allowed'
                }`}
              >
                Last
              </button>
            </div>
          </div>
        )}
        
        {/* Pagination info */}
        {!loading && !error && items.length > 0 && (
          <div className="mt-4 text-center text-sm text-gray-500">
            Showing {(pagination.currentPage - 1) * 10 + 1} to {Math.min(pagination.currentPage * 10, pagination.total)} of {pagination.total} items
          </div>
        )}
      </div>
    </div>
  );
};

export default ItemListing;