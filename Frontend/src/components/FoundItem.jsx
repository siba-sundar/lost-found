import React, { useState } from 'react';

const FoundItemForm = () => {
    const [formData, setFormData] = useState({
        item_name: '',
        description: '',
        found_by: '',
        location: '',
        date_found: '',
        time_found: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form data:', formData);
        // Send the formData to the backend using fetch or axios
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full">
                <h2 className="text-2xl font-semibold text-center mb-6">Add Found Item</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="item_name">
                            Item Name
                        </label>
                        <input
                            type="text"
                            id="item_name"
                            name="item_name"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={formData.item_name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={formData.description}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="found_by">
                            Found By (User ID)
                        </label>
                        <input
                            type="number"
                            id="found_by"
                            name="found_by"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={formData.found_by}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={formData.location}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date_found">
                            Date Found
                        </label>
                        <input
                            type="date"
                            id="date_found"
                            name="date_found"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={formData.date_found}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time_found">
                            Time Found
                        </label>
                        <input
                            type="time"
                            id="time_found"
                            name="time_found"
                            className="w-full px-3 py-2 border rounded-lg text-gray-700"
                            value={formData.time_found}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        Submit
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FoundItemForm;
