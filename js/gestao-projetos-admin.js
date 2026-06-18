let filtroStatus = "Todos";
let filtroCurso = "Todos";
let cardSelecionado = null;

function idsIguaisFallback(a, b) {
    return String(a) === String(b);
}

function calcularStatusProjetoFallback(entregas, statusProjeto, labelRecebido) {
    const temAvaliado = entregas.some(
        entrega => entrega.status === "AVALIADO"
    );

    const temRecebido = entregas.some(
        entrega => entrega.status === "ENVIADO"
    );

    return {
        temRecebido,
        temAvaliado,
        statusCalculado: temAvaliado ?
            "Avaliado" :
            temRecebido ? labelRecebido : statusProjeto || "Publicado"
    };
}

function obterClasseStatusFallback(status) {
    if (status === "Recebidos" || status === "Recebido") {
        return "recebido";
    }

    if (status === "Avaliado") {
        return "avaliado";
    }

    return (status || "Publicado").toLowerCase();
}

function statusPassaNoFiltroFallback(card, filtro) {
    if (filtro === "Todos") {
        return true;
    }

    if (filtro === "Recebidos" || filtro === "Recebido") {
        return card.temRecebido === "true" ||
            card.status === "Recebidos" ||
            card.status === "Recebido";
    }

    if (filtro === "Avaliado") {
        return card.temAvaliado === "true";
    }

    return card.status === filtro;
}

const projetoStatus = window.ProjetoStatus || {
    idsIguais: idsIguaisFallback,
    calcularStatusProjeto: calcularStatusProjetoFallback,
    obterClasseStatus: obterClasseStatusFallback,
    statusPassaNoFiltro: statusPassaNoFiltroFallback
};

const {
    idsIguais,
    calcularStatusProjeto,
    obterClasseStatus,
    statusPassaNoFiltro
} = projetoStatus;

document.addEventListener("DOMContentLoaded", function() {
    carregarUsuarioTopo();
    configurarAcoesFixas();
    configurarFiltros();
    carregarProjetosAdmin();
});

async function carregarProjetosAdmin() {
    const container = document.getElementById("cardsProjetos");
    renderizarMensagem(container, "Carregando projetos...");

    try {
        const projetos = await buscarJson(`${API_URL}/projetos`);
        const entregas = await buscarJson(`${API_URL}/entregas`, []);

        container.innerHTML = "";

        if (!Array.isArray(projetos)) {
            throw new Error("Resposta inválida ao buscar projetos.");
        }

        if (projetos.length === 0) {
            renderizarMensagem(container, "Nenhum projeto cadastrado.");
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
        renderizarMensagem(container, "Erro ao carregar projetos.");
    }
}

function renderizarMensagem(container, mensagem) {
    container.innerHTML = `<p class="sem-resultados-admin">${mensagem}</p>`;
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

    if (filtroCurso !== "Todos" && !cursos.includes(filtroCurso)) {
        filtroCurso = "Todos";
    }

    filtroCursos.innerHTML = `
        <strong>CURSO</strong>
        <button
            type="button"
            data-value="Todos"
            class="${filtroCurso === "Todos" ? "active-filter" : ""}">
            Todos
        </button>
    `;

    cursos.forEach(curso => {
        const botao = document.createElement("button");
        botao.type = "button";
        botao.textContent = curso;
        botao.dataset.value = curso;

        if (curso === filtroCurso) {
            botao.classList.add("active-filter");
        }

        filtroCursos.appendChild(botao);
    });
}

function configurarFiltros() {
    document.querySelectorAll(".filters").forEach(grupo => {
        atualizarFiltroAtivo(grupo);
    });
}

document.addEventListener("click", event => {
    const botao = event.target.closest(".filters button");

    if (!botao) {
        return;
    }

    const grupo = botao.closest(".filters");
    const tipoFiltro = grupo.dataset.filter;
    const valorFiltro = botao.dataset.value || botao.textContent.trim();

    if (tipoFiltro === "status") {
        filtroStatus = valorFiltro;
    }

    if (tipoFiltro === "curso") {
        filtroCurso = valorFiltro;
    }

    atualizarFiltroAtivo(grupo);
    aplicarFiltros();
});

function atualizarFiltroAtivo(grupo) {
    const tipoFiltro = grupo.dataset.filter;
    const valorAtual = tipoFiltro === "status" ? filtroStatus : filtroCurso;

    grupo.querySelectorAll("button").forEach(botao => {
        const valorBotao = botao.dataset.value || botao.textContent.trim();
        botao.classList.toggle("active-filter", valorBotao === valorAtual);
    });
}

function aplicarFiltros() {
    const cards = document.querySelectorAll(".card");
    let totalVisiveis = 0;

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

        const visivel = statusOk && cursoOk;

        card.style.display = visivel ? "" : "none";

        if (visivel) {
            totalVisiveis++;
        }
    });

    atualizarMensagemFiltros(totalVisiveis);
}

function atualizarMensagemFiltros(totalVisiveis) {
    const container = document.getElementById("cardsProjetos");
    let mensagem = document.getElementById("mensagemFiltrosProjetos");

    if (totalVisiveis > 0) {
        if (mensagem) {
            mensagem.remove();
        }

        return;
    }

    if (!mensagem) {
        mensagem = document.createElement("p");
        mensagem.id = "mensagemFiltrosProjetos";
        mensagem.className = "sem-resultados-admin";
        container.appendChild(mensagem);
    }

    mensagem.textContent = "Nenhum projeto encontrado com os filtros atuais.";
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

function configurarAcoesFixas() {
    const botaoLogout = document.getElementById("btnLogoutAdminProjetos");

    if (botaoLogout) {
        botaoLogout.addEventListener("click", event => {
            event.preventDefault();
            logout();
        });
    }
}

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
    const modal = document.getElementById("logoutModal");

    if (modal) {
        modal.style.display = "flex";
    }
}

function fecharModal() {
    const modal = document.getElementById("logoutModal");

    if (modal) {
        modal.style.display = "none";
    }
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

window.logout = logout;
window.fecharModal = fecharModal;
window.confirmarLogout = confirmarLogout;
window.abrirMenuCard = abrirMenuCard;
window.confirmarDelete = confirmarDelete;
window.fecharDeleteModal = fecharDeleteModal;
