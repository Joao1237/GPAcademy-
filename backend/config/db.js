require('dotenv').config();

const mysql = require('mysql2');
const { obterConfigBanco } = require('./dbConfig');

const pool = mysql.createPool({
    ...obterConfigBanco(),
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: true
});

pool.getConnection((erro, conexao) => {
    if (erro) {
        console.error('Erro ao conectar ao MySQL:', erro.message);
        return;
    }

    console.log('Conectado ao banco MySQL');
    conexao.release();
});

module.exports = pool;
