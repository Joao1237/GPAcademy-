function obterConfigBanco(env = process.env) {
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
