(function() {
let filtroStatus = "Todos";
let filtroTipo = "Todos";
let filtroPeriodo = "Todos";
let cardSelecionado = null;
let filtrosInicializados = false;

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

// Carrega os dados principais da tela
document.addEventListener("DOMContentLoaded", function() {
    carregarUsuarioTopo();
    carregarProjetosProfessor();
});

// Mostra o nome e o tipo do usuário logado no topo
function carregarUsuarioTopo() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
    document.getElementById("tipoUsuario").textContent = usuarioLogado.tipo;
}

// Abre a tela de criação de projeto
function novoProjeto() {
    window.location.href = "novo-projeto.html";
}

window.novoProjeto = novoProjeto;

// Carrega os projetos criados pelo professor logado
async function carregarProjetosProfessor() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const container = document.querySelector(".cards");

    if (!usuarioLogado || usuarioLogado.tipo !== "PROFESSOR") {
        window.location.href = "login.html";
        return;
    }

    try {
        const respostaProjetos = await fetch(`${API_URL}/projetos`);
        const projetos = await respostaProjetos.json();

        const respostaEntregas = await fetch(`${API_URL}/entregas`);
        const entregas = await respostaEntregas.json();

        const respostaVinculos = await fetch(
            `${API_URL}/professor-cursos/${usuarioLogado.id}`
        );
        const vinculos = await respostaVinculos.json();

        gerarFiltrosPeriodos(vinculos);
        configurarFiltros();

        container.innerHTML = "";

        const projetosFiltrados = projetos.filter(
            projeto => idsIguais(projeto.professor_id, usuarioLogado.id)
        );

        if (projetosFiltrados.length === 0) {
            container.innerHTML = "<p>Nenhum projeto encontrado.</p>";
            return;
        }

        projetosFiltrados.forEach(projeto => {
            const entregasDoProjeto = entregas.filter(
                entrega => idsIguais(entrega.projeto_id, projeto.id)
            );

            const statusProjeto = calcularStatusProjeto(
                entregasDoProjeto,
                projeto.status,
                "Recebido"
            );

            projeto.temRecebido = statusProjeto.temRecebido;
            projeto.temAvaliado = statusProjeto.temAvaliado;
            projeto.statusCalculado = statusProjeto.statusCalculado;

            const vinculo = vinculos.find(v =>
                v.curso_id === projeto.curso_id &&
                v.periodo === projeto.periodo
            );

            criarCardProjeto(
                projeto,
                vinculo ? vinculo.nomeCurso : "Curso não informado"
            );
        });

        aplicarFiltros();

    } catch (erro) {
        console.error("Erro ao carregar projetos:", erro);
        container.innerHTML = "<p>Erro ao carregar projetos.</p>";
    }
}

// Cria visualmente o card de cada projeto
function criarCardProjeto(projeto, nomeCurso) {
    const container = document.querySelector(".cards");

    const tipoFormatado =
        projeto.tipoEntrega === "grupo" ? "Grupo" : "Individual";

    const periodoFormatado = `${projeto.periodo}º Período`;
    const statusFormatado = projeto.statusCalculado || projeto.status || "Publicado";

    const dataPrazo = new Date(projeto.prazo);
    const prazoFormatado = dataPrazo.toLocaleDateString("pt-BR");

    const card = document.createElement("div");
    card.classList.add("card");

    card.dataset.id = projeto.id;
    card.dataset.status = statusFormatado;
    card.dataset.temRecebido = projeto.temRecebido ? "true" : "false";
    card.dataset.temAvaliado = projeto.temAvaliado ? "true" : "false";
    card.dataset.tipo = tipoFormatado;
    card.dataset.periodo = periodoFormatado;

    card.innerHTML = `
        <button class="dots" onclick="abrirMenuCard(event, this)">⋮</button>

        <div class="tags">
            <span class="status ${obterClasseStatus(statusFormatado)}">${statusFormatado}</span>
            <span class="tag curso">${nomeCurso}</span>
            <span class="tag periodo">${periodoFormatado}</span>

            <span class="tag ${projeto.tipoEntrega === "grupo" ? "tipo-grupo" : "tipo-individual"}">
                ${tipoFormatado}
            </span>
        </div>

        <p class="date">
            📚 Matéria: ${projeto.materia || "Não informada"}
        </p>

        <h2>${projeto.titulo}</h2>

        <div class="line"></div>

        <p class="date">
            📅 Prazo: ${prazoFormatado}
        </p>

        <button
            onclick="${projeto.tipoEntrega === "grupo"
                ? `verEntregasGrupo(${projeto.id})`
                : `verEntregasIndividuais(${projeto.id})`
            }"
            class="btn-card">
            ${projeto.tipoEntrega === "grupo"
                ? "Ver Entregas em Grupo"
                : "Ver Entregas Individuais"
            }
        </button>
    `;

    container.appendChild(card);
}

// Abre a lista de entregas individuais
function verEntregasIndividuais(projetoId) {
    localStorage.setItem("projetoSelecionadoProfessor", projetoId);
    localStorage.setItem("tipoEntrega", "individual");

    window.location.href = "lista-entregas-professor.html";
}

// Abre a lista de entregas em grupo
function verEntregasGrupo(projetoId) {
    localStorage.setItem("projetoSelecionadoProfessor", projetoId);
    localStorage.setItem("tipoEntrega", "grupo");

    window.location.href = "lista-entregas-professor.html";
}

// Configura os botões de filtro da tela
function configurarFiltros() {
    if (filtrosInicializados) {
        return;
    }

    filtrosInicializados = true;

    const gruposFiltros = document.querySelectorAll(".filters");

    gruposFiltros.forEach(grupo => {
        const botoes = grupo.querySelectorAll("button");
        const tipoFiltro = grupo.querySelector("strong").textContent.trim();

        botoes.forEach(botao => {
            botao.addEventListener("click", () => {
                botoes.forEach(btn => btn.classList.remove("active-filter"));
                botao.classList.add("active-filter");

                if (tipoFiltro === "STATUS") {
                    filtroStatus = botao.textContent.trim();
                }

                if (tipoFiltro === "TIPO") {
                    filtroTipo = botao.textContent.trim();
                }

                if (tipoFiltro === "PERÍODO") {
                    filtroPeriodo = botao.textContent.trim();
                }

                aplicarFiltros();
            });
        });
    });
}

// Aplica os filtros selecionados nos cards
function aplicarFiltros() {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        const dadosCard = {
            temRecebido: card.dataset.temRecebido,
            temAvaliado: card.dataset.temAvaliado,
            status: card.dataset.status,
            tipo: card.dataset.tipo,
            periodo: card.dataset.periodo
        };

        const statusOk = statusPassaNoFiltro(dadosCard, filtroStatus);

        const tipoOk =
            filtroTipo === "Todos" || card.dataset.tipo === filtroTipo;

        const periodoOk =
            filtroPeriodo === "Todos" || card.dataset.periodo === filtroPeriodo;

        card.style.display =
            statusOk && tipoOk && periodoOk ? "flex" : "none";
    });
}

// Gera o filtro de períodos de acordo com os vínculos do professor
function gerarFiltrosPeriodos(vinculos) {
    const filtroPeriodos = document.getElementById("filtroPeriodos");

    filtroPeriodos.innerHTML = `
        <strong>PERÍODO</strong>
        <button class="active-filter">Todos</button>
    `;

    const periodosUnicos = [];

    vinculos.forEach(vinculo => {
        if (!periodosUnicos.includes(vinculo.periodo)) {
            periodosUnicos.push(vinculo.periodo);
        }
    });

    periodosUnicos.sort((a, b) => a - b);

    periodosUnicos.forEach(periodo => {
        const botao = document.createElement("button");

        botao.textContent = `${periodo}º Período`;
        filtroPeriodos.appendChild(botao);
    });
}

// Abre o menu dos três pontinhos do card
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

// Remove menus abertos
function removerMenus() {
    document.querySelectorAll(".menu-acoes").forEach(menu => {
        menu.remove();
    });
}

document.addEventListener("click", removerMenus);

// Abre o modal de exclusão
function abrirDeleteModal(card) {
    cardSelecionado = card;
    document.getElementById("deleteModal").style.display = "flex";
}

// Fecha o modal de exclusão
function fecharDeleteModal() {
    document.getElementById("deleteModal").style.display = "none";
}

// Exclui o projeto selecionado
async function confirmarDelete() {
    if (!cardSelecionado) {
        return;
    }

    const projetoId = cardSelecionado.dataset.id;

    try {
        const resposta = await fetch(
            `${API_URL}/projetos/${projetoId}`,
            {
                method: "DELETE"
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || "Erro ao excluir projeto.");
            return;
        }

        cardSelecionado.remove();
        cardSelecionado = null;

        fecharDeleteModal();

    } catch (erro) {
        console.error("Erro ao excluir projeto:", erro);
        alert("Erro ao excluir projeto.");
    }
}

// Abre o modal de logout
function logout() {
    document.getElementById("logoutModal").style.display = "flex";
}

// Fecha o modal de logout
function fecharModal() {
    document.getElementById("logoutModal").style.display = "none";
}

// Confirma logout
function confirmarLogout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

window.verEntregasIndividuais = verEntregasIndividuais;
window.verEntregasGrupo = verEntregasGrupo;
window.abrirMenuCard = abrirMenuCard;
window.confirmarDelete = confirmarDelete;
window.fecharDeleteModal = fecharDeleteModal;
window.logout = logout;
window.fecharModal = fecharModal;
window.confirmarLogout = confirmarLogout;
})();
