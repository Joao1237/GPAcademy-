/** @jest-environment node */

const { obterConfigBanco } = require('../../config/dbConfig');

describe('dbConfig.obterConfigBanco', () => {
    test('usa variáveis DB_* quando informadas', () => {
        const config = obterConfigBanco({
            DB_HOST: 'db.example.com',
            DB_PORT: '3307',
            DB_USER: 'admin',
            DB_PASSWORD: 'secret',
            DB_NAME: 'gpacademy'
        });

        expect(config).toEqual({
            host: 'db.example.com',
            port: 3307,
            user: 'admin',
            password: 'secret',
            database: 'gpacademy'
        });
    });

    test('usa variáveis MYSQL* do Railway como fallback', () => {
        const config = obterConfigBanco({
            MYSQLHOST: 'mysql.railway.app',
            MYSQLPORT: '3306',
            MYSQLUSER: 'root',
            MYSQLPASSWORD: 'railway-pass',
            MYSQLDATABASE: 'railway'
        });

        expect(config.host).toBe('mysql.railway.app');
        expect(config.database).toBe('railway');
    });

    test('interpreta MYSQL_PUBLIC_URL', () => {
        const config = obterConfigBanco({
            MYSQL_PUBLIC_URL: 'mysql://user:pass@host.railway.app:3306/gpacademy'
        });

        expect(config).toEqual({
            host: 'host.railway.app',
            port: 3306,
            user: 'user',
            password: 'pass',
            database: 'gpacademy'
        });
    });

    test('aplica valores padrão locais', () => {
        const config = obterConfigBanco({});

        expect(config.host).toBe('localhost');
        expect(config.port).toBe(3306);
        expect(config.database).toBe('GPAcademy_DB');
    });
});
