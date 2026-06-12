const entregaService = require('../services/entregaService');
const { responderServico } = require('../utils/handleServiceResult');

function cadastrarEntrega(req, res) {
    const dados = {
        usuario_id: req.body.usuario_id,
        projeto_id: req.body.projeto_id,
        grupo_id: req.body.grupo_id,
        arquivo: req.file ? req.file.filename : null
    };

    entregaService.cadastrarEntrega(dados, (erro, resultado) => {
        responderServico(res, erro, resultado, 201);
    });
}

function listarEntregas(req, res) {
    entregaService.listarEntregas((erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function listarEntregasPorProjeto(req, res) {
    entregaService.listarEntregasPorProjeto(
        req.params.projeto_id,
        (erro, resultado) => {
            responderServico(res, erro, resultado);
        }
    );
}

function listarEntregasGrupoPorProjeto(req, res) {
    entregaService.listarEntregasGrupoPorProjeto(
        req.params.projeto_id,
        (erro, resultado) => {
            responderServico(res, erro, resultado);
        }
    );
}

function salvarFeedback(req, res) {
    entregaService.salvarFeedback(req.body, (erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

module.exports = {
    cadastrarEntrega,
    listarEntregas,
    listarEntregasPorProjeto,
    listarEntregasGrupoPorProjeto,
    salvarFeedback
};
