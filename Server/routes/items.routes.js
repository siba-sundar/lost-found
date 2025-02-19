import express from 'express'
import { addItem } from '../controllers/item.controller.js';
import { authenticateToken } from '../middlewares/tokenAuth.js';

const itemRoutes = express.Router();

// itemRoutes.get('/items', getItems);
itemRoutes.post('/add',authenticateToken, addItem);
// itemRoutes.delete('/delete',authenticateToken,deleteItem);
// itemRoutes.put('/edit',authenticateToken,editItem);



export default  itemRoutes