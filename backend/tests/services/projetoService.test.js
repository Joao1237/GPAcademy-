/** @jest-environment node */

jest.mock('../../repositories/projetoRepository');
jest.mock('../../repositories/usuarioRepository');
jest.mock('../../repositories/participacaoRepository');

const projetoRepository = require('../../repositories/projetoRepository');
const usuarioRepository = require('../../repositories/usuarioRepository');
const participacaoRepository = require('../../repositories/participacaoRepository');
const projetoService = require('../../services/projetoService');
const { executarServico } = require('../helpers/callback');

const projetoBase = {
    titulo: 'Projeto 1',
    descricao: 'Descrição',
    materia: 'Matéria',
    prazo: '2026-12-31',
    curso_id: 1,
    periodo: 2,
    tipoEntrega: 'individual'
};

describe('projetoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cadastrarProjeto valida campos obrigatórios', async () => {
        await expect(
            executarServico(projetoService.cadastrarProjeto, { titulo: 'A' })
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    });

    test('cadastrarProjeto em grupo não cria participações', async () => {
        projetoRepository.cadastrarProjeto.mockImplementation(
            (projeto, callback) => callback(null, { insertId: 5 })
        );

        const resultado = await executarServico(
            projetoService.cadastrarProjeto,
            { ...projetoBase, tipoEntrega: 'grupo' }
        );

        expect(resultado.id).toBe(5);
        expect(usuarioRepository.buscarAlunosPorCursoPeriodo).not.toHaveBeenCalled();
    });

    test('cadastrarProjeto individual cria participações dos alunos', async () => {
        projetoRepository.cadastrarProjeto.mockImplementation(
            (projeto, callback) => callback(null, { insertId: 7 })
        );

        usuarioRepository.buscarAlunosPorCursoPeriodo.mockImplementation(
            (curso, periodo, callback) => callback(null, [{ id: 1 }, { id: 2 }])
        );

        participacaoRepository.adicionarParticipacoesEmLote.mockImplementation(
            (participacoes, callback) => callback(null)
        );

        const resultado = await executarServico(
            projetoService.cadastrarProjeto,
            projetoBase
        );

        expect(resultado.mensagem).toContain('enviado aos alunos');
        expect(participacaoRepository.adicionarParticipacoesEmLote)
            .toHaveBeenCalledWith(
                [
                    { usuario_id: 1, projeto_id: 7 },
                    { usuario_id: 2, projeto_id: 7 }
                ],
                expect.any(Function)
            );
    });

    test('cadastrarProjeto individual sem alunos retorna aviso', async () => {
        projetoRepository.cadastrarProjeto.mockImplementation(
            (projeto, callback) => callback(null, { insertId: 8 })
        );

        usuarioRepository.buscarAlunosPorCursoPeriodo.mockImplementation(
            (curso, periodo, callback) => callback(null, [])
        );

        const resultado = await executarServico(
            projetoService.cadastrarProjeto,
            projetoBase
        );

        expect(resultado.mensagem).toContain('nenhum aluno');
    });

    test('listarProjetos retorna lista', async () => {
        projetoRepository.listarProjetos.mockImplementation(
            callback => callback(null, [{ id: 1 }])
        );

        const resultado = await executarServico(projetoService.listarProjetos);

        expect(resultado).toEqual([{ id: 1 }]);
    });

    test('cadastrarProjeto retorna erro ao buscar alunos', async () => {
        projetoRepository.cadastrarProjeto.mockImplementation(
            (projeto, callback) => callback(null, { insertId: 9 })
        );

        usuarioRepository.buscarAlunosPorCursoPeriodo.mockImplementation(
            (curso, periodo, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(projetoService.cadastrarProjeto, projetoBase)
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Projeto cadastrado, mas ocorreu erro ao buscar alunos.'
        });
    });

    test('cadastrarProjeto retorna erro ao criar participações', async () => {
        projetoRepository.cadastrarProjeto.mockImplementation(
            (projeto, callback) => callback(null, { insertId: 11 })
        );

        usuarioRepository.buscarAlunosPorCursoPeriodo.mockImplementation(
            (curso, periodo, callback) => callback(null, [{ id: 1 }])
        );

        participacaoRepository.adicionarParticipacoesEmLote.mockImplementation(
            (participacoes, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(projetoService.cadastrarProjeto, projetoBase)
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Projeto cadastrado, mas ocorreu erro ao criar participações.'
        });
    });

    test('listarProjetos retorna erro do repositório', async () => {
        projetoRepository.listarProjetos.mockImplementation(
            callback => callback(new Error('falha'))
        );

        await expect(
            executarServico(projetoService.listarProjetos)
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao listar projetos'
        });
    });

    test('excluirProjeto retorna sucesso', async () => {
        projetoRepository.excluirProjeto.mockImplementation(
            (id, callback) => callback(null)
        );

        const resultado = await executarServico(
            projetoService.excluirProjeto,
            1
        );

        expect(resultado.mensagem).toContain('excluído');
    });
});
