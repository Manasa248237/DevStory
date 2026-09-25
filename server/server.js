import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables (.env in server directory or project root)
try {
  const { default: dotenv } = await import("dotenv");
  dotenv.config({ path: path.join(__dirname, ".env") });
  dotenv.config();
} catch (err) {
  // Graceful fallback if dotenv package is absent or running in cloud environments (Render, Railway, etc.)
  if (typeof process.loadEnvFile === "function") {
    try {
      process.loadEnvFile(path.join(__dirname, ".env"));
    } catch {}
    try {
      process.loadEnvFile();
    } catch {}
  }
}

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
