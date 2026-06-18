const bcrypt = require('bcrypt');
const usuarioRepository = require('../repositories/usuarioRepository');

// Quantidade de saltos usada para criptografar a senha
const SALT_ROUNDS = 10;

function cadastrarUsuario(usuario, callback) {
    if (!usuario.nome ||
        !usuario.email ||
        !usuario.senha ||
        !usuario.tipo
    ) {
        return callback({
            status: 400,
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    }

    bcrypt.hash(usuario.senha, SALT_ROUNDS, (erroHash, senhaCriptografada) => {
        if (erroHash) {
            console.error('Erro ao criptografar senha:', erroHash);

            return callback({
                status: 500,
                mensagem: 'Erro ao processar senha.'
            });
        }

        usuario.senha = senhaCriptografada;

        usuarioRepository.cadastrarUsuario(usuario, (erro, resultado) => {
            if (erro) {
                console.error('Erro ao cadastrar usuário:', erro);

                return callback({
                    status: 500,
                    mensagem: 'Erro ao cadastrar usuário.'
                });
            }

            callback(null, {
                mensagem: 'Usuário cadastrado com sucesso!',
                id: resultado.insertId
            });
        });
    });
}

function login(credenciais, callback) {
    const { email, senha } = credenciais;

    if (!email || !senha) {
        return callback({
            status: 400,
            mensagem: 'Email e senha são obrigatórios.'
        });
    }

    usuarioRepository.buscarUsuarioPorEmail(email, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar usuário:', erro);

            return callback({
                status: 500,
                mensagem: 'Erro ao buscar usuário.'
            });
        }

        if (resultados.length === 0) {
            return callback({
                status: 401,
                mensagem: 'Email ou senha inválidos.'
            });
        }

        const usuario = resultados[0];

        bcrypt.compare(senha, usuario.senha, (erroCompare, senhaValida) => {
            if (erroCompare) {
                console.error('Erro ao comparar senha:', erroCompare);

                return callback({
                    status: 500,
                    mensagem: 'Erro ao validar senha.'
                });
            }

            if (!senhaValida) {
                return callback({
                    status: 401,
                    mensagem: 'Email ou senha inválidos.'
                });
            }

            callback(null, {
                mensagem: 'Login realizado com sucesso!',
                usuario: {
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    tipo: usuario.tipo,
                    curso_id: usuario.curso_id,
                    periodo: usuario.periodo
                }
            });
        });
    });
}

function listarAlunosPorCursoPeriodo(curso_id, periodo, callback) {
    usuarioRepository.buscarAlunosPorCursoPeriodo(
        curso_id,
        periodo,
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao listar alunos:', erro);

                return callback({
                    status: 500,
                    mensagem: 'Erro ao listar alunos.'
                });
            }

            callback(null, resultados);
        }
    );
}

function listarUsuarios(callback) {
    usuarioRepository.listarUsuarios((erro, resultados) => {
        if (erro) {
            console.error('Erro ao listar usuários:', erro);

            return callback({
                status: 500,
                mensagem: 'Erro ao listar usuários.'
            });
        }

        callback(null, resultados);
    });
}

function excluirUsuario(id, callback) {
    usuarioRepository.excluirUsuario(id, (erro) => {
        if (erro) {
            console.error('Erro ao excluir usuário:', erro);

            return callback({
                status: 500,
                mensagem: erro.sqlMessage || 'Erro ao excluir usuário.'
            });
        }

        callback(null, {
            mensagem: 'Usuário excluído com sucesso!'
        });
    });
}

function buscarUsuarioPorId(id, callback) {
    usuarioRepository.buscarUsuarioPorId(id, (erro, resultados) => {
        if (erro) {
            console.error('Erro ao buscar usuário:', erro);

            return callback({
                status: 500,
                mensagem: 'Erro ao buscar usuário.'
            });
        }

        if (resultados.length === 0) {
            return callback({
                status: 404,
                mensagem: 'Usuário não encontrado.'
            });
        }

        callback(null, resultados[0]);
    });
}

function atualizarUsuario(id, usuario, callback) {
    if (!usuario.nome ||
        !usuario.email ||
        !usuario.tipo
    ) {
        return callback({
            status: 400,
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    }

    if (!usuario.senha) {
        return usuarioRepository.atualizarUsuario(id, usuario, (erro) => {
            if (erro) {
                console.error('Erro ao atualizar usuário:', erro);

                return callback({
                    status: 500,
                    mensagem: 'Erro ao atualizar usuário.'
                });
            }

            callback(null, {
                mensagem: 'Usuário atualizado com sucesso!'
            });
        });
    }

    bcrypt.hash(usuario.senha, SALT_ROUNDS, (erroHash, senhaCriptografada) => {
        if (erroHash) {
            console.error('Erro ao criptografar senha:', erroHash);

            return callback({
                status: 500,
                mensagem: 'Erro ao processar senha.'
            });
        }

        usuario.senha = senhaCriptografada;

        usuarioRepository.atualizarUsuario(id, usuario, (erro) => {
            if (erro) {
                console.error('Erro ao atualizar usuário:', erro);

                return callback({
                    status: 500,
                    mensagem: 'Erro ao atualizar usuário.'
                });
            }

            callback(null, {
                mensagem: 'Usuário atualizado com sucesso!'
            });
        });
    });
}

module.exports = {
    cadastrarUsuario,
    login,
    listarAlunosPorCursoPeriodo,
    listarUsuarios,
    excluirUsuario,
    buscarUsuarioPorId,
    atualizarUsuario
};
