const grupoRepository = require('../repositories/grupoRepository');

function cadastrarGrupo(grupo, callback) {
    if (!grupo.nome || !grupo.projeto_id) {
        return callback({
            status: 400,
            mensagem: 'Nome do grupo e projeto são obrigatórios.'
        });
    }

    grupoRepository.cadastrarGrupo(grupo, (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar grupo:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao cadastrar grupo.'
            });
        }

        callback(null, {
            mensagem: 'Grupo cadastrado com sucesso!',
            id: resultado.insertId
        });
    });
}

module.exports = {
    cadastrarGrupo
};
