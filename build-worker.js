import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Build with pkg
console.log("📦 Building executable...");
execSync(
    "pkg src/node-backend-comp/node-worker.cjs --targets node18-win-x64 --output src/node-backend-dist/node-worker.exe",
    {
        stdio: "inherit",
    },
);

// Copy sharp's required folders
console.log("📁 Copying sharp binaries...");
const destDir = path.join(__dirname, "src", "node-backend-dist");

fs.copySync(
    path.join(__dirname, "node_modules", "sharp", "build"),
    path.join(destDir, "sharp", "build"),
);

fs.copySync(
    path.join(__dirname, "node_modules", "sharp", "vendor"),
    path.join(destDir, "sharp", "vendor"),
);

console.log("✅ Build complete!");
console.log("📂 Dist folder contents:");
execSync(`dir ${destDir}`, { stdio: "inherit" });
