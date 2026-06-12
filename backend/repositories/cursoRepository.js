const conexao = require('../config/db');

// Cadastra um novo curso no banco de dados
function cadastrarCurso(curso, callback) {

    const sql = `
        INSERT INTO cursos
        (nome, quantidadePeriodos)
        VALUES (?, ?)
    `;

    conexao.query(
        sql, [
            curso.nome,
            curso.quantidadePeriodos
        ],
        callback
    );
}

// Lista todos os cursos cadastrados
function listarCursos(callback) {

    const sql = `
        SELECT *
        FROM cursos
    `;

    conexao.query(sql, callback);
}

module.exports = {
    cadastrarCurso,
    listarCursos
};