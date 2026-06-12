/** @jest-environment node */

const { responderServico } = require('../../utils/handleServiceResult');
const { criarRespostaMock } = require('../helpers/httpMock');

describe('handleServiceResult.responderServico', () => {
    test('retorna erro com status informado', () => {
        const res = criarRespostaMock();

        responderServico(res, {
            status: 400,
            mensagem: 'Dados inválidos'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body).toEqual({ mensagem: 'Dados inválidos' });
    });

    test('retorna erro 500 quando status não informado', () => {
        const res = criarRespostaMock();

        responderServico(res, { mensagem: 'Falha interna' });

        expect(res.statusCode).toBe(500);
        expect(res.body.mensagem).toBe('Falha interna');
    });

    test('retorna sucesso com status padrão 200', () => {
        const res = criarRespostaMock();

        responderServico(res, null, { ok: true });

        expect(res.statusCode).toBe(200);
        expect(res.body).toEqual({ ok: true });
    });

    test('retorna sucesso com status customizado', () => {
        const res = criarRespostaMock();

        responderServico(res, null, { id: 1 }, 201);

        expect(res.statusCode).toBe(201);
        expect(res.body).toEqual({ id: 1 });
    });
});
