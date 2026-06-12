const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "js");

for (const file of fs.readdirSync(dir)) {
    if (!file.endsWith(".js") || file === "config.js") {
        continue;
    }

    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, "utf8");

    content = content.replace(
        /"(\$\{API_URL\}[^"]*)"/g,
        "`$1`"
    );

    content = content.replace(
        /"(\$\{API_URL\}[^"]*)" \+/g,
        "`$1` +"
    );

    fs.writeFileSync(filePath, content);
    console.log("fixed quotes in", file);
}
