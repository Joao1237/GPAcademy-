let filtroStatus = "Todos";
let filtroCurso = "Todos";
let cardSelecionado = null;
let filtrosInicializados = false;

const {
    idsIguais,
    calcularStatusProjeto,
    obterClasseStatus,
    statusPassaNoFiltro
} = ProjetoStatus;

window.onload = function() {
    carregarUsuarioTopo();
    carregarProjetosAdmin();
};

async function carregarProjetosAdmin() {
    const container = document.getElementById("cardsProjetos");

    try {
        const projetos = await buscarJson(`${API_URL}/projetos`);
        const entregas = await buscarJson(`${API_URL}/entregas`, []);

        container.innerHTML = "";

        if (projetos.length === 0) {
            container.innerHTML = "<p>Nenhum projeto cadastrado.</p>";
            return;
        }

        projetos.forEach(projeto => {

            const entregasDoProjeto = entregas.filter(
                entrega => idsIguais(entrega.projeto_id, projeto.id)
            );

            const statusProjeto = calcularStatusProjeto(
                entregasDoProjeto,
                projeto.status,
                "Recebidos"
            );

            projeto.temRecebido = statusProjeto.temRecebido;
            projeto.temAvaliado = statusProjeto.temAvaliado;
            projeto.statusCalculado = statusProjeto.statusCalculado;

            criarCardProjeto(projeto);
        });

        montarFiltrosCursos();
        configurarFiltros();
        aplicarFiltros();

    } catch (erro) {
        console.log(erro);
        container.innerHTML = "<p>Erro ao carregar projetos.</p>";
    }
}

async function buscarJson(url, valorPadrao) {
    try {
        const resposta = await fetch(url);
        const dados = await resposta.json();

        if (!resposta.ok) {
            throw new Error(dados.mensagem || "Erro ao buscar dados.");
        }

        return dados;
    } catch (erro) {
        if (valorPadrao !== undefined) {
            console.warn("Falha em busca opcional:", url, erro);
            return valorPadrao;
        }

        throw erro;
    }
}

function criarCardProjeto(projeto) {
    const container = document.getElementById("cardsProjetos");

    const status = projeto.statusCalculado || projeto.status || "Publicado";
    const curso = projeto.nomeCurso || `Curso ${projeto.curso_id}`;
    const tipo = projeto.tipoEntrega === "grupo" ? "Grupo" : "Individual";

    const dataPrazo = new Date(projeto.prazo);
    const prazoFormatado = dataPrazo.toLocaleDateString("pt-BR");

    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = projeto.id;

    card.dataset.status = status;
    card.dataset.curso = curso;
    card.dataset.temRecebido = projeto.temRecebido ? "true" : "false";
    card.dataset.temAvaliado = projeto.temAvaliado ? "true" : "false";

    card.innerHTML = `
        <div class="card-top">
            <span class="status ${obterClasseStatus(status)}">
                ${status}
            </span>

            <button class="dots" onclick="abrirMenuCard(event, this)">
                ⋮
            </button>
        </div>

        <p class="date">
        📚 Matéria: ${projeto.materia || "Não informada"}
        </p>

        <h2>${projeto.titulo}</h2>

        <p class="date">
            📅 Prazo: ${prazoFormatado}
        </p>

        <p class="date">
            Tipo: ${tipo}
        </p>

        <div class="card-footer">
            <span>${curso} • ${projeto.periodo}º Período</span>
            <div class="avatar">
                ${projeto.professor_id || "P"}
            </div>
        </div>
    `;

    container.appendChild(card);
}

function montarFiltrosCursos() {
    const filtroCursos = document.getElementById("filtrosCursos");

    if (!filtroCursos) {
        return;
    }

    const cards = document.querySelectorAll(".card");
    const cursos = [];

    cards.forEach(card => {
        const curso = card.dataset.curso;

        if (curso && !cursos.includes(curso)) {
            cursos.push(curso);
        }
    });

    filtroCursos.innerHTML = `
        <strong>CURSO</strong>
        <button class="active-filter">Todos</button>
    `;

    cursos.forEach(curso => {
        const botao = document.createElement("button");
        botao.textContent = curso;
        filtroCursos.appendChild(botao);
    });
}

function configurarFiltros() {
    const gruposFiltros = document.querySelectorAll(".filters");

    gruposFiltros.forEach(grupo => {
        if (grupo.dataset.filtrosConfigurados === "true") {
            return;
        }

        grupo.dataset.filtrosConfigurados = "true";
        const tipoFiltro = grupo.querySelector("strong").textContent.trim();

        grupo.addEventListener("click", event => {
            const botao = event.target.closest("button");

            if (!botao || !grupo.contains(botao)) {
                return;
            }

            grupo
                .querySelectorAll("button")
                .forEach(btn => btn.classList.remove("active-filter"));

            botao.classList.add("active-filter");

            if (tipoFiltro === "STATUS") {
                filtroStatus = botao.textContent.trim();
            }

            if (tipoFiltro === "CURSO") {
                filtroCurso = botao.textContent.trim();
            }

            aplicarFiltros();
        });
    });
}

function aplicarFiltros() {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const cursoCard = card.dataset.curso;

        const dadosCard = {
            temRecebido: card.dataset.temRecebido,
            temAvaliado: card.dataset.temAvaliado,
            status: card.dataset.status,
            curso: cursoCard
        };

        const statusOk = statusPassaNoFiltro(dadosCard, filtroStatus);

        const cursoOk =
            filtroCurso === "Todos" || cursoCard === filtroCurso;

        card.style.display =
            statusOk && cursoOk ? "flex" : "none";
    });
}

function abrirMenuCard(event, botao) {
    removerMenus();

    const menu = document.createElement("div");
    menu.classList.add("menu-acoes");

    menu.innerHTML = `
        <button class="delete-btn">
            🗑️ Excluir Projeto
        </button>
    `;

    document.body.appendChild(menu);

    const posicao = botao.getBoundingClientRect();

    menu.style.top = posicao.bottom + window.scrollY + "px";
    menu.style.left = posicao.left + "px";

    menu.querySelector(".delete-btn").addEventListener("click", () => {
        abrirDeleteModal(botao.closest(".card"));
        removerMenus();
    });

    event.stopPropagation();
}

function removerMenus() {
    document.querySelectorAll(".menu-acoes").forEach(menu => {
        menu.remove();
    });
}

document.addEventListener("click", () => {
    removerMenus();
});

function abrirDeleteModal(card) {
    cardSelecionado = card;
    document.getElementById("deleteModal").style.display = "flex";
}

function fecharDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}

async function confirmarDelete() {

    const projetoId =
        cardSelecionado.dataset.id;

    try {

        const resposta =
            await fetch(
                `${API_URL}/projetos/${projetoId}`, {
                    method: "DELETE"
                }
            );

        const dados =
            await resposta.json();

        if (!resposta.ok) {
            alert(
                dados.mensagem ||
                "Erro ao excluir projeto."
            );
            return;
        }

        cardSelecionado.remove();
        cardSelecionado = null;

        fecharDeleteModal();

    } catch (erro) {

        console.log(erro);

        alert(
            "Erro ao conectar com o servidor."
        );
    }
}

function logout() {
    document.getElementById("logoutModal").style.display = "flex";
}

function fecharModal() {
    document.getElementById("logoutModal").style.display = "none";
}

function confirmarLogout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

function carregarUsuarioTopo() {
    const usuarioLogado =
        JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("nomeUsuario").textContent =
        usuarioLogado.nome;

    document.getElementById("tipoUsuario").textContent =
        usuarioLogado.tipo;
}
