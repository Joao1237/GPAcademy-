const grupoService = require('../services/grupoService');
const { responderServico } = require('../utils/handleServiceResult');

function cadastrarGrupo(req, res) {
    grupoService.cadastrarGrupo(req.body, (erro, resultado) => {
        responderServico(res, erro, resultado, 201);
    });
}

module.exports = {
    cadastrarGrupo
};
