const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const express = require('express');
const cors = require('cors');

require('./config/db');

const usuarioRoutes = require('./routes/usuarioRoutes');
const cursoRoutes = require('./routes/cursoRoutes');
const projetoRoutes = require('./routes/projetoRoutes');
const participacaoRoutes = require('./routes/participacaoRoutes');
const professorCursoRoutes = require('./routes/professorCursoRoutes');
const entregaRoutes = require('./routes/entregaRoutes');
const grupoRoutes = require('./routes/grupoRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

const origensPermitidas = process.env.FRONTEND_URL ?
    process.env.FRONTEND_URL.split(',').map(url => url.trim()) :
    true;

app.use(cors({
    origin: origensPermitidas,
    credentials: true
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('GPAcademy API funcionando!');
});

app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.use(usuarioRoutes);
app.use(cursoRoutes);
app.use(projetoRoutes);
app.use(participacaoRoutes);
app.use(professorCursoRoutes);
app.use(entregaRoutes);
app.use(grupoRoutes);

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});