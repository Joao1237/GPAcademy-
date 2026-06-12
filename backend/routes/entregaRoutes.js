const express = require('express');
const router = express.Router();

const upload = require('../config/upload');
const entregaController = require('../controllers/entregaController');

// Envio de trabalho
router.post(
    '/entregas',
    upload.single('arquivo'),
    entregaController.cadastrarEntrega
);

// Salvar feedback do professor
router.put(
    '/entregas/feedback',
    entregaController.salvarFeedback
);

// Listar todas as entregas
router.get(
    '/entregas',
    entregaController.listarEntregas
);

// Listar entregas individuais de um projeto
router.get(
    '/entregas/projeto/:projeto_id',
    entregaController.listarEntregasPorProjeto
);

// Listar entregas em grupo de um projeto
router.get(
    '/entregas/grupo/projeto/:projeto_id',
    entregaController.listarEntregasGrupoPorProjeto
);

module.exports = router;