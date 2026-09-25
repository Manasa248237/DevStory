import mongoose from "mongoose";

/**
 * Connect to MongoDB Atlas using Mongoose
 */
export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri || uri.includes("your_mongodb_atlas_connection_string")) {
    console.warn("⚠️  [MongoDB Warning] MONGODB_URI / MONGO_URI is not configured in server/.env");
    console.warn("👉 Please set a valid MongoDB Atlas connection string in server/.env to enable database operations.");
    return null;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ [MongoDB Atlas] Connected successfully: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB Atlas Error] Connection failed: ${error.message}`);
    return null;
  }
};

/**
 * Helper to get the current MongoDB connection state string
 * readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
 */
export const getDatabaseStatus = () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri || uri.includes("your_mongodb_atlas_connection_string")) {
    return "not_configured";
  }

  const states = {
    0: "disconnected",
    1: "connected",
    2: "connecting",
    3: "disconnecting",
  };

  return states[mongoose.connection.readyState] || "unknown";
};

export default connectDB;
