const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Get the full URL path
    let filePath = req.url || '/';

    // Remove query parameters
    filePath = filePath.split('?')[0];

    // If root, serve login.html
    if (filePath === '/') {
        filePath = '/pages/login.html';
    }

    // Remove leading slash for path.join
    if (filePath.startsWith('/')) {
        filePath = filePath.substring(1);
    }

    // Build full file path (relative to repo root)
    const fullPath = path.join(__dirname, '..', filePath);

    console.log([API] Requested: \, Resolved: \);

    try {
        if (fs.existsSync(fullPath)) {
            const stat = fs.statSync(fullPath);
            
            if (stat.isDirectory()) {
                res.status(404).json({ error: 'Not Found' });
                return;
            }

            const ext = path.extname(fullPath).toLowerCase();

            let contentType = 'text/plain';
            if (ext === '.html') contentType = 'text/html; charset=utf-8';
            else if (ext === '.js') contentType = 'application/javascript';
            else if (ext === '.css') contentType = 'text/css';
            else if (ext === '.json') contentType = 'application/json';
            else if (ext === '.png') contentType = 'image/png';
            else if (['.jpg', '.jpeg'].includes(ext)) contentType = 'image/jpeg';
            else if (ext === '.gif') contentType = 'image/gif';
            else if (ext === '.svg') contentType = 'image/svg+xml';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');

            const fileContent = fs.readFileSync(fullPath);
            res.status(200).send(fileContent);
            return;
        }
    } catch (e) {
        console.error([API] Error: \);
    }

    res.status(404).json({ error: 'File not found' });
};
