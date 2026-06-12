const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Get the requested path
    let filePath = req.url;

    // Remove query parameters
    filePath = filePath.split('?')[0];

    // Default to login.html if accessing root
    if (filePath === '/' || filePath === '') {
        filePath = '/pages/login.html';
    }

    // Build full file path (relative to repo root)
    const fullPath = path.join(__dirname, '..', filePath);

    // Check if file exists
    try {
        if (fs.existsSync(fullPath)) {
            const ext = path.extname(fullPath);

            // Set appropriate content type
            let contentType = 'text/plain';
            if (ext === '.html') contentType = 'text/html; charset=utf-8';
            else if (ext === '.js') contentType = 'application/javascript';
            else if (ext === '.css') contentType = 'text/css';
            else if (ext === '.json') contentType = 'application/json';
            else if (ext === '.png') contentType = 'image/png';
            else if (ext === '.jpg' || ext === '.jpeg') contentType = 'image/jpeg';
            else if (ext === '.svg') contentType = 'image/svg+xml';

            res.setHeader('Content-Type', contentType);
            res.setHeader('Cache-Control', 'public, max-age=3600');

            const fileContent = fs.readFileSync(fullPath);
            return res.status(200).send(fileContent);
        }
    } catch (e) {
        // Ignore errors and fall through
    }

    // If not found, return 404
    res.status(404).send('Not Found');
};