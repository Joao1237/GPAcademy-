/** @jest-environment node */

jest.mock('../../repositories/entregaRepository');

const entregaRepository = require('../../repositories/entregaRepository');
const entregaService = require('../../services/entregaService');
const { executarServico } = require('../helpers/callback');

describe('entregaService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cadastrarEntrega valida campos obrigatórios', async () => {
        await expect(
            executarServico(entregaService.cadastrarEntrega, {})
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Aluno, projeto e arquivo são obrigatórios.'
        });
    });

    test('cadastrarEntrega impede envio duplicado', async () => {
        entregaRepository.buscarEntregaPorAlunoProjeto.mockImplementation(
            (usuarioId, projetoId, callback) => callback(null, [{ id: 1 }])
        );

        await expect(
            executarServico(entregaService.cadastrarEntrega, {
                usuario_id: 1,
                projeto_id: 2,
                arquivo: 'trabalho.pdf'
            })
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Você já enviou um trabalho para este projeto.'
        });
    });

    test('cadastrarEntrega registra nova entrega', async () => {
        entregaRepository.buscarEntregaPorAlunoProjeto.mockImplementation(
            (usuarioId, projetoId, callback) => callback(null, [])
        );

        entregaRepository.cadastrarEntrega.mockImplementation(
            (entrega, callback) => callback(null, { insertId: 15 })
        );

        const resultado = await executarServico(
            entregaService.cadastrarEntrega,
            {
                usuario_id: 1,
                projeto_id: 2,
                arquivo: 'trabalho.pdf'
            }
        );

        expect(resultado).toEqual({
            mensagem: 'Entrega realizada com sucesso!',
            id: 15,
            arquivo: 'trabalho.pdf'
        });
    });

    test('salvarFeedback valida campos obrigatórios', async () => {
        await expect(
            executarServico(entregaService.salvarFeedback, {})
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Entrega e feedback são obrigatórios.'
        });
    });

    test('salvarFeedback persiste avaliação', async () => {
        entregaRepository.salvarFeedback.mockImplementation(
            (entrega, callback) => callback(null)
        );

        const resultado = await executarServico(
            entregaService.salvarFeedback,
            { id: 3, feedback: 'Bom trabalho' }
        );

        expect(resultado.mensagem).toContain('Feedback salvo');
    });

    test('listarEntregasPorProjeto retorna entregas', async () => {
        entregaRepository.listarEntregasPorProjeto.mockImplementation(
            (projetoId, callback) => callback(null, [{ id: 1 }])
        );

        const resultado = await executarServico(
            entregaService.listarEntregasPorProjeto,
            3
        );

        expect(resultado).toEqual([{ id: 1 }]);
    });

    test('listarEntregasGrupoPorProjeto retorna erro do repositório', async () => {
        entregaRepository.listarEntregasGrupoPorProjeto.mockImplementation(
            (projetoId, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(entregaService.listarEntregasGrupoPorProjeto, 3)
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao listar entregas em grupo.'
        });
    });

    test('listarEntregas retorna lista', async () => {
        entregaRepository.listarEntregas.mockImplementation(
            callback => callback(null, [{ id: 1 }])
        );

        const resultado = await executarServico(entregaService.listarEntregas);

        expect(resultado).toEqual([{ id: 1 }]);
    });

    test('cadastrarEntrega retorna erro ao verificar entrega', async () => {
        entregaRepository.buscarEntregaPorAlunoProjeto.mockImplementation(
            (usuarioId, projetoId, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(entregaService.cadastrarEntrega, {
                usuario_id: 1,
                projeto_id: 2,
                arquivo: 'trabalho.pdf'
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao verificar entrega.'
        });
    });
});
