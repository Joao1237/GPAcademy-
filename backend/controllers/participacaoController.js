const participacaoService = require('../services/participacaoService');
const { responderServico } = require('../utils/handleServiceResult');

function adicionarParticipacao(req, res) {
    participacaoService.adicionarParticipacao(
        req.body,
        (erro, resultado) => {
            responderServico(res, erro, resultado, 201);
        }
    );
}

function listarParticipacoes(req, res) {
    participacaoService.listarParticipacoes((erro, resultado) => {
        responderServico(res, erro, resultado);
    });
}

function listarProjetosDoAluno(req, res) {
    participacaoService.listarProjetosDoAluno(
        req.params.usuario_id,
        (erro, resultado) => {
            responderServico(res, erro, resultado);
        }
    );
}

function adicionarParticipacoesGrupo(req, res) {
    participacaoService.adicionarParticipacoesGrupo(
        req.body.participacoes,
        (erro, resultado) => {
            responderServico(res, erro, resultado, 201);
        }
    );
}

module.exports = {
    adicionarParticipacao,
    listarParticipacoes,
    listarProjetosDoAluno,
    adicionarParticipacoesGrupo
};
