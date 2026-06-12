const cursoService = require('../services/cursoService');
const { responderServico } = require('../utils/handleServiceResult');

function cadastrarCurso(req, res) {
    cursoService.cadastrarCurso(req.body, (erro, resultado) => {
        responderServico(res, erro, resultado, 201);
    });
}

function listarCursos(req, res) {
    cursoService.listarCursos((erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

module.exports = {
    cadastrarCurso,
    listarCursos
};
