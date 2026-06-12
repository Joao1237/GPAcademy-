const professorCursoService = require('../services/professorCursoService');
const { responderServico } = require('../utils/handleServiceResult');

function vincularProfessorCurso(req, res) {
    professorCursoService.vincularProfessorCurso(
        req.body,
        (erro, resultado) => {
            responderServico(res, erro, resultado, 201);
        }
    );
}

function listarVinculosProfessor(req, res) {
    professorCursoService.listarVinculosProfessor(
        req.params.professor_id,
        (erro, resultado) => {
            responderServico(res, erro, resultado);
        }
    );
}

module.exports = {
    vincularProfessorCurso,
    listarVinculosProfessor
};
