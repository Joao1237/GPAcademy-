const conexao = require('../config/db');

// Cadastra um novo usuário no banco de dados
function cadastrarUsuario(usuario, callback) {
    const sql = `
        INSERT INTO usuarios
        (nome, email, senha, tipo, curso_id, periodo)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    conexao.query(
        sql, [
            usuario.nome,
            usuario.email,
            usuario.senha,
            usuario.tipo,
            usuario.curso_id,
            usuario.periodo
        ],
        callback
    );
}

// Busca um usuário pelo email
function buscarUsuarioPorEmail(email, callback) {
    const sql = `
        SELECT *
        FROM usuarios
        WHERE email = ?
    `;

    conexao.query(sql, [email], callback);
}

// Busca alunos por curso e período
function buscarAlunosPorCursoPeriodo(curso_id, periodo, callback) {
    const sql = `
        SELECT *
        FROM usuarios
        WHERE tipo = 'ALUNO'
        AND curso_id = ?
        AND periodo = ?
    `;

    conexao.query(
        sql, [curso_id, periodo],
        callback
    );
}

// Lista todos os usuários cadastrados
function listarUsuarios(callback) {
    const sql = `
        SELECT
            u.id,
            u.nome,
            u.email,
            u.tipo,
            u.curso_id,
            CASE
                WHEN u.tipo = 'PROFESSOR' THEN
                    GROUP_CONCAT(
                        DISTINCT cp.nome
                        ORDER BY cp.nome
                        SEPARATOR ', '
                    )
                ELSE c.nome
            END AS nomeCurso,
            CASE
                WHEN u.tipo = 'PROFESSOR' THEN
                    GROUP_CONCAT(
                        DISTINCT pc.periodo
                        ORDER BY pc.periodo
                        SEPARATOR ', '
                    )
                ELSE u.periodo
            END AS periodo
        FROM usuarios u
        LEFT JOIN cursos c
            ON c.id = u.curso_id
        LEFT JOIN professor_cursos pc
            ON pc.professor_id = u.id
        LEFT JOIN cursos cp
            ON cp.id = pc.curso_id
        GROUP BY
            u.id,
            u.nome,
            u.email,
            u.tipo,
            u.curso_id,
            u.periodo,
            c.nome
        ORDER BY u.id DESC
    `;

    conexao.query(sql, callback);
}

// Exclui o usuário e remove vínculos relacionados
function excluirUsuario(id, callback) {
    const sql = `
        DELETE FROM professor_cursos
        WHERE professor_id = ?;

        UPDATE projetos
        SET professor_id = NULL
        WHERE professor_id = ?;

        DELETE FROM participacoes
        WHERE usuario_id = ?;

        DELETE FROM entregas
        WHERE usuario_id = ?;

        DELETE FROM usuarios
        WHERE id = ?;
    `;

    conexao.query(
        sql, [id, id, id, id, id],
        callback
    );
}

// Busca um usuário pelo ID
function buscarUsuarioPorId(id, callback) {
    const sql = `
        SELECT *
        FROM usuarios
        WHERE id = ?
    `;

    conexao.query(sql, [id], callback);
}

// Atualiza os dados de um usuário
function atualizarUsuario(id, usuario, callback) {
    const sql = `
        UPDATE usuarios
        SET nome = ?,
            email = ?,
            tipo = ?,
            curso_id = ?,
            periodo = ?,
            senha = COALESCE(?, senha)
        WHERE id = ?
    `;

    conexao.query(
        sql, [
            usuario.nome,
            usuario.email,
            usuario.tipo,
            usuario.curso_id || null,
            usuario.periodo || null,
            usuario.senha || null,
            id
        ],
        callback
    );
}

module.exports = {
    cadastrarUsuario,
    buscarUsuarioPorEmail,
    buscarAlunosPorCursoPeriodo,
    listarUsuarios,
    excluirUsuario,
    buscarUsuarioPorId,
    atualizarUsuario
};
