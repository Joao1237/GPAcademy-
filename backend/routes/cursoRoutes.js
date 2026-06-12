const express = require('express');
const router = express.Router();

const cursoController = require('../controllers/cursoController');

// Cadastrar curso
router.post(
    '/cursos',
    cursoController.cadastrarCurso
);

// Listar cursos
router.get(
    '/cursos',
    cursoController.listarCursos
);

module.exports = router;