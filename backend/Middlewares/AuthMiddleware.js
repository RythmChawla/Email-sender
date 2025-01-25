const jwt = require("jsonwebtoken");
const User = require("../Models/Users");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied. No token provided.", success: false });
  }

  try {
    // Verify the JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Find the user by ID (extracted from the token)
    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Attach the user object to the request for downstream use
    req.user = user;

    next(); // Pass control to the next middleware or route handler
  } catch (error) {
    console.error("Error verifying token:", error.message);

    // Handle different JWT verification errors
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token has expired" });
    }

    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }

    // Generic fallback for any other errors
    res.status(401).json({ message: "Unauthorized" });
  }
};

module.exports = { authMiddleware };
