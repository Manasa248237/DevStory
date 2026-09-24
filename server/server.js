import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

// Initialize Database Connection and Start HTTP Server
const startServer = async () => {
  // Connect to MongoDB Atlas
  await connectDB();

  app.listen(PORT, () => {
    console.log(`=================================================`);
    console.log(`🚀 DevStory API Server is running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`📡 Health Check URL: http://localhost:${PORT}/api/health`);
    console.log(`=================================================`);
  });
};

startServer();
