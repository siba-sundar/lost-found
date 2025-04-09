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

    CREATE TABLE IF NOT EXISTS admin (
        user_id SERIAL PRIMARY KEY,
        college_id VARCHAR(255) NOT NULL,
        name VARCHAR(255) NOT NULL,
        phone_number NUMERIC(15,0),
        email_id VARCHAR(255) UNIQUE NOT NULL,
        profile_picture TEXT,
        position VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        
    );


    CREATE TABLE IF NOT EXISTS auth_login (
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        login_type VARCHAR(50) NOT NULL,  -- e.g., 'email_password' or 'oauth'
        PRIMARY KEY (user_id, login_type)
    );


    CREATE TABLE IF NOT EXISTS email_password_auth (
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        password VARCHAR(255) NOT NULL,  -- Hashed password
        PRIMARY KEY (user_id)
    );


    CREATE TABLE IF NOT EXISTS oauth_auth (
        user_id INT REFERENCES users(user_id) ON DELETE CASCADE,
        oauth_provider VARCHAR(50) NOT NULL,  -- e.g., 'google'
        oauth_id VARCHAR(255) NOT NULL,       -- Unique ID from OAuth provider
        PRIMARY KEY (user_id, oauth_provider)
    );





    -- Table for storing item details (general information about an item)
    CREATE TABLE IF NOT EXISTS items (
        item_id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        found_by INT REFERENCES users(user_id) DEFAULT NULL,
        lost_by INT REFERENCES users(user_id) DEFAULT NULL, 
        location VARCHAR(255),
        date_found DATE,
        time_found TIME,
        time_entered TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status VARCHAR(10) CHECK (status IN ('found', 'lost', 'clear')) DEFAULT 'found'
    );

    -- Table for storing images associated with an item
    CREATE TABLE IF NOT EXISTS item_images (
        image_id SERIAL PRIMARY KEY,      -- Unique ID for the image
        item_id INT REFERENCES items(item_id) ON DELETE CASCADE,  -- Link to items table
        image_url VARCHAR(255) NOT NULL,  -- URL of the image (Cloudinary or other storage service)
        time_entered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );




    -- found request tabel 
    CREATE TABLE IF NOT EXISTS item_found(
    request_id SERIAL PRIMARY KEY,
        item_name VARCHAR(255) NOT NULL,
        description TEXT,
        found_by INT REFERENCES users(user_id) DEFAULT NULL,
        location VARCHAR(255),
        date_found DATE,
        time_found TIME,
        file_path TEXT,
        time_entered TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        
    )



-- Add these to your createTables function in db.js

-- Table for storing chat connections between users
CREATE TABLE IF NOT EXISTS chats (
    chat_id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(item_id) ON DELETE CASCADE,
    user_one INT REFERENCES users(user_id) ON DELETE CASCADE,
    user_two INT REFERENCES users(user_id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) CHECK (status IN ('pending', 'active', 'blocked', 'closed')) DEFAULT 'pending',
    UNIQUE(item_id, user_one, user_two)
);

-- Table for storing individual messages
CREATE TABLE IF NOT EXISTS messages (
    message_id SERIAL PRIMARY KEY,
    chat_id INT REFERENCES chats(chat_id) ON DELETE CASCADE,
    sender_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table for tracking chat requests
CREATE TABLE IF NOT EXISTS chat_requests (
    request_id SERIAL PRIMARY KEY,
    item_id INT REFERENCES items(item_id) ON DELETE CASCADE,
    requester_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    responder_id INT REFERENCES users(user_id) ON DELETE CASCADE,
    request_message TEXT,
    status VARCHAR(20) CHECK (status IN ('pending', 'accepted', 'declined')) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

