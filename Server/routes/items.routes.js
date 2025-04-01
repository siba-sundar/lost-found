import express from 'express'
import { upload } from '../middlewares/multer.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { addItem , deleteItem, getItemsList, singleItem, getDashboard} from '../controllers/item.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';

const itemRoutes = express.Router();

// itemRoutes.get('/items', getItems);
itemRoutes.post('/add', authenticateToken, upload.single('image'), async (req, res) => {
    try {
        // Ensure a file is uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Upload the file to Cloudinary and get the URL
        const imageUrl = await uploadToCloudinary(req.file.path);

        // Create item data including the image URL
        const itemData = {
            ...req.body,
            imageUrl  // Store the Cloudinary URL of the image
        };

        // Call your addItem function to process the data
        const item = await addItem(itemData);

        // Send a success response
        res.status(200).json({ message: 'Item added successfully!', item });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to upload image or add item' });
    }
});


itemRoutes.get("/items", authenticateToken, getItemsList);

itemRoutes.get('/single-item/:id', authenticateToken, singleItem);

itemRoutes.delete('/delete/:id',authenticateToken,deleteItem);

itemRoutes.get("/dash", authenticateToken, getDashboard)
// itemRoutes.put('/edit',authenticateToken,editItem);



export default  itemRoutes