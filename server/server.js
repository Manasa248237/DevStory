import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Zero-dependency environment loader (avoids ERR_MODULE_NOT_FOUND on Render / cloud hosts)
// Loads local .env if present using native Node.js features, without requiring any external packages
const loadEnvironment = () => {
  const candidatePaths = [
    path.join(__dirname, ".env"),
    path.join(process.cwd(), ".env"),
    path.join(process.cwd(), "server", ".env"),
  ];

  for (const envPath of candidatePaths) {
    if (fs.existsSync(envPath)) {
      try {
        if (typeof process.loadEnvFile === "function") {
          process.loadEnvFile(envPath);
        } else {
          // Native fallback parser for Node < 20.6
          const content = fs.readFileSync(envPath, "utf-8");
          for (const line of content.split(/\r?\n/)) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith("#")) continue;
            const eqIndex = trimmed.indexOf("=");
            if (eqIndex > 0) {
              const key = trimmed.slice(0, eqIndex).trim();
              let val = trimmed.slice(eqIndex + 1).trim();
              if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
                val = val.slice(1, -1);
              }
              if (!process.env[key]) {
                process.env[key] = val;
              }
            }
          }
        }
      } catch (err) {
        // Silently skip if local env file cannot be read
      }
    }
  }
};

loadEnvironment();

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
