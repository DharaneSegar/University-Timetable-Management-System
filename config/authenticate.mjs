import dotenv from "dotenv";
import jwt from "jsonwebtoken";

// Set up JWT secret key
dotenv.config();
const JWT = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  // Get the token from the request headers
  let token = req.headers.authorization;

  if (token && token.startsWith("Bearer")) {
    token = token.split(" ")[1];
  }

  // Check if token is provided
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided." });
  }

  try {
    // Verify the token
    const decoded = jwt.verify(token, JWT);

    // Attach the decoded user information to the request object
    req.user = decoded;

    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
};

export default authenticate;
