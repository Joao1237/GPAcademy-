const express = require('express');
const path = require('path');
const https = require('https');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5500;
const root = path.join(__dirname, '..');

app.get('/js/config.js', (req, res) => {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';

    res.type('application/javascript').send(
        `var API_URL = ${JSON.stringify(apiUrl.replace(/\/$/, ''))};`
    );
});

// Endpoint de health check para validar configuração
app.get('/api/health', (req, res) => {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';

    res.json({
        status: 'ok',
        frontend: {
            port: PORT,
            environment: process.env.NODE_ENV || 'development'
        },
        backend: {
            url: apiUrl,
            configured: !!process.env.API_URL
        }
    });
});

// Endpoint para validar conexão com o backend
app.get('/api/validate-backend', async(req, res) => {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';

    try {
        const protocol = apiUrl.startsWith('https') ? https : require('http');

        const result = await new Promise((resolve, reject) => {
            const request = protocol.get(`${apiUrl}/health`, { timeout: 5000 }, (response) => {
                let data = '';
                response.on('data', chunk => data += chunk);
                response.on('end', () => {
                    resolve({
                        status: response.statusCode,
                        backend: data ? JSON.parse(data) : null
                    });
                });
            });

            request.on('error', (error) => {
                reject(error);
            });
        });

        res.json({
            success: true,
            connection: 'ok',
            backend: result
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            error: 'Backend não está acessível',
            details: error.message,
            tried_url: apiUrl
        });
    }
});

app.use(express.static(root));

app.get('/', (req, res) => {
    res.redirect('/pages/login.html');
});

app.listen(PORT, () => {
    const apiUrl = process.env.API_URL || 'http://localhost:3000';
    console.log(`\n====================================`);
    console.log(`✓ Frontend rodando na porta ${PORT}`);
    console.log(`✓ API configurada: ${apiUrl}`);
    console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`====================================\n`);
});