const usuarioService = require('../services/usuarioService');
const { responderServico } = require('../utils/handleServiceResult');

function cadastrarUsuario(req, res) {
    usuarioService.cadastrarUsuario(req.body, (erro, resultado) => {
        responderServico(res, erro, resultado, 201);
    });
}

function login(req, res) {
    usuarioService.login(req.body, (erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function listarAlunosPorCursoPeriodo(req, res) {
    const { curso_id, periodo } = req.params;

    usuarioService.listarAlunosPorCursoPeriodo(
        curso_id,
        periodo,
        (erro, resultado) => {
            responderServico(res, erro, resultado);
        }
    );
}

function listarUsuarios(req, res) {
    usuarioService.listarUsuarios((erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function excluirUsuario(req, res) {
    usuarioService.excluirUsuario(req.params.id, (erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function buscarUsuarioPorId(req, res) {
    usuarioService.buscarUsuarioPorId(req.params.id, (erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function atualizarUsuario(req, res) {
    usuarioService.atualizarUsuario(
        req.params.id,
        req.body,
        (erro, resultado) => {
            responderServico(res, erro, resultado);
        }
    );
}

module.exports = {
    cadastrarUsuario,
    login,
    listarAlunosPorCursoPeriodo,
    listarUsuarios,
    excluirUsuario,
    buscarUsuarioPorId,
    atualizarUsuario
};
