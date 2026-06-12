const express = require('express');
const path = require('path');

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

app.use(express.static(root));

app.get('/', (req, res) => {
    res.redirect('/pages/login.html');
});

app.listen(PORT, () => {
    console.log(`Frontend rodando na porta ${PORT}`);
});