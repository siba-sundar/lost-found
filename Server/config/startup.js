import pool from "./db.js"

export const createTables = async () => {
    const userQueryText = `
    
CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    college_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number NUMERIC(15,0),
    email_id VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
   
);
    `;

    const authQueryTable = `
    -- Now create the authentication tables that reference users
CREATE TABLE IF NOT EXISTS auth_login (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    login_type VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, login_type)
);

CREATE TABLE IF NOT EXISTS email_password_auth (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    password VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id)
);

CREATE TABLE IF NOT EXISTS oauth_auth (
    user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    oauth_provider VARCHAR(50) NOT NULL,
    oauth_id VARCHAR(255) NOT NULL,
    PRIMARY KEY (user_id, oauth_provider)
);`

    try {
        await pool.query(userQueryText);
        console.log("User table created");
        await pool.query(authQueryTable);
        console.log("Auth tables created")
    } catch (error) {
        console.log("Error while creating user table : ", error);
    }




};

