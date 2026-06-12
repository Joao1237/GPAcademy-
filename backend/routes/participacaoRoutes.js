const express = require('express');
const router = express.Router();

const participacaoController =
    require('../controllers/participacaoController');

// Adiciona uma participação individual
router.post(
    '/participacoes',
    participacaoController.adicionarParticipacao
);

// Lista os projetos de um aluno
router.get(
    '/participacoes/aluno/:usuario_id',
    participacaoController.listarProjetosDoAluno
);

// Lista todas as participações
router.get(
    '/participacoes',
    participacaoController.listarParticipacoes
);

// Adiciona participantes em projetos de grupo
router.post(
    '/participacoes/grupo',
    participacaoController.adicionarParticipacoesGrupo
);

module.exports = router;