/** @jest-environment node */

jest.mock('../../repositories/cursoRepository');

const cursoRepository = require('../../repositories/cursoRepository');
const cursoService = require('../../services/cursoService');
const { executarServico } = require('../helpers/callback');

describe('cursoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('cadastrarCurso valida campos obrigatórios', async () => {
        await expect(
            executarServico(cursoService.cadastrarCurso, { nome: 'ADS' })
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Nome do curso e quantidade de períodos são obrigatórios.'
        });
    });

    test('cadastrarCurso retorna id criado', async () => {
        cursoRepository.cadastrarCurso.mockImplementation(
            (curso, callback) => callback(null, { insertId: 3 })
        );

        const resultado = await executarServico(
            cursoService.cadastrarCurso,
            { nome: 'ADS', quantidadePeriodos: 6 }
        );

        expect(resultado.id).toBe(3);
    });

    test('listarCursos retorna lista', async () => {
        cursoRepository.listarCursos.mockImplementation(
            callback => callback(null, [{ id: 1, nome: 'ADS' }])
        );

        const resultado = await executarServico(cursoService.listarCursos);

        expect(resultado[0].nome).toBe('ADS');
    });

    test('cadastrarCurso retorna erro do repositório', async () => {
        cursoRepository.cadastrarCurso.mockImplementation(
            (curso, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(cursoService.cadastrarCurso, {
                nome: 'ADS',
                quantidadePeriodos: 6
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao cadastrar curso.'
        });
    });
});
