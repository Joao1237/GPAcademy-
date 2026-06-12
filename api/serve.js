const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
    // Remova /api/serve do caminho para servir arquivos
    let filePath = req.url.replace(/^\/api\/serve/, '');
    if (!filePath || filePath === '/') {
        filePath = '/pages/login.html';
    }

    // Resolva o caminho do arquivo
    const fullPath = path.join(__dirname, '..', filePath);

    // Segurança: evite path traversal
    if (!fullPath.startsWith(path.join(__dirname, '..'))) {
        res.status(403).send('Forbidden');
        return;
    }

    // Tente servir o arquivo
    fs.readFile(fullPath, (err, data) => {
        if (err) {
            res.status(404).send('Not Found');
            return;
        }

        // Determine o Content-Type
        const ext = path.extname(filePath).toLowerCase();
        const contentTypes = {
            '.html': 'text/html; charset=utf-8',
            '.js': 'application/javascript',
            '.css': 'text/css',
            '.json': 'application/json',
            '.png': 'image/png',
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.gif': 'image/gif',
            '.svg': 'image/svg+xml',
            '.woff': 'font/woff',
            '.woff2': 'font/woff2',
            '.ttf': 'font/ttf'
        };

        const contentType = contentTypes[ext] || 'application/octet-stream';
        res.setHeader('Content-Type', contentType);
        res.send(data);
    });
};