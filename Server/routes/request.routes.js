import express from "express"
import { upload } from "../middlewares/multer";
import { authenticateToken } from "../middlewares/tokenAuth";

import { itemFound } from "../controllers/request.controller.js";

const itemRequestRoutes = Router();

itemRequestRoutes.post("")

// Using the upload middleware with your route
itemRequestRoutes.post("/found", authenticateToken, upload.single('image'), async (req, res) => {
    try {
        // Ensure that the file was uploaded
        if (!req.file) {
            return res.status(400).json({ error: 'No image file uploaded' });
        }

        // Add the image path to the request body
        req.body.imagePath = req.file.path;

        // Call itemFound function
        await itemFound(req, res);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to process the request' });
    }
});



// itemRequestRoutes.post("/lost", authenticateToken, lostItem);
itemRequestRoutes.delete("/accept", authenticateToken, acceptRequest);
// itemRequestRoutes.delete("/reject", authenticateToken,rejectRequest )

export default itemRequestRoutes;