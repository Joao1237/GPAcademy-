# GPAcademy

Sistema acadêmico para gestão de cursos, usuários, projetos e entregas de trabalhos. O projeto é dividido em:

- **Backend:** API REST em Node.js + Express + MySQL
- **Frontend:** páginas estáticas em HTML, CSS e JavaScript

## Estrutura do projeto

```
GPAcademy/
├── backend/              # API (Express)
│   ├── app.js            # Ponto de entrada do servidor
│   ├── config/           # Infraestrutura (banco e upload)
│   ├── routes/           # Camada de apresentação (rotas HTTP)
│   ├── controllers/      # Camada de apresentação (req/res)
│   ├── services/         # Camada de negócio (regras e validações)
│   ├── repositories/     # Camada de dados (acesso ao MySQL)
│   ├── utils/
│   └── uploads/          # Arquivos enviados pelos alunos
├── frontend/             # Servidor estático do frontend
│   └── server.js
├── pages/                # Telas do sistema
├── js/                   # Scripts do frontend
└── CSS/                  # Estilos
```

## Arquitetura em camadas (backend)

O backend segue arquitetura em camadas:

| Camada | Pasta | Responsabilidade |
|--------|-------|------------------|
| Apresentação | `routes/`, `controllers/` | Receber requisições HTTP e devolver respostas |
| Negócio | `services/` | Validações, regras e orquestração entre entidades |
| Dados | `repositories/` | Consultas e persistência no MySQL |
| Infraestrutura | `config/` | Conexão com banco, upload de arquivos |

## Pré-requisitos

Antes de iniciar, instale:

| Ferramenta | Versão recomendada |
|------------|-------------------|
| [Node.js](https://nodejs.org/) | 18 ou superior |
| [MySQL](https://dev.mysql.com/downloads/) / MariaDB | 8 ou superior |
| Navegador moderno | Chrome, Firefox ou Edge |

## 1. Banco de dados (MySQL)

### Criar o banco

Acesse o MySQL e execute:

```sql
CREATE DATABASE GPAcademy_DB;
USE GPAcademy_DB;
```

### Criar as tabelas

O repositório não inclui um arquivo `.sql` pronto. Crie as tabelas abaixo com base na estrutura usada pela API:

```sql
CREATE TABLE cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    quantidadePeriodos INT NOT NULL
);

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    tipo ENUM('ADMINISTRADOR', 'PROFESSOR', 'ALUNO') NOT NULL,
    curso_id INT NULL,
    periodo INT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE professor_cursos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    professor_id INT NOT NULL,
    curso_id INT NOT NULL,
    periodo INT NOT NULL,
    FOREIGN KEY (professor_id) REFERENCES usuarios(id),
    FOREIGN KEY (curso_id) REFERENCES cursos(id)
);

CREATE TABLE projetos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT,
    materia VARCHAR(255),
    dataCriacao DATE,
    prazo DATE,
    status VARCHAR(50),
    publicado TINYINT(1),
    curso_id INT,
    periodo INT,
    tipoEntrega VARCHAR(50),
    professor_id INT NULL,
    FOREIGN KEY (curso_id) REFERENCES cursos(id),
    FOREIGN KEY (professor_id) REFERENCES usuarios(id)
);

CREATE TABLE grupos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    projeto_id INT NOT NULL,
    FOREIGN KEY (projeto_id) REFERENCES projetos(id)
);

CREATE TABLE participacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    grupo_id INT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
);

CREATE TABLE entregas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    projeto_id INT NOT NULL,
    grupo_id INT NULL,
    arquivo VARCHAR(255) NOT NULL,
    dataEntrega DATETIME,
    status VARCHAR(50) DEFAULT 'ENVIADO',
    feedback TEXT NULL,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id),
    FOREIGN KEY (projeto_id) REFERENCES projetos(id),
    FOREIGN KEY (grupo_id) REFERENCES grupos(id)
);
```

### Configurar a conexão

Copie o arquivo de exemplo e ajuste as variáveis:

```bash
cd backend
copy .env.example .env
```

Variáveis disponíveis:

> Em produção, o MySQL fica no **Railway** e a API no **Render**. Veja a seção [Deploy](#deploy-render--railway).

| Variável | Descrição |
|----------|-----------|
| `DB_HOST` / `MYSQLHOST` | Host do MySQL |
| `DB_PORT` / `MYSQLPORT` | Porta (padrão: 3306) |
| `DB_USER` / `MYSQLUSER` | Usuário do banco |
| `DB_PASSWORD` / `MYSQLPASSWORD` | Senha do banco |
| `DB_NAME` / `MYSQLDATABASE` | Nome do banco |
| `MYSQL_PUBLIC_URL` | URL pública do Railway (alternativa às variáveis acima) |
| `PORT` | Porta da API (padrão: 3000) |
| `FRONTEND_URL` | URLs do frontend permitidas no CORS (separadas por vírgula) |

## 2. Backend

### Instalar dependências

No terminal, entre na pasta do backend e instale os pacotes:

```bash
cd backend
npm install
```

Dependências principais:

- `express` — servidor HTTP
- `mysql2` — conexão com MySQL
- `cors` — permite requisições do frontend
- `multer` — upload de arquivos (PDF, DOC, DOCX)

### Iniciar a API

Ainda dentro da pasta `backend`:

```bash
node app.js
```

Ou:

```bash
npm start
```

Se tudo estiver correto, você verá:

```
Conectado ao banco GPAcademy_DB!
Servidor rodando na porta 3000
```

A API ficará disponível em `http://localhost:3000`.

Para testar, acesse no navegador:

```
http://localhost:3000
```

A resposta esperada é: `GPAcademy API funcionando!`

## 3. Frontend

As telas ficam em `pages/`, os scripts em `js/` e os estilos em `CSS/`. A URL da API é definida automaticamente por `js/config.js`:

- **Local:** `http://localhost:3000`
- **Vercel:** `/api` (proxy para o backend no Render)
- **Render / customizado:** variável `API_URL` no serviço web do frontend

> **Importante:** o backend precisa estar rodando antes de usar o sistema.

### Instalar dependências

No terminal, entre na pasta do frontend:

```bash
cd frontend
npm install
```

### Iniciar o frontend

Ainda dentro da pasta `frontend`:

```bash
npm start
```

O frontend ficará disponível em:

```
http://localhost:5500/pages/login.html
```

A rota raiz (`http://localhost:5500/`) redireciona automaticamente para a tela de login.

## Ordem recomendada para subir o projeto

1. Subir o MySQL e criar o banco `GPAcademy_DB`
2. Configurar `backend/config/db.js`
3. Instalar dependências do backend (`npm install` em `backend/`)
4. Iniciar a API (`npm start` em `backend/`)
5. Instalar dependências do frontend (`npm install` em `frontend/`)
6. Iniciar o frontend (`npm start` em `frontend/`)
7. Acessar `http://localhost:5500/pages/login.html`

## Perfis de usuário

O sistema possui três tipos de acesso:

| Tipo | Descrição |
|------|-----------|
| `ADMINISTRADOR` | Cadastro de usuários, cursos e gestão de projetos |
| `PROFESSOR` | Criação de projetos, acompanhamento e feedback |
| `ALUNO` | Visualização de projetos e envio de entregas |

Após o login, o usuário é redirecionado automaticamente para o dashboard correspondente.

## Upload de arquivos

Os arquivos enviados pelos alunos são salvos em `backend/uploads/` e servidos pela API em:

```
http://localhost:3000/uploads/<nome-do-arquivo>
```

Formatos aceitos: `.pdf`, `.doc`, `.docx`.

## Solução de problemas

| Problema | Possível causa |
|----------|----------------|
| `Erro ao conectar ao MySQL` | MySQL parado, credenciais incorretas ou Railway sem conexão pública habilitada |
| `Erro ao conectar com o servidor` no login | Backend não está rodando na porta 3000 |
| Página em branco ou CSS quebrado | Frontend não iniciado com `npm start` em `frontend/` |
| Erro ao enviar entrega | Pasta `backend/uploads/` sem permissão de escrita |

## Deploy (Render + Railway)

Arquitetura do projeto:

| Componente | Plataforma | Pasta |
|------------|------------|-------|
| MySQL | **Railway** | — |
| API + uploads | **Render** Web Service | `backend/` |
| Frontend | **Vercel** ou **Render** Web Service | raiz / `frontend/` |

### 1. MySQL no Railway

1. Acesse [railway.app](https://railway.app) e crie um projeto.
2. Clique em **+ New** → **Database** → **MySQL**.
3. Abra o serviço MySQL → aba **Variables** ou **Connect**.
4. Ative a **Public Networking** (necessário para o Render acessar o banco).
5. Copie a **`MYSQL_PUBLIC_URL`** ou as variáveis:
   - `MYSQLHOST`
   - `MYSQLPORT`
   - `MYSQLUSER`
   - `MYSQLPASSWORD`
   - `MYSQLDATABASE`
6. Conecte ao banco (Railway → **Connect** → Query) e execute o SQL de criação de tabelas da seção [Banco de dados](#1-banco-de-dados-mysql).

### 2. Backend no Render

1. Conecte o repositório no [Render](https://render.com).
2. Crie um **Blueprint** com o `render.yaml` **ou** um Web Service manual:
   - **Root Directory:** `backend`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
3. Configure as variáveis de ambiente no Render:

| Variável no Render | Valor (Railway) |
|--------------------|-----------------|
| `MYSQL_PUBLIC_URL` | Cole a URL pública do Railway **ou** use as variáveis abaixo |
| `DB_HOST` | `MYSQLHOST` |
| `DB_PORT` | `MYSQLPORT` |
| `DB_USER` | `MYSQLUSER` |
| `DB_PASSWORD` | `MYSQLPASSWORD` |
| `DB_NAME` | `MYSQLDATABASE` |
| `FRONTEND_URL` | `https://seu-app.vercel.app,https://gpacademy-web.onrender.com` |

> Basta definir `MYSQL_PUBLIC_URL` **ou** o conjunto `DB_*`. A API aceita os dois formatos.

4. Após o deploy, teste: `https://<sua-api>.onrender.com/health`

> **Uploads:** no plano free do Render, arquivos em `backend/uploads/` são efêmeros (podem sumir após reinício). Para produção real, migre para S3/Cloudinary.

### 3a. Frontend na Vercel

1. Importe o repositório na [Vercel](https://vercel.com).
2. **Root Directory:** raiz do projeto (não use subpasta).
3. **Framework Preset:** Other (site estático).
4. Edite `vercel.json` e substitua `SUBSTITUA-PELA-URL-DO-BACKEND.onrender.com` pela URL real da API.
5. Faça o deploy.

O frontend usará `/api` como base e o `vercel.json` fará proxy para o backend.

### 3b. Frontend no Render (alternativa)

1. Crie um Web Service com **Root Directory:** `frontend`.
2. **Build Command:** `npm install`
3. **Start Command:** `npm start`
4. Configure:

| Variável | Exemplo |
|----------|---------|
| `API_URL` | `https://gpacademy-api.onrender.com` |

O serviço gera `js/config.js` dinamicamente com a URL da API.

### Checklist pós-deploy

- [ ] MySQL criado no Railway com **Public Networking** ativo
- [ ] Tabelas criadas no banco Railway
- [ ] `/health` da API no Render responde `{ "status": "ok" }`
- [ ] Login funciona no frontend em produção
- [ ] `FRONTEND_URL` no Render inclui a URL exata do frontend (com `https://`)
- [ ] Upload e visualização de arquivos testados

## Testes unitários

Os testes cobrem a camada de **serviços do backend**, utilitários compartilhados e regras de **status/filtros do frontend** (`js/utils/`).

### Pré-requisito

Na raiz do projeto:

```bash
npm install
```

### Executar testes

```bash
# Todos os testes
npm test

# Com relatório de cobertura no terminal
npm run test:coverage

# Modo watch (reexecuta ao salvar arquivos)
npm run test:watch
```

### Capturar log dos testes

Para salvar a saída completa (resultado + cobertura) em arquivo:

```bash
npm run test:log
```

O log é gravado em `logs/testes.log`.

**PowerShell (alternativa manual):**

```powershell
npm run test:coverage -- --verbose 2>&1 | Tee-Object -FilePath logs/testes.log
```

**Git Bash / Linux / macOS:**

```bash
npm run test:coverage -- --verbose 2>&1 | tee logs/testes.log
```

### Relatório HTML de cobertura

Após `npm run test:coverage`, abra no navegador:

```
coverage/lcov-report/index.html
```

### O que é medido

| Área | Pasta |
|------|-------|
| Serviços (regras de negócio) | `backend/services/` |
| Utilitários da API | `backend/utils/`, `backend/config/dbConfig.js` |
| Status e filtros de projetos | `js/utils/` |

Meta mínima configurada: **80%** de statements/lines e **100%** de functions nos arquivos monitorados.

## Tecnologias utilizadas

**Backend:** Node.js, Express, MySQL2, Multer, CORS

**Frontend:** HTML5, CSS3, JavaScript (Fetch API, LocalStorage), Express (servidor estático)
