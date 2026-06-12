const conexao = require('../config/db');

// Cadastra uma nova entrega de trabalho
function cadastrarEntrega(entrega, callback) {

    const sql = `
        INSERT INTO entregas
        (
            usuario_id,
            projeto_id,
            grupo_id,
            arquivo,
            dataEntrega,
            status
        )
        VALUES (?, ?, ?, ?, NOW(), 'ENVIADO')
    `;

    conexao.query(
        sql, [
            entrega.usuario_id,
            entrega.projeto_id,
            entrega.grupo_id || null,
            entrega.arquivo
        ],
        callback
    );
}

// Lista todas as entregas cadastradas
function listarEntregas(callback) {

    const sql = `
        SELECT *
        FROM entregas
    `;

    conexao.query(sql, callback);
}

// Lista entregas individuais de um projeto
function listarEntregasPorProjeto(projeto_id, callback) {

    const sql = `
        SELECT
            e.*,
            u.nome AS nomeAluno
        FROM entregas e
        INNER JOIN usuarios u
            ON u.id = e.usuario_id
        WHERE e.projeto_id = ?
        AND e.grupo_id IS NULL
    `;

    conexao.query(
        sql, [projeto_id],
        callback
    );
}

// Lista entregas em grupo de um projeto
function listarEntregasGrupoPorProjeto(projeto_id, callback) {

    const sql = `
        SELECT
            g.id AS grupo_id,
            g.nome AS nomeGrupo,
            GROUP_CONCAT(u.nome SEPARATOR ', ') AS integrantes,
            e.id AS entrega_id,
            e.arquivo,
            e.dataEntrega,
            e.status,
            e.feedback
        FROM grupos g
        INNER JOIN participacoes pa
            ON pa.grupo_id = g.id
        INNER JOIN usuarios u
            ON u.id = pa.usuario_id
        LEFT JOIN entregas e
            ON e.grupo_id = g.id
            AND e.projeto_id = g.projeto_id
        WHERE g.projeto_id = ?
        GROUP BY
            g.id,
            g.nome,
            e.id,
            e.arquivo,
            e.dataEntrega,
            e.status,
            e.feedback
    `;

    conexao.query(
        sql, [projeto_id],
        callback
    );
}

// Salva o feedback do professor e altera o status para AVALIADO
function salvarFeedback(entrega, callback) {

    const sql = `
        UPDATE entregas
        SET feedback = ?,
            status = 'AVALIADO'
        WHERE id = ?
    `;

    conexao.query(
        sql, [
            entrega.feedback,
            entrega.id
        ],
        callback
    );
}

// Verifica se o aluno já enviou um trabalho para o projeto
function buscarEntregaPorAlunoProjeto(
    usuario_id,
    projeto_id,
    callback
) {

    const sql = `
        SELECT *
        FROM entregas
        WHERE usuario_id = ?
        AND projeto_id = ?
    `;

    conexao.query(
        sql, [usuario_id, projeto_id],
        callback
    );
}

module.exports = {
    cadastrarEntrega,
    listarEntregas,
    listarEntregasPorProjeto,
    listarEntregasGrupoPorProjeto,
    salvarFeedback,
    buscarEntregaPorAlunoProjeto
};