const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "..", "dist");
const rootPath = path.join(__dirname, "..");

const filesToCopy = ["index.js", "index.d.ts"];

filesToCopy.forEach((file) => {
    fs.copyFileSync(path.join(distPath, file), path.join(rootPath, file));
});

console.log("Files copied successfully.");
