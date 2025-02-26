import express from "express"
import { upload } from "../middlewares/multer.js";
import { authenticateToken } from "../middlewares/tokenAuth.js";

import { itemFound, acceptRequest, rejectRequest} from "../controllers/request.controller.js";

const itemRequestRoutes = express.Router();

itemRequestRoutes.post("")


itemRequestRoutes.post("/found", 
    authenticateToken, 
    upload.single('image'), 
    async (req, res, next) => {
        try {
            // Check for file
            if (!req.file) {
                return res.status(400).json({ 
                    success: false,
                    message: 'No image file uploaded' 
                });
            }

            // Add file path to request body
            req.body.imagePath = req.file.path;
            
            // Forward to controller
            await itemFound(req, res);
        } catch (error) {
            // Clean up uploaded file if exists
            if (req.file) {
                fs.unlinkSync(req.file.path);
            }
            
            next(error);
        }
    }
);


// itemRequestRoutes.post("/lost", authenticateToken, lostItem);
itemRequestRoutes.delete("/accept/:requestId", authenticateToken, acceptRequest);
itemRequestRoutes.delete("/reject/:request_id", authenticateToken,rejectRequest );

export default itemRequestRoutes;