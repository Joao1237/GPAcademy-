/** @jest-environment node */

jest.mock('../../repositories/usuarioRepository');

const bcrypt = require('bcrypt');
const usuarioRepository = require('../../repositories/usuarioRepository');
const usuarioService = require('../../services/usuarioService');
const { executarServico } = require('../helpers/callback');

describe('usuarioService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cadastrarUsuario valida campos obrigatórios', async () => {
        await expect(
            executarServico(usuarioService.cadastrarUsuario, {})
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    });

    test('cadastrarUsuario persiste usuário com senha criptografada', async () => {
        usuarioRepository.cadastrarUsuario.mockImplementation(
            (usuario, callback) => callback(null, { insertId: 10 })
        );

        const resultado = await executarServico(
            usuarioService.cadastrarUsuario,
            {
                nome: 'Ana',
                email: 'ana@test.com',
                senha: '123456',
                tipo: 'ALUNO'
            }
        );

        expect(resultado.id).toBe(10);
        expect(usuarioRepository.cadastrarUsuario).toHaveBeenCalled();

        const usuarioSalvo =
            usuarioRepository.cadastrarUsuario.mock.calls[0][0];

        expect(usuarioSalvo.senha).not.toBe('123456');
        expect(await bcrypt.compare('123456', usuarioSalvo.senha)).toBe(true);
    });

    test('login exige email e senha', async () => {
        await expect(
            executarServico(usuarioService.login, { email: '', senha: '' })
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Email e senha são obrigatórios.'
        });
    });

    test('login retorna 401 quando usuário não existe', async () => {
        usuarioRepository.buscarUsuarioPorEmail.mockImplementation(
            (email, callback) => callback(null, [])
        );

        await expect(
            executarServico(usuarioService.login, {
                email: 'nao@test.com',
                senha: '123456'
            })
        ).rejects.toMatchObject({
            status: 401,
            mensagem: 'Email ou senha inválidos.'
        });
    });

    test('login retorna usuário autenticado', async () => {
        const senhaHash = await bcrypt.hash('123456', 10);

        usuarioRepository.buscarUsuarioPorEmail.mockImplementation(
            (email, callback) => callback(null, [{
                id: 1,
                nome: 'João',
                email: 'joao@test.com',
                senha: senhaHash,
                tipo: 'PROFESSOR',
                curso_id: null,
                periodo: null
            }])
        );

        const resultado = await executarServico(
            usuarioService.login,
            { email: 'joao@test.com', senha: '123456' }
        );

        expect(resultado.usuario).toEqual({
            id: 1,
            nome: 'João',
            email: 'joao@test.com',
            tipo: 'PROFESSOR',
            curso_id: null,
            periodo: null
        });
    });

    test('buscarUsuarioPorId retorna 404 quando não encontrado', async () => {
        usuarioRepository.buscarUsuarioPorId.mockImplementation(
            (id, callback) => callback(null, [])
        );

        await expect(
            executarServico(usuarioService.buscarUsuarioPorId, 99)
        ).rejects.toMatchObject({
            status: 404,
            mensagem: 'Usuário não encontrado.'
        });
    });

    test('atualizarUsuario valida campos obrigatórios', async () => {
        await expect(
            executarServico(usuarioService.atualizarUsuario, 1, {
                nome: 'Ana'
            })
        ).rejects.toMatchObject({
            status: 400
        });
    });

    test('login retorna 401 com senha inválida', async () => {
        const senhaHash = await bcrypt.hash('123456', 10);

        usuarioRepository.buscarUsuarioPorEmail.mockImplementation(
            (email, callback) => callback(null, [{
                id: 1,
                nome: 'João',
                email: 'joao@test.com',
                senha: senhaHash,
                tipo: 'PROFESSOR'
            }])
        );

        await expect(
            executarServico(usuarioService.login, {
                email: 'joao@test.com',
                senha: 'errada'
            })
        ).rejects.toMatchObject({
            status: 401,
            mensagem: 'Email ou senha inválidos.'
        });
    });

    test('listarUsuarios retorna lista', async () => {
        usuarioRepository.listarUsuarios.mockImplementation(
            callback => callback(null, [{ id: 1 }])
        );

        const resultado = await executarServico(usuarioService.listarUsuarios);

        expect(resultado).toEqual([{ id: 1 }]);
    });

    test('listarAlunosPorCursoPeriodo retorna erro do repositório', async () => {
        usuarioRepository.buscarAlunosPorCursoPeriodo.mockImplementation(
            (curso, periodo, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(
                usuarioService.listarAlunosPorCursoPeriodo,
                1,
                2
            )
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao listar alunos.'
        });
    });

    test('buscarUsuarioPorId retorna usuário encontrado', async () => {
        usuarioRepository.buscarUsuarioPorId.mockImplementation(
            (id, callback) => callback(null, [{ id: 1, nome: 'Ana' }])
        );

        const resultado = await executarServico(
            usuarioService.buscarUsuarioPorId,
            1
        );

        expect(resultado.nome).toBe('Ana');
    });

    test('atualizarUsuario atualiza com sucesso', async () => {
        usuarioRepository.atualizarUsuario.mockImplementation(
            (id, usuario, callback) => callback(null)
        );

        const resultado = await executarServico(
            usuarioService.atualizarUsuario,
            1,
            {
                nome: 'Ana',
                email: 'ana@test.com',
                senha: '123456',
                tipo: 'ALUNO'
            }
        );

        expect(resultado.mensagem).toContain('atualizado');
    });

    test('atualizarUsuario preserva senha quando nova senha não é enviada', async () => {
        usuarioRepository.atualizarUsuario.mockImplementation(
            (id, usuario, callback) => callback(null)
        );

        const resultado = await executarServico(
            usuarioService.atualizarUsuario,
            1,
            {
                nome: 'Ana',
                email: 'ana@test.com',
                tipo: 'ALUNO'
            }
        );

        const usuarioAtualizado =
            usuarioRepository.atualizarUsuario.mock.calls[0][1];

        expect(resultado.mensagem).toContain('atualizado');
        expect(usuarioAtualizado.senha).toBeUndefined();
    });

    test('cadastrarUsuario retorna erro do repositório', async () => {
        usuarioRepository.cadastrarUsuario.mockImplementation(
            (usuario, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(usuarioService.cadastrarUsuario, {
                nome: 'Ana',
                email: 'ana@test.com',
                senha: '123456',
                tipo: 'ALUNO'
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao cadastrar usuário.'
        });
    });

    test('login retorna erro ao buscar usuário', async () => {
        usuarioRepository.buscarUsuarioPorEmail.mockImplementation(
            (email, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(usuarioService.login, {
                email: 'ana@test.com',
                senha: '123456'
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao buscar usuário.'
        });
    });

    test('excluirUsuario retorna sucesso', async () => {
        usuarioRepository.excluirUsuario.mockImplementation(
            (id, callback) => callback(null)
        );

        const resultado = await executarServico(
            usuarioService.excluirUsuario,
            1
        );

        expect(resultado.mensagem).toContain('excluído');
    });
});
