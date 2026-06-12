const express = require('express');
const router = express.Router();

const grupoController =
    require('../controllers/grupoController');

// Cadastra um novo grupo
router.post(
    '/grupos',
    grupoController.cadastrarGrupo
);

module.exports = router;