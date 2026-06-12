const projetoService = require('../services/projetoService');
const { responderServico } = require('../utils/handleServiceResult');

function cadastrarProjeto(req, res) {
    projetoService.cadastrarProjeto(req.body, (erro, resultado) => {
        responderServico(res, erro, resultado, 201);
    });
}

function listarProjetos(req, res) {
    projetoService.listarProjetos((erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function excluirProjeto(req, res) {
    projetoService.excluirProjeto(req.params.id, (erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

module.exports = {
    cadastrarProjeto,
    listarProjetos,
    excluirProjeto
};
