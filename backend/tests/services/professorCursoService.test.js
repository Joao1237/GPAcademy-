/** @jest-environment node */

jest.mock('../../repositories/professorCursoRepository');

const professorCursoRepository = require('../../repositories/professorCursoRepository');
const professorCursoService = require('../../services/professorCursoService');
const { executarServico } = require('../helpers/callback');

describe('professorCursoService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('vincularProfessorCurso valida campos obrigatórios', async () => {
        await expect(
            executarServico(professorCursoService.vincularProfessorCurso, {
                professor_id: 1
            })
        ).rejects.toMatchObject({
            status: 400,
            mensagem: 'Professor, curso e período são obrigatórios.'
        });
    });

    test('vincularProfessorCurso retorna sucesso', async () => {
        professorCursoRepository.vincularProfessorCurso.mockImplementation(
            (dados, callback) => callback(null)
        );

        const resultado = await executarServico(
            professorCursoService.vincularProfessorCurso,
            { professor_id: 1, curso_id: 2, periodo: 3 }
        );

        expect(resultado.mensagem).toContain('vinculado');
    });

    test('vincularProfessorCurso retorna erro do repositório', async () => {
        professorCursoRepository.vincularProfessorCurso.mockImplementation(
            (dados, callback) => callback(new Error('falha'))
        );

        await expect(
            executarServico(professorCursoService.vincularProfessorCurso, {
                professor_id: 1,
                curso_id: 2,
                periodo: 3
            })
        ).rejects.toMatchObject({
            status: 500,
            mensagem: 'Erro ao vincular professor ao curso/período.'
        });
    });

    test('listarVinculosProfessor retorna vínculos', async () => {
        professorCursoRepository.listarVinculosProfessor.mockImplementation(
            (id, callback) => callback(null, [{ curso_id: 1, periodo: 2 }])
        );

        const resultado = await executarServico(
            professorCursoService.listarVinculosProfessor,
            1
        );

        expect(resultado).toHaveLength(1);
    });
});
