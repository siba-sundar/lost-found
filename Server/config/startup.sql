-- user details


CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    college_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone_number NUMERIC(15,0),
    email_id VARCHAR(255) UNIQUE NOT NULL,
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE auth_login (
    user_id INT REFERENCES users(user_id),
    login_type VARCHAR(50) NOT NULL,  -- e.g., 'email_password' or 'oauth'
    PRIMARY KEY (user_id, login_type)
);


CREATE TABLE email_password_auth (
    user_id INT REFERENCES users(user_id),
    password VARCHAR(255) NOT NULL,  -- Hashed password
    PRIMARY KEY (user_id)
);


CREATE TABLE oauth_auth (
    user_id INT REFERENCES users(user_id),
    oauth_provider VARCHAR(50) NOT NULL,  -- e.g., 'google'
    oauth_id VARCHAR(255) NOT NULL,       -- Unique ID from OAuth provider
    PRIMARY KEY (user_id, oauth_provider)
);
