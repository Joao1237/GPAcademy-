/** @jest-environment node */

const { resolverApiUrl } = require('../utils/apiConfig');

describe('apiConfig.resolverApiUrl', () => {
    test('retorna localhost para ambiente local', () => {
        expect(resolverApiUrl('localhost', null)).toBe('http://localhost:3000');
        expect(resolverApiUrl('127.0.0.1', null)).toBe('http://localhost:3000');
    });

    test('usa meta api-url em produção', () => {
        expect(
            resolverApiUrl('app.vercel.app', 'https://api.exemplo.com/')
        ).toBe('https://api.exemplo.com');
    });

    test('usa /api como fallback em produção', () => {
        expect(resolverApiUrl('app.vercel.app', null)).toBe('/api');
    });
});
