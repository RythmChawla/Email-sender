const bcrypt = require("bcrypt");
const UserModel = require("../Models/Users");
const jwt = require("jsonwebtoken");
const crypto = require("crypto"); // To create a refresh token
// const RefreshToken = require("../Models/RefreshToken"); // Import the refresh token model

// Helper function to create a refresh token
const createRefreshToken = (userId) => {
  return crypto.randomBytes(40).toString("hex"); // Generate a random string for the refresh token
};

// Signup method (no changes needed here)
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
      return res.status(409).json({
        message: "User already registered, you can login directly.",
        success: false,
      });
    }
    const userModel = new UserModel({ name, email, password });
    userModel.password = await bcrypt.hash(password, 10);
    await userModel.save();
    res.status(201).json({ message: "Signup successfully", success: true });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

// Login method (with refresh token)
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    const errorMessage = "Auth failed, email or password is wrong";

    if (!user) {
      return res.status(403).json({
        message: errorMessage,
        success: false,
      });
    }

    const isPasswordEqual = await bcrypt.compare(password, user.password);
    if (!isPasswordEqual) {
      return res.status(403).json({
        message: errorMessage,
        success: false,
      });
    }

    // Create JWT token
    const jwtToken = jwt.sign(
      { email: user.email, _id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(200).json({
      message: "Login successful",
      success: true,
      jwtToken,
      email,
      name: user.name,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", success: false });
  }
};

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    return res.status(403).json({ message: "No token provided", success: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Token expired or invalid", success: false });
    }
    req.user = decoded; 
    next();
  });
};

module.exports = {
  signup,
  login,
  verifyToken
};
