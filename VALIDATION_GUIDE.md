# Guia de Validação - Frontend e Backend Render

## Resumo das Melhorias

Este documento explica as melhorias implementadas para validar e facilitar a conexão entre Frontend e Backend no Render.

### ✓ O que foi feito:

1. **Atualizado `render.yaml`**
   - Adicionado valor fixo da URL do backend: `https://gpacademy-nqca.onrender.com`
   - Configurado `API_URL` no serviço web do frontend

2. **Melhorado `frontend/server.js`**
   - Adicionado endpoint `/api/health` para validar configuração do frontend
   - Adicionado endpoint `/api/validate-backend` para testar conexão com o backend
   - Melhorados logs de inicialização

3. **Criado `js/health-check.js`**
   - Script para validar conexão com o backend a partir das páginas
   - Função `checkBackendHealth()` para testes programáticos
   - Função `runHealthCheck()` para execução completa

4. **Criado `scripts/validate-connection.js`**
   - Script de linha de comando para testar a conexão
   - Testa Frontend, Backend e a ponte entre eles
   - Fornece diagnóstico detalhado de problemas

5. **Atualizado `package.json`**
   - Adicionado script: `npm run validate-connection`

---

## Como Usar

### Opção 1: Testar via Command Line

```bash
# Na raiz do projeto
npm run validate-connection
```

Este comando:
- Testa se o frontend está rodando
- Testa se o backend está acessível
- Testa se o frontend consegue conectar ao backend
- Exibe diagnóstico de qualquer problema

Exemplo de saída bem-sucedida:
```
🔍 Iniciando validação de conexão...

Frontend URL: http://localhost:5500
Backend URL: https://gpacademy-nqca.onrender.com

📍 Testando Frontend...
✓ Frontend OK
  - Port: 5500
  - Environment: development
  - Backend URL: http://localhost:3000
  - Backend Configurado: Sim

📍 Testando Backend (direto)...
✓ Backend OK
  - Status: ok

📍 Testando conexão Frontend → Backend...
✓ Frontend conseguiu conectar com Backend!
  - Backend Status: ok

====================================
✓ Todas as conexões estão OK!
====================================
```

### Opção 2: Testar no Navegador

#### 2a. Verificar configuração do frontend:
```
http://localhost:5500/api/health
```

Retorna:
```json
{
  "status": "ok",
  "frontend": {
    "port": 5500,
    "environment": "development"
  },
  "backend": {
    "url": "http://localhost:3000",
    "configured": true
  }
}
```

#### 2b. Testar conexão com o backend:
```
http://localhost:5500/api/validate-backend
```

Retorna (sucesso):
```json
{
  "success": true,
  "connection": "ok",
  "backend": {
    "status": 200,
    "backend": { "status": "ok" }
  }
}
```

Retorna (erro):
```json
{
  "success": false,
  "error": "Backend não está acessível",
  "details": "connect ECONNREFUSED 127.0.0.1:3000",
  "tried_url": "http://localhost:3000"
}
```

### Opção 3: Testar com JavaScript no Navegador

Após a página carregar, abra o console e execute:

```javascript
// Verificar se API_URL está configurada
console.log('API_URL:', API_URL);

// Testar conexão
checkBackendHealth().then(result => {
    console.log('Resultado:', result);
});
```

---

## Estrutura de Funcionamento

### Em Desenvolvimento (localhost):

```
Frontend (5500)
    ↓ injeta
    /js/config.js → API_URL = http://localhost:3000
    ↓
Backend (3000)
```

### Em Produção (Render):

```
Frontend (gpacademy-web.onrender.com)
    ↓ injeta via env var
    /js/config.js → API_URL = https://gpacademy-nqca.onrender.com
    ↓
Backend (gpacademy-nqca.onrender.com)
```

---

## Troubleshooting

### ❌ "Backend não está acessível"

**Possíveis causas:**
1. Backend não está rodando em desenvolvimento (`npm start` em `/backend`)
2. URL do backend está incorreta no `.env` ou `render.yaml`
3. Firewall ou proxy bloqueando a conexão
4. Em Render: variável `API_URL` não está configurada

**Solução:**
```bash
# Em desenvolvimento, certifique-se de ter ambos rodando:
# Terminal 1:
cd backend && npm start

# Terminal 2:
cd frontend && npm start

# Então teste:
npm run validate-connection
```

### ❌ "CORS error" ao fazer requisições

**Possível causa:**
O backend não aceita requisições do frontend

**Solução - verificar `backend/app.js`:**
```javascript
const origensPermitidas = process.env.FRONTEND_URL ?
    process.env.FRONTEND_URL.split(',').map(url => url.trim()) :
    true;

app.use(cors({
    origin: origensPermitidas,
    credentials: true
}));
```

No Render, configure `FRONTEND_URL` com as URLs permitidas:
```
https://gpacademy-web.onrender.com,https://seu-app.vercel.app
```

### ❌ "API_URL é /api" em produção

**Problema:**
O frontend está usando `/api` como fallback mas frontend e backend são serviços separados

**Solução:**
Certifique-se de que `API_URL` está configurado no `render.yaml`:
```yaml
envVars:
  - key: API_URL
    value: https://gpacademy-nqca.onrender.com
```

---

## Checklist de Deployment

- [ ] Backend URL atualizada em `render.yaml`
- [ ] `API_URL` configurada no Render para o serviço web do frontend
- [ ] `FRONTEND_URL` configurada no Render para o backend (CORS)
- [ ] `/health` endpoint acessível no backend
- [ ] Teste executado: `npm run validate-connection`
- [ ] Frontend acessível em produção
- [ ] Login funciona e consegue conectar com o backend

---

## Detalhes Técnicos

### Fluxo de Injeção de API_URL

1. Cliente acessa `https://frontend.onrender.com/pages/login.html`
2. HTML carrega `<script src="../js/config.js"></script>`
3. `frontend/server.js` intercepta a requisição
4. Lê variável de ambiente `API_URL`
5. Retorna JavaScript: `var API_URL = "https://backend.onrender.com";`
6. Scripts podem usar `API_URL` em fetch/axios

### Benefícios

- ✓ Sem build step desnecessário
- ✓ Configuração dinâmica por environment
- ✓ Sem commits de URLs hardcoded
- ✓ Mesma imagem pode rodar em dev/staging/prod

---

## Próximos Passos (Opcional)

Para melhor observabilidade em produção:

1. Adicionar logs de erro quando backend está indisponível
2. Implementar retry automático nas requisições
3. Cache de configuração no localStorage
4. Notificação visual quando conexão é restaurada
5. Metrics de uptime e latência

---

**Última atualização:** Junho 2026
