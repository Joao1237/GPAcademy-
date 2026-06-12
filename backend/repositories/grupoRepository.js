const conexao = require('../config/db');

// Cadastra um novo grupo no banco de dados
function cadastrarGrupo(grupo, callback) {

    const sql = `
        INSERT INTO grupos
        (nome, projeto_id)
        VALUES (?, ?)
    `;

    conexao.query(
        sql, [
            grupo.nome,
            grupo.projeto_id
        ],
        callback
    );
}

module.exports = {
    cadastrarGrupo
};