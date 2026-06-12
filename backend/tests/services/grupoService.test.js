/** @jest-environment node */

jest.mock('../../repositories/grupoRepository');

const grupoRepository = require('../../repositories/grupoRepository');
const grupoService = require('../../services/grupoService');
const { executarServico } = require('../helpers/callback');

describe('grupoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cadastrarGrupo valida campos obrigatórios', async () => {
        await expect(
            executarServico(grupoService.cadastrarGrupo, { nome: 'Grupo A' })
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Nome do grupo e projeto são obrigatórios.'
        });
    });

    test('cadastrarGrupo retorna id criado', async () => {
        grupoRepository.cadastrarGrupo.mockImplementation(
            (grupo, callback) => callback(null, { insertId: 12 })
        );

        const resultado = await executarServico(
            grupoService.cadastrarGrupo,
            { nome: 'Grupo A', projeto_id: 1 }
        );

        expect(resultado.id).toBe(12);
    });

    test('cadastrarGrupo retorna erro do repositório', async () => {
        grupoRepository.cadastrarGrupo.mockImplementation(
            (grupo, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(grupoService.cadastrarGrupo, {
                nome: 'Grupo A',
                projeto_id: 1
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao cadastrar grupo.'
        });
    });
});
