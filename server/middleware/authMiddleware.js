import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * Protect routes - Verifies JWT token and attaches user object to req
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication required. Please provide a valid Bearer token.",
      });
    }

    // Verify token
    const secret = process.env.JWT_SECRET || "dev_secret_key_change_in_production";
    const decoded = jwt.verify(token, secret);

    // Fetch user without password
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User associated with this token no longer exists.",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Authentication token has expired. Please sign in again.",
      });
    }

    return res.status(401).json({
      success: false,
      message: "Invalid or malformed authentication token.",
    });
  }
};

/**
 * Admin authorization guard - Checks if user has admin role
 */
export const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      success: false,
      message: "Forbidden: Administrative privileges required to access this resource.",
    });
  }
};
