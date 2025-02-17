import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pkg;

const pool = new Pool({
    user:process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

pool.on("error", (err) => {
    console.error("Unexpected error on idle client", err);
    process.exit(-1);
});

// Test the connection
pool.connect((err, client, done) => {
    if (err) {
        console.error("Error connecting to the database:", err.stack);
    } else {
        console.log("Successfully connected to database");
        done();
    }
});

export default pool;
