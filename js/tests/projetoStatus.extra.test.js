/** @jest-environment node */

const ProjetoStatus = require('../utils/projetoStatus');

describe('projetoStatus - casos adicionais', () => {
    test('statusPassaNoFiltro retorna true para Todos', () => {
        expect(
            ProjetoStatus.statusPassaNoFiltro({ status: 'Publicado' }, 'Todos')
        ).toBe(true);
    });

    test('statusPassaNoFiltro filtra Avaliado', () => {
        expect(
            ProjetoStatus.statusPassaNoFiltro(
                { temAvaliado: 'true', status: 'Avaliado' },
                'Avaliado'
            )
        ).toBe(true);
    });

    test('cardPassaFiltros respeita período', () => {
        expect(
            ProjetoStatus.cardPassaFiltros(
                { status: 'Publicado', periodo: '2º Período' },
                { status: 'Publicado', periodo: '1º Período' }
            )
        ).toBe(false);
    });
});
