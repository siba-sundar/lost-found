import express from 'express'
import { authenticateToken } from '../middlewares/tokenAuth';

const itemRoutes = express.Router();

itemRoutes.get('/items', getItems);
itemRoutes.post('/add',authenticateToken, addItem);
itemRoutes.delete('/delete',authenticateToken,deleteItem);
itemRoutes.put('/edit',authenticateToken,editItem);
