/**
 * Health Check - Valida conexão com o backend
 * Este script pode ser incluído em todas as páginas para monitorar a conexão
 */

async function checkBackendHealth() {
    try {
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('✓ Backend conectado:', data);
            return { success: true, data };
        } else {
            console.warn('✗ Backend retornou status:', response.status);
            return { success: false, status: response.status };
        }
    } catch (error) {
        console.error('✗ Erro ao conectar com backend:', error.message);
        return { success: false, error: error.message };
    }
}

// Função auxiliar para testar todas as conexões
async function runHealthCheck() {
    console.log('🔍 Iniciando health check...');
    console.log('API_URL:', API_URL);

    const result = await checkBackendHealth();

    if (result.success) {
        console.log('✓ Conexão OK!');
    } else {
        console.error('✗ Problema na conexão');
        // Mostrar alerta visual se necessário
        if (document.body) {
            const banner = document.createElement('div');
            banner.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #f44336;
                color: white;
                padding: 10px;
                text-align: center;
                z-index: 9999;
                font-weight: bold;
            `;
            banner.textContent = '⚠️ Não conseguiu conectar ao servidor. Verifique sua conexão.';
            document.body.insertBefore(banner, document.body.firstChild);
        }
    }

    return result;
}

// Executar health check quando a página carregar (opcional)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        // Descomentar abaixo para executar automaticamente
        // runHealthCheck();
    });
} else {
    // Página já carregou
    // runHealthCheck();
}