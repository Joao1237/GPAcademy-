const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "js");

for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js") || file === "config.js") {
        continue;
    }

    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, "utf8");
    const updated = content.replace(/http:\/\/localhost:3000/g, "${API_URL}");

    if (updated !== content) {
        fs.writeFileSync(filePath, updated);
        console.log("updated", file);
    }
}
