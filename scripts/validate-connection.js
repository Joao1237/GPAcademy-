#!/usr/bin/env node

/**
 * Script para validar a conexão entre Frontend e Backend no Render
 * Uso: node validate-connection.js
 */

const https = require('https');
const http = require('http');

// URLs configuradas
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5500';
const BACKEND_URL = process.env.BACKEND_URL || 'https://gpacademy-nqca.onrender.com';

console.log('🔍 Iniciando validação de conexão...\n');
console.log(`Frontend URL: ${FRONTEND_URL}`);
console.log(`Backend URL: ${BACKEND_URL}\n`);

// Função para fazer requisição HTTP/HTTPS
function makeRequest(url, endpoint = '/health') {
    return new Promise((resolve, reject) => {
        const fullUrl = url.replace(/\/$/, '') + endpoint;
        const protocol = fullUrl.startsWith('https') ? https : http;

        const request = protocol.get(fullUrl, {
            timeout: 10000,
            headers: {
                'User-Agent': 'GPAcademy-HealthCheck/1.0'
            }
        }, (response) => {
            let data = '';

            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try {
                    const parsed = data ? JSON.parse(data) : { raw: data };
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        data: parsed
                    });
                } catch (e) {
                    resolve({
                        statusCode: response.statusCode,
                        headers: response.headers,
                        data: { raw: data }
                    });
                }
            });
        });

        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Timeout na requisição'));
        });
    });
}

async function validateConnections() {
    let allHealthy = true;

    // Testar Frontend
    console.log('📍 Testando Frontend...');
    try {
        const frontendHealth = await makeRequest(FRONTEND_URL, '/api/health');
        if (frontendHealth.statusCode === 200) {
            console.log('✓ Frontend OK');
            console.log(`  - Port: ${frontendHealth.data.frontend?.port || 'N/A'}`);
            console.log(`  - Environment: ${frontendHealth.data.frontend?.environment || 'N/A'}`);
            console.log(`  - Backend URL: ${frontendHealth.data.backend?.url}`);
            console.log(`  - Backend Configurado: ${frontendHealth.data.backend?.configured ? 'Sim' : 'Não'}\n`);
        } else {
            console.log(`✗ Frontend retornou status ${frontendHealth.statusCode}\n`);
            allHealthy = false;
        }
    } catch (error) {
        console.log(`✗ Erro ao conectar com Frontend: ${error.message}\n`);
        allHealthy = false;
    }

    // Testar Backend direto
    console.log('📍 Testando Backend (direto)...');
    try {
        const backendHealth = await makeRequest(BACKEND_URL, '/health');
        if (backendHealth.statusCode === 200) {
            console.log('✓ Backend OK');
            console.log(`  - Status: ${backendHealth.data.status}\n`);
        } else {
            console.log(`✗ Backend retornou status ${backendHealth.statusCode}\n`);
            allHealthy = false;
        }
    } catch (error) {
        console.log(`✗ Erro ao conectar com Backend: ${error.message}\n`);
        allHealthy = false;
    }

    // Testar conexão Frontend → Backend
    console.log('📍 Testando conexão Frontend → Backend...');
    try {
        const validation = await makeRequest(FRONTEND_URL, '/api/validate-backend');
        if (validation.statusCode === 200 && validation.data.success) {
            console.log('✓ Frontend conseguiu conectar com Backend!');
            console.log(`  - Backend Status: ${validation.data.connection}\n`);
        } else {
            console.log(`✗ Frontend não conseguiu conectar com Backend`);
            console.log(`  - Erro: ${validation.data.error}`);
            console.log(`  - Detalhes: ${validation.data.details}\n`);
            allHealthy = false;
        }
    } catch (error) {
        console.log(`✗ Erro ao testar ponte Frontend-Backend: ${error.message}\n`);
        allHealthy = false;
    }

    // Resultado final
    console.log('====================================');
    if (allHealthy) {
        console.log('✓ Todas as conexões estão OK!');
    } else {
        console.log('✗ Alguns problemas foram detectados');
        console.log('\nDicas de resolução:');
        console.log('1. Certifique-se de que ambos serviços estão em execução');
        console.log('2. Verifique se as URLs estão corretas');
        console.log('3. Verifique CORS no backend para aceitar requisições do frontend');
        console.log('4. Em Render, confirme que as variáveis de ambiente estão configuradas');
    }
    console.log('====================================\n');

    process.exit(allHealthy ? 0 : 1);
}

// Executar validação
validateConnections().catch(error => {
    console.error('Erro não esperado:', error);
    process.exit(1);
});