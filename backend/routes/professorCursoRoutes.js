const express = require('express');
const router = express.Router();

const professorCursoController =
    require('../controllers/professorCursoController');

// Vincular professor a curso e período
router.post(
    '/professor-cursos',
    professorCursoController.vincularProfessorCurso
);

// Listar vínculos de um professor
router.get(
    '/professor-cursos/:professor_id',
    professorCursoController.listarVinculosProfessor
);

module.exports = router;