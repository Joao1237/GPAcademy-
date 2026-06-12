const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '..', 'logs');
const logFile = path.join(logsDir, 'testes.log');

if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

const comando = 'npx jest --coverage --verbose';

try {
    const saida = execSync(comando, {
        encoding: 'utf8',
        stdio: 'pipe',
        cwd: path.join(__dirname, '..')
    });

    process.stdout.write(saida);
    fs.writeFileSync(logFile, saida, 'utf8');
    console.log(`\nLog salvo em ${logFile}`);
} catch (erro) {
    const saida = erro.stdout || erro.stderr || erro.message;

    process.stdout.write(saida);
    fs.writeFileSync(logFile, saida, 'utf8');
    console.error(`\nTestes falharam. Log salvo em ${logFile}`);
    process.exit(erro.status || 1);
}
