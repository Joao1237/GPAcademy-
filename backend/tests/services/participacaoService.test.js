/** @jest-environment node */

jest.mock('../../repositories/participacaoRepository');

const participacaoRepository = require('../../repositories/participacaoRepository');
const participacaoService = require('../../services/participacaoService');
const { executarServico } = require('../helpers/callback');

describe('participacaoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('adicionarParticipacao valida campos obrigatórios', async () => {
        await expect(
            executarServico(participacaoService.adicionarParticipacao, {})
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Usuário e projeto são obrigatórios.'
        });
    });

    test('adicionarParticipacao retorna sucesso', async () => {
        participacaoRepository.adicionarParticipacao.mockImplementation(
            (participacao, callback) => callback(null)
        );

        const resultado = await executarServico(
            participacaoService.adicionarParticipacao,
            { usuario_id: 1, projeto_id: 2 }
        );

        expect(resultado.mensagem).toContain('cadastrada');
    });

    test('adicionarParticipacoesGrupo valida lista vazia', async () => {
        await expect(
            executarServico(participacaoService.adicionarParticipacoesGrupo, [])
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Participações são obrigatórias.'
        });
    });

    test('adicionarParticipacao retorna erro do repositório', async () => {
        participacaoRepository.adicionarParticipacao.mockImplementation(
            (participacao, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(participacaoService.adicionarParticipacao, {
                usuario_id: 1,
                projeto_id: 2
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao adicionar participação.'
        });
    });

    test('listarParticipacoes retorna lista', async () => {
        participacaoRepository.listarParticipacoes.mockImplementation(
            callback => callback(null, [{ id: 1 }])
        );

        const resultado = await executarServico(
            participacaoService.listarParticipacoes
        );

        expect(resultado).toEqual([{ id: 1 }]);
    });

    test('adicionarParticipacoesGrupo salva participantes', async () => {
        participacaoRepository.adicionarParticipacoesGrupo.mockImplementation(
            (participacoes, callback) => callback(null)
        );

        const resultado = await executarServico(
            participacaoService.adicionarParticipacoesGrupo,
            [{ usuario_id: 1, projeto_id: 2, grupo_id: 3 }]
        );

        expect(resultado.mensagem).toContain('salvos com sucesso');
    });

    test('listarProjetosDoAluno retorna projetos', async () => {
        participacaoRepository.listarProjetosDoAluno.mockImplementation(
            (id, callback) => callback(null, [{ id: 1, titulo: 'P1' }])
        );

        const resultado = await executarServico(
            participacaoService.listarProjetosDoAluno,
            5
        );

        expect(resultado).toHaveLength(1);
    });
});
