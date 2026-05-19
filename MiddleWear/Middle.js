import jwt from "jsonwebtoken";
import 'dotenv/config';

 export const authenticateToken = (req, res, next) => {
    // 1. Get the token from the Authorization header
    const authHeader = req.headers['authorization'];
    
    // The header format is usually: "Bearer <token>"
    // We split by the space and take the second element (the token)
    const token = authHeader && authHeader.split(' ')[1];

    // If there is no token, return an Unauthorized status
    if (!token) {
        return res.status(401).json({ message: 'Access Token Required' });
    }

    // 2. Verify the token
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            // If token is expired or invalid
            return res.status(403).json({ message: 'Invalid or Expired Token' });
        }

        // 3. Extract user data and attach it to the request object
        // 'decodedUser' contains whatever payload you originally signed (e.g., id, email, role)
        req.user = decodedUser; 

        // Move to the next middleware or route handler
        next(); 
    });
};

export const isAdmin = (req, res, next) => {
    // 1. Ensure req.user and req.user.user exist (to avoid undefined crashes)
    if (!req.user || !req.user.user) {
        return res.status(401).json({ message: "Unauthorized. Please log in first." });
    }

    // 2. Check if the user's role equals 'admin'
    if (req.user.user.role === 'admin') {
        next(); // User is an admin, let them proceed to the book action!
    } else {
        // 3. If they are a 'user', block them with a 403 Forbidden status
        return res.status(403).json({ 
            status: "fail", 
            message: "Access denied. Admin privileges required." 
        });
    }
};