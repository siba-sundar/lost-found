import express from "express";
import cors from "cors";
import pg from "pg";
import fs from "fs";  // To read the SQL file
import path from "path"; // To handle file paths
import env from "dotenv";
import pool from "./config/db.js"; // Assuming you have a pool defined in db.js



import userRoutes from "./routes/userRoutes.js"
import errorHandling from "./middlewares/errorHandler.js";

const app = express();
env.config();

app.use(express.json());
app.use(cors());

const port = process.env.PORT;

app.use(errorHandling)
app.use("/api/users", userRoutes)

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
