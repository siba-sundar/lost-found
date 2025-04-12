import axios from "axios";
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const ItemsDashboard = () => {
    const [data, setData] = useState({ foundItems: [], lostItems: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const accessToken = sessionStorage.getItem('accessToken');
                
                // Fixed Axios request handling
                const response = await axios.get('http://localhost:4001/api/item/dash', {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    }
                });

                // With Axios, the response data is in response.data, not requiring .json()
                setData(response.data);
                console.log(response.data);
                setLoading(false);
            } catch (err) {
                setError(err.message || 'An error occurred');
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Format date to be more readable
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handleCardClick = (item) => {
        navigate(`/user/item/${item.item_id}`, { state: { item } });
      };

    // Item card component for both found and lost items
    const ItemCard = ({ item }) => (
        <div 
            className="bg-[#171717] rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-lg hover:scale-105 flex cursor-pointer"
            onClick={() => handleCardClick(item)}  
        >
            <div className="relative h-40 bg-gray-200">
                {item.images && item.images.length > 0 ? (
                    <img
                        src={item.images[0]}
                        alt={item.item_name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-white">
                        No image available
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-white mb-1 truncate">{item.item_name}</h3>
                <p className="text-sm text-white mb-2 truncate">{item.location}</p>
                <p className="text-xs text-white">
                    {formatDate(item.date_found || item.time_entered)}
                </p>
            </div>
        </div>
    );

    // Section component for both Found and Lost sections
    const Section = ({ title, items, color }) => (
        <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${color}`}>{title}</h2>
                <Link to="/user/list" className="text-white hover:text-blue-800 text-sm font-medium">
                    View All
                </Link>
            </div>

            {items.length === 0 ? (
                <div className="bg-black rounded-lg p-8 text-center">
                    <p className="text-white">No {title.toLowerCase()} items to display</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {items.map(item => (
                        <ItemCard key={item.item_id} item={item} />
                    ))}
                </div>
            )}
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                <p>Error: {error}</p>
                <button
                    className="mt-2 bg-red-100 hover:bg-red-200 text-red-800 font-medium py-1 px-3 rounded-md text-sm"
                    onClick={() => window.location.reload()}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="mx-auto px-4 py-8 min-h-screen bg-[#0a0a0a]">
            <h1 className="text-2xl font-bold text-white mb-6">Lost & Found Dashboard</h1>

            <Section
                title="Recently Found Items"
                items={data.foundItems}
                color="text-white"
            />

            <Section
                title="Recently Lost Items"
                items={data.lostItems}
                color="text-white"
            />
        </div>
    );
};

export default ItemsDashboard;