const conexao = require('../config/db');

// Cadastra um novo projeto no banco de dados
function cadastrarProjeto(projeto, callback) {

    const sql = `
        INSERT INTO projetos
        (
            titulo,
            descricao,
            materia,
            dataCriacao,
            prazo,
            status,
            publicado,
            curso_id,
            periodo,
            tipoEntrega,
            professor_id
        )
        VALUES (?, ?, ?, CURRENT_DATE, ?, ?, ?, ?, ?, ?, ?)
    `;

    conexao.query(
        sql, [
            projeto.titulo,
            projeto.descricao,
            projeto.materia,
            projeto.prazo,
            projeto.status,
            projeto.publicado,
            projeto.curso_id,
            projeto.periodo,
            projeto.tipoEntrega,
            projeto.professor_id
        ],
        callback
    );
}

// Lista todos os projetos cadastrados
function listarProjetos(callback) {

    const sql = `
        SELECT
            p.*,
            c.nome AS nomeCurso,
            u.nome AS nomeProfessor
        FROM projetos p
        LEFT JOIN cursos c
            ON c.id = p.curso_id
        LEFT JOIN usuarios u
            ON u.id = p.professor_id
    `;

    conexao.query(sql, callback);
}

// Exclui um projeto e seus registros relacionados
function excluirProjeto(id, callback) {

    const sql = `
        DELETE FROM entregas
        WHERE projeto_id = ?;

        DELETE FROM participacoes
        WHERE projeto_id = ?;

        DELETE FROM grupos
        WHERE projeto_id = ?;

        DELETE FROM projetos
        WHERE id = ?;
    `;

    conexao.query(
        sql, [id, id, id, id],
        callback
    );
}

module.exports = {
    cadastrarProjeto,
    listarProjetos,
    excluirProjeto
};