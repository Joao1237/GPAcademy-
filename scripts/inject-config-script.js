const fs = require("fs");
const path = require("path");

const pagesDir = path.join(__dirname, "..", "pages");
const configTag = '<script src="../js/config.js"></script>';

for (const file of fs.readdirSync(pagesDir)) {
    if (!file.endsWith(".html")) {
        continue;
    }

    const filePath = path.join(pagesDir, file);
    let content = fs.readFileSync(filePath, "utf8");

    if (content.includes(configTag)) {
        console.log("skip", file);
        continue;
    }

    content = content.replace(
        /<script src="\.\.\/js\/responsive\.js"><\/script>/,
        `${configTag}\n    <script src="../js/responsive.js"></script>`
    );

    fs.writeFileSync(filePath, content);
    console.log("updated", file);
}
