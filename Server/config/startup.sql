-- user details


CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    college_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number NUMERIC(15,0),
    email_id VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS auth_login (
    user_id INT REFERENCES users(user_id),
    login_type VARCHAR(50) NOT NULL,  -- e.g., 'email_password' or 'oauth'
    PRIMARY KEY (user_id, login_type)
);


CREATE TABLE IF NOT EXISTS email_password_auth (
    user_id INT REFERENCES users(user_id),
    password VARCHAR(255) NOT NULL,  -- Hashed password
    PRIMARY KEY (user_id)
);


CREATE TABLE IF NOT EXISTS oauth_auth (
    user_id INT REFERENCES users(user_id),
    oauth_provider VARCHAR(50) NOT NULL,  -- e.g., 'google'
    oauth_id VARCHAR(255) NOT NULL,       -- Unique ID from OAuth provider
    PRIMARY KEY (user_id, oauth_provider)
);



-- items table 

CREATE TABLE IF NOT EXISTS lost_items(
    item_id SERIAL PRIMARY KEY, 
    item_name VARCHAR(100) NOT NULL, 
    description TEXT    
)


CREATE TABLE IF NOT EXISTS items (
    item_id SERIAL PRIMARY KEY,
    item_name VARCHAR(255) NOT NULL,
    description TEXT,
    found_by INT REFERENCES users(email_id) DEFAULT NULL,
    lost_by INT REFERENCES users(email_id) DEFAULT NULL, 
    location VARCHAR(255),
    date_found DATE,
    time_found TIME,
    time_entered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(10) CHECK (status IN ('found', 'lost', 'clear')) DEFAULT 'found'
);

