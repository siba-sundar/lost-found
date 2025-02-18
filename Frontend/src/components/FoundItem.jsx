import React, { useState } from 'react';

const FoundItemForm = () => {
    const [item_name, setItemName] = useState('');
    const [description, setDescription] = useState('');
    const [found_by, setFoundBy] = useState('');
    const [location, setLocation] = useState('');
    const [date_found, setDateFound] = useState('');
    const [time_found, setTimeFound] = useState('');
    const [images, setImages] = useState([]); // For storing images
    const [loading, setLoading] = useState(false);

    // Individual input handlers
    const handleItemNameChange = (e) => setItemName(e.target.value);
    const handleDescriptionChange = (e) => setDescription(e.target.value);
    const handleFoundByChange = (e) => setFoundBy(e.target.value);
    const handleLocationChange = (e) => setLocation(e.target.value);
    const handleDateFoundChange = (e) => setDateFound(e.target.value);
    const handleTimeFoundChange = (e) => setTimeFound(e.target.value);

    // Handle file input change for images
    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setImages(files); // Storing the selected images in the form data
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare form data for submission
        const data = new FormData();
        data.append('item_name', item_name);
        data.append('description', description);
        data.append('found_by', found_by);
        data.append('location', location);
        data.append('date_found', date_found);
        data.append('time_found', time_found);

        // Append images to form data
        images.forEach((image, index) => {
            data.append(`images[${index}]`, image);
        });

        try {
            setLoading(true);

            // Sending data to backend (e.g., using fetch)
            const response = await fetch('/your-backend-endpoint', {
                method: 'POST',
                body: data,  // Send form data including images
            });

            setLoading(false);

            if (response.ok) {
                console.log('Form submitted successfully!');
            } else {
                console.error('Failed to submit form');
            }
        } catch (error) {
            setLoading(false);
            console.error('Error submitting form:', error);
        }
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
                            value={item_name}
                            onChange={handleItemNameChange}
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
                            value={description}
                            onChange={handleDescriptionChange}
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
                            value={found_by}
                            onChange={handleFoundByChange}
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
                            value={location}
                            onChange={handleLocationChange}
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
                            value={date_found}
                            onChange={handleDateFoundChange}
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
                            value={time_found}
                            onChange={handleTimeFoundChange}
                            required
                        />
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="images">
                            Upload Images
                        </label>
                        <input
                            type="file"
                            id="images"
                            name="images"
                            accept="image/*"
                            multiple
                            onChange={handleFileChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition duration-200"
                    >
                        {loading ? 'Submitting...' : 'Submit'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default FoundItemForm;
