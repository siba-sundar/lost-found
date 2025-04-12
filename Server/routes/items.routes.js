import express from 'express'
import { upload } from '../middlewares/multer.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { addItem , deleteItem, getItemsList, editItem, singleItem, getDashboard, getUserItems} from '../controllers/item.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';

const itemRoutes = express.Router();

// itemRoutes.get('/items', getItems);
itemRoutes.post('/add', 
    authenticateToken,               // First check authentication
    upload.array('images', 3),       // Then handle up to 3 image uploads
    addItem                          // Finally process the request in the controller
);


itemRoutes.get("/items", authenticateToken, getItemsList);

itemRoutes.get('/single-item/:id', authenticateToken, singleItem);

itemRoutes.delete('/delete/:id',authenticateToken,deleteItem);
itemRoutes.get("/user-items", authenticateToken,getUserItems )
itemRoutes.get("/dash", authenticateToken, getDashboard)
// itemRoutes.put('/edit',authenticateToken,editItem);
itemRoutes.put('/edit/:id', authenticateToken, upload.array('images', 3), editItem);



export default  itemRoutes