const express = require('express');
const router = express.Router();

const projetoController = require('../controllers/projetoController');

// Cadastrar projeto
router.post(
    '/projetos',
    projetoController.cadastrarProjeto
);

// Listar projetos
router.get(
    '/projetos',
    projetoController.listarProjetos
);

// Excluir projeto
router.delete(
    '/projetos/:id',
    projetoController.excluirProjeto
);

module.exports = router;