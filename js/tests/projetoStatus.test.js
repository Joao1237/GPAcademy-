/** @jest-environment node */

const ProjetoStatus = require('../utils/projetoStatus');

describe('projetoStatus', () => {
    test('idsIguais compara ids numéricos e string', () => {
        expect(ProjetoStatus.idsIguais(1, '1')).toBe(true);
        expect(ProjetoStatus.idsIguais(2, 3)).toBe(false);
    });

    test('calcularStatusProjeto retorna Avaliado quando há entrega avaliada', () => {
        const resultado = ProjetoStatus.calcularStatusProjeto(
            [{ status: 'AVALIADO' }, { status: 'ENVIADO' }],
            'Publicado',
            'Recebido'
        );

        expect(resultado.statusCalculado).toBe('Avaliado');
        expect(resultado.temAvaliado).toBe(true);
        expect(resultado.temRecebido).toBe(true);
    });

    test('calcularStatusProjeto retorna Recebidos sem avaliação', () => {
        const resultado = ProjetoStatus.calcularStatusProjeto(
            [{ status: 'ENVIADO' }],
            'Publicado',
            'Recebidos'
        );

        expect(resultado.statusCalculado).toBe('Recebidos');
    });

    test('calcularStatusProjeto mantém Publicado sem entregas', () => {
        const resultado = ProjetoStatus.calcularStatusProjeto(
            [],
            'Publicado',
            'Recebido'
        );

        expect(resultado.statusCalculado).toBe('Publicado');
    });

    test('statusPassaNoFiltro filtra Recebidos por flag temRecebido', () => {
        const card = {
            temRecebido: 'true',
            temAvaliado: 'false',
            status: 'Recebido'
        };

        expect(ProjetoStatus.statusPassaNoFiltro(card, 'Recebidos')).toBe(true);
        expect(ProjetoStatus.statusPassaNoFiltro(card, 'Publicado')).toBe(false);
    });

    test('obterClasseStatus retorna classes css corretas', () => {
        expect(ProjetoStatus.obterClasseStatus('Recebidos')).toBe('recebido');
        expect(ProjetoStatus.obterClasseStatus('Avaliado')).toBe('avaliado');
        expect(ProjetoStatus.obterClasseStatus('Publicado')).toBe('publicado');
    });

    test('cardPassaFiltros combina status, tipo e curso', () => {
        const card = {
            temRecebido: true,
            temAvaliado: false,
            status: 'Recebido',
            tipo: 'Grupo',
            curso: 'ADS'
        };

        expect(ProjetoStatus.cardPassaFiltros(card, {
            status: 'Recebido',
            tipo: 'Grupo',
            curso: 'ADS'
        })).toBe(true);

        expect(ProjetoStatus.cardPassaFiltros(card, {
            status: 'Recebido',
            tipo: 'Individual',
            curso: 'ADS'
        })).toBe(false);
    });
});
