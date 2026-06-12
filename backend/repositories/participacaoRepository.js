const conexao = require('../config/db');

// Adiciona uma participação individual
function adicionarParticipacao(participacao, callback) {
    const sql = `
        INSERT INTO participacoes
        (usuario_id, projeto_id)
        VALUES (?, ?)
    `;

    conexao.query(
        sql, [
            participacao.usuario_id,
            participacao.projeto_id
        ],
        callback
    );
}

// Adiciona várias participações de uma vez
function adicionarParticipacoesEmLote(participacoes, callback) {
    const valores = participacoes.map(p => [
        p.usuario_id,
        p.projeto_id
    ]);

    const sql = `
        INSERT INTO participacoes
        (usuario_id, projeto_id)
        VALUES ?
    `;

    conexao.query(
        sql, [valores],
        callback
    );
}

// Adiciona participantes em projetos em grupo
function adicionarParticipacoesGrupo(participacoes, callback) {
    const valores = participacoes.map(p => [
        p.usuario_id,
        p.projeto_id,
        p.grupo_id
    ]);

    const sql = `
        INSERT INTO participacoes
        (usuario_id, projeto_id, grupo_id)
        VALUES ?
    `;

    conexao.query(
        sql, [valores],
        callback
    );
}

// Lista todas as participações cadastradas
function listarParticipacoes(callback) {
    const sql = `
        SELECT *
        FROM participacoes
    `;

    conexao.query(sql, callback);
}

// Lista os projetos que aparecem no dashboard do aluno
function listarProjetosDoAluno(usuario_id, callback) {
    const sql = `
        SELECT
            p.*,
            c.nome AS nomeCurso,
            pa.grupo_id,
            e.status AS statusEntrega,
            e.arquivo,
            e.dataEntrega,
            e.feedback
        FROM participacoes pa
        INNER JOIN projetos p
            ON p.id = pa.projeto_id
        LEFT JOIN cursos c
            ON c.id = p.curso_id
        LEFT JOIN entregas e
            ON e.projeto_id = p.id
            AND (
                e.usuario_id = pa.usuario_id
                OR e.grupo_id = pa.grupo_id
            )
        WHERE pa.usuario_id = ?
    `;

    conexao.query(
        sql, [usuario_id],
        callback
    );
}

module.exports = {
    adicionarParticipacao,
    adicionarParticipacoesEmLote,
    adicionarParticipacoesGrupo,
    listarParticipacoes,
    listarProjetosDoAluno
};