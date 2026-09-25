import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const isWindows = process.platform === "win32";
const npmCmd = isWindows ? "npm.cmd" : "npm";

console.log("=================================================");
console.log("🚀 Starting DevStory Fullstack Development");
console.log("📡 Backend:  http://localhost:5000");
console.log("🌐 Frontend: http://localhost:5173");
console.log("=================================================\n");

const serverProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "server"),
  stdio: "inherit",
  shell: true,
});

const clientProcess = spawn(npmCmd, ["run", "dev"], {
  cwd: path.join(rootDir, "client"),
  stdio: "inherit",
  shell: true,
});

const cleanup = () => {
  try {
    serverProcess.kill();
  } catch {}
  try {
    clientProcess.kill();
  } catch {}
  process.exit(0);
};

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
process.on("exit", cleanup);
