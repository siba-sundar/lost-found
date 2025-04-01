import express from "express";
import cors from "cors";
import pg from "pg";
import fs from "fs";  // To read the SQL file
import path from "path"; // To handle file paths
import env from "dotenv";
import pool from "./config/db.js"; // Assuming you have a pool defined in db.js
import { createTables } from "./config/startup.js";



import userRoutes from "./routes/auth.routes.js"
import errorHandling from "./middlewares/errorHandler.js";
import itemRoutes from "./routes/items.routes.js";
import itemRequestRoutes from "./routes/request.routes.js";

const app = express();
env.config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.use(errorHandling)
// createTables();


app.use("/api/auth", userRoutes);
app.use("/api/item", itemRoutes );
app.use("/api/request", itemRequestRoutes);

// Test PostgreSQL connection
app.get("/", async (req, res) => {
    try {
        const result = await pool.query("SELECT current_database()");
        res.send(`The database name is: ${result.rows[0].current_database}`);
    } catch (err) {
        console.error("Error fetching database:", err);
        res.status(500).send("An error occurred.");
    }
});

app.listen(port || 3000, () => {
    console.log(`Server running at port ${port}`);
});
