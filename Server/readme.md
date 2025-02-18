# User Management API

## Overview

This is the backend service for managing user authentication, registration, and details management. It supports both email/password and OAuth login methods and provides JWT authentication for protected routes.

## Tech Stack

- **Node.js**: Backend runtime
- **Express.js**: Web framework for building APIs
- **PostgreSQL**: Database for storing user details and authentication data
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Crypto**: For generating random usernames

## Endpoints

### Public Routes

1. **POST /users/login**
   - Logs in a user using email and password or OAuth credentials.
   - **Request Body**:
     ```json
     {
       "email": "user@example.com",
       "password": "user_password",
       "oauthProvider": "google", 
       "oauthId": "some_oauth_id"
     }
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "message": "Login successful",
       "user": {
         "userId": 1,
         "email": "user@example.com",
         "name": "John Doe"
       },
       "token": "JWT_TOKEN"
     }
     ```

2. **POST /users/signup**
   - Registers a new user using email/password or OAuth credentials.
   - **Request Body**:
     ```json
     {
       "email_id": "user@example.com",
       "name": "John Doe",
       "college_id": "12345",
       "phone_number": "1234567890",
       "profile_picture": "image_url",
       "password": "user_password",
       "oauthProvider": "google",
       "oauthId": "some_oauth_id"
     }
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "message": "User created successfully",
       "user": {
         "userId": 1,
         "email": "user@example.com",
         "name": "John Doe",
         "collegeId": "12345",
         "phoneNumber": "1234567890",
         "profilePicture": "image_url"
       },
       "token": "JWT_TOKEN"
     }
     ```

### Protected Routes

1. **PUT /users/edit**
   - Edits user details (email or username).
   - Requires authentication via JWT.
   - **Request Body**:
     ```json
     {
       "username": "new_username",
       "email": "new_email@example.com"
     }
     ```
   - **Response**:
     ```json
     {
       "success": true,
       "message": "User details updated successfully",
       "user": {
         "userId": 1,
         "name": "new_username",
         "email_id": "new_email@example.com"
       }
     }
     ```

2. **DELETE /users/delete**
   - Deletes the user.
   - Requires authentication via JWT.
   - **Response**:
     ```json
     {
       "success": true,
       "message": "User deleted successfully"
     }
     ```

## Authentication & Authorization

- **JWT Authentication**: Users must be authenticated with JWT tokens in protected routes.
  - Tokens are provided during login/signup and should be included in the `Authorization` header for subsequent requests.
  - The token is validated using the secret key stored in `JWT_SECRET`.
  
## Database Schema

- **Users Table**
  ```sql
  CREATE TABLE IF NOT EXISTS users (
    user_id SERIAL PRIMARY KEY,
    email_id VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    college_id VARCHAR(255) NOT NULL,
    phone_number NUMERIC(15,0),
    profile_picture TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  );
