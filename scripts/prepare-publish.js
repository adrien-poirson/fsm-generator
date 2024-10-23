const fs = require("fs");
const path = require("path");

const distPath = path.join(__dirname, "..", "dist");
const rootPath = path.join(__dirname, "..");

fs.readdirSync(distPath).forEach((file) => {
    if (file.endsWith(".js") || file.endsWith(".d.ts")) {
        fs.copyFileSync(path.join(distPath, file), path.join(rootPath, file));
    }
});
