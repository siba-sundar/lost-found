import pool from "../config/db.js"


export const passwordValidator = (password) => {
    // Check minimum length
    if (password.length < 8) {
        return {
            isValid: false,
            message: "Password must be at least 8 characters long"
        };
    }

    // Check for uppercase letter
    if (!/[A-Z]/.test(password)) {
        return {
            isValid: false,
            message: "Password must contain at least one uppercase letter"
        };
    }

    // Check for number
    if (!/\d/.test(password)) {
        return {
            isValid: false,
            message: "Password must contain at least one number"
        };
    }

    // All checks passed
    return {
        isValid: true,
        message: "Password is valid"
    };
};

export const emailValidator =
    (email) => {
        // Basic email regex pattern
        const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email) {
            return {
                isValid: false,
                message: "Email is required"
            };
        }

        if (!emailPattern.test(email)) {
            return {
                isValid: false,
                message: "Please enter a valid email address"
            };
        }

        return {
            isValid: true,
            message: "Email is valid"
        };
    };




export const userExist = (username, email) =>{
    const existResult = pool.query(
        "SELECT * FROM USER WHERE username = $1 OR email = $2", [username, email]
    )


    if (existResult.row.length != 0) {
        return { exist: true, }
    }else{
        return{exist : false}
    }
};