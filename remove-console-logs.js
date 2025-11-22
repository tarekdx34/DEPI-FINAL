// remove-console-logs.js
// Run this script with: node remove-console-logs.js

const fs = require("fs");
const path = require("path");

// Configuration
const directories = ["src"]; // Add more directories if needed
const fileExtensions = [".ts", ".tsx", ".js", ".jsx"];

let filesProcessed = 0;
let consolesRemoved = 0;

function shouldProcessFile(filename) {
  return fileExtensions.some((ext) => filename.endsWith(ext));
}

function removeConsoleLogs(content) {
  let modified = content;
  let count = 0;

  // Pattern to match console statements (including multiline)
  // This pattern is more careful to match complete statements
  const consolePattern =
    /console\.(log|warn|error|info|debug|table|alert)\s*\([^;]*?\);?\s*\n?/g;

  const matches = modified.match(consolePattern) || [];
  count = matches.length;

  if (count > 0) {
    modified = modified.replace(consolePattern, "");
  }

  return { modified, count };
}

function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    const { modified, count } = removeConsoleLogs(content);

    if (count > 0) {
      fs.writeFileSync(filePath, modified, "utf8");
      console.log(`✅ ${filePath}: Removed ${count} console statement(s)`);
      consolesRemoved += count;
    }

    filesProcessed++;
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
  }
}

function processDirectory(dirPath) {
  try {
    const items = fs.readdirSync(dirPath);

    items.forEach((item) => {
      const fullPath = path.join(dirPath, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        // Skip node_modules and build directories
        if (item !== "node_modules" && item !== "dist" && item !== "build") {
          processDirectory(fullPath);
        }
      } else if (stat.isFile() && shouldProcessFile(item)) {
        processFile(fullPath);
      }
    });
  } catch (error) {
    console.error(`❌ Error processing directory ${dirPath}:`, error.message);
  }
}

// Main execution
console.log("🚀 Starting console.log removal...\n");

directories.forEach((dir) => {
  if (fs.existsSync(dir)) {
    console.log(`📁 Processing directory: ${dir}`);
    processDirectory(dir);
  } else {
    console.log(`⚠️  Directory not found: ${dir}`);
  }
});

console.log("\n✨ Done!");
console.log(`📊 Files processed: ${filesProcessed}`);
console.log(`🗑️  Console statements removed: ${consolesRemoved}`);
