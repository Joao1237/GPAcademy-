const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

function obterConfigBanco(env = process.env) {
    // fallback: se variáveis esperadas não estiverem em process.env,
    // tente carregar `backend/.env` explicitamente (útil ao iniciar via npm --prefix)
    const possuiConfigBanco =
        env.DB_HOST ||
        env.DB_USER ||
        env.MYSQLHOST ||
        env.MYSQLUSER ||
        env.MYSQL_URL ||
        env.MYSQL_PUBLIC_URL ||
        env.DATABASE_URL;

    if (!possuiConfigBanco) {
        try {
            const envPath = path.join(__dirname, '..', '.env');
            if (fs.existsSync(envPath)) {
                const parsed = dotenv.parse(fs.readFileSync(envPath));
                env = Object.assign({}, parsed, env);
            }
        } catch (e) {
            // ignore fallback errors
        }
    }
    const urlBanco =
        env.MYSQL_URL ||
        env.MYSQL_PUBLIC_URL ||
        env.DATABASE_URL;

    if (urlBanco && urlBanco.startsWith('mysql')) {
        const url = new URL(urlBanco);

        return {
            host: url.hostname,
            port: Number(url.port) || 3306,
            user: decodeURIComponent(url.username),
            password: decodeURIComponent(url.password),
            database: url.pathname.replace(/^\//, '')
        };
    }

    return {
        host: env.DB_HOST || env.MYSQLHOST || 'localhost',
        user: env.DB_USER || env.MYSQLUSER || 'root',
        password: env.DB_PASSWORD || env.MYSQLPASSWORD || '',
        database: env.DB_NAME || env.MYSQLDATABASE || 'GPAcademy_DB',
        port: Number(env.DB_PORT || env.MYSQLPORT) || 3306
    };
}

module.exports = {
    obterConfigBanco
};
