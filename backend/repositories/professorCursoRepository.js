const conexao = require('../config/db');

// Vincula um professor a um curso e período
function vincularProfessorCurso(dados, callback) {

    const sql = `
        INSERT INTO professor_cursos
        (
            professor_id,
            curso_id,
            periodo
        )
        VALUES (?, ?, ?)
    `;

    conexao.query(
        sql, [
            dados.professor_id,
            dados.curso_id,
            dados.periodo
        ],
        callback
    );
}

// Lista todos os vínculos de um professor
function listarVinculosProfessor(professor_id, callback) {

    const sql = `
        SELECT
            pc.professor_id,
            pc.curso_id,
            pc.periodo,
            c.nome AS nomeCurso
        FROM professor_cursos pc
        INNER JOIN cursos c
            ON c.id = pc.curso_id
        WHERE pc.professor_id = ?
    `;

    conexao.query(
        sql, [professor_id],
        callback
    );
}

module.exports = {
    vincularProfessorCurso,
    listarVinculosProfessor
};