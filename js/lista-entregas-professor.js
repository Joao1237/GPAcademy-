window.onload = function() {
    carregarUsuarioTopo();
    carregarEntregas();
};

// Mostra no topo o nome e o tipo do professor logado
function carregarUsuarioTopo() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
    document.getElementById("tipoUsuario").textContent = usuarioLogado.tipo;
}

// Carrega entregas individuais ou em grupo
async function carregarEntregas() {
    const tipoEntrega = localStorage.getItem("tipoEntrega") || "individual";
    const projetoId = localStorage.getItem("projetoSelecionadoProfessor");

    const tbody = document.getElementById("tbodyEntregas");

    if (!projetoId) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6">Projeto não selecionado.</td>
            </tr>
        `;
        return;
    }

    if (tipoEntrega === "grupo") {
        await carregarEntregasGrupo(projetoId);
        return;
    }

    await carregarEntregasIndividuais(projetoId);
}

// Carrega as entregas individuais
async function carregarEntregasIndividuais(projetoId) {
    const tituloTabela = document.getElementById("tituloTabela");
    const thead = document.getElementById("theadEntregas");
    const tbody = document.getElementById("tbodyEntregas");

    tituloTabela.textContent = "Entregas Individuais";

    thead.innerHTML = `
        <tr>
            <th>Aluno</th>
            <th>Arquivo</th>
            <th>Data de envio</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    `;

    try {
        const resposta = await fetch(
            `${API_URL}/entregas/projeto/${projetoId}`
        );

        const entregas = await resposta.json();

        tbody.innerHTML = "";

        if (entregas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5">Nenhuma entrega enviada ainda.</td>
                </tr>
            `;
            return;
        }

        entregas.forEach(entrega => {
            tbody.appendChild(criarLinhaEntregaIndividual(entrega));
        });

    } catch (erro) {
        console.error("Erro ao carregar entregas:", erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="5">Erro ao carregar entregas.</td>
            </tr>
        `;
    }
}

// Cria uma linha da tabela para entrega individual
function criarLinhaEntregaIndividual(entrega) {
    const dataEntrega = new Date(entrega.dataEntrega);
    const dataFormatada = dataEntrega.toLocaleDateString("pt-BR");

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${entrega.nomeAluno}</td>
        <td>${entrega.arquivo}</td>
        <td>${dataFormatada}</td>

        <td>
            <span class="status enviado">
                ${entrega.status}
            </span>
        </td>

        <td class="acoes">
            <button
                onclick="visualizarEntrega('${entrega.arquivo}')"
                class="btn-view">
                Visualizar
            </button>

            <button
                onclick="avaliarEntrega(${entrega.id})"
                class="btn-primary">
                Avaliar
            </button>
        </td>
    `;

    return tr;
}

// Carrega as entregas em grupo
async function carregarEntregasGrupo(projetoId) {
    const tituloTabela = document.getElementById("tituloTabela");
    const thead = document.getElementById("theadEntregas");
    const tbody = document.getElementById("tbodyEntregas");

    tituloTabela.textContent = "Entregas em Grupo";

    thead.innerHTML = `
        <tr>
            <th>Grupo</th>
            <th>Integrantes</th>
            <th>Arquivo</th>
            <th>Data de envio</th>
            <th>Status</th>
            <th>Ações</th>
        </tr>
    `;

    try {
        const resposta = await fetch(
            `${API_URL}/entregas/grupo/projeto/${projetoId}`
        );

        const entregas = await resposta.json();

        tbody.innerHTML = "";

        if (entregas.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="6">Nenhum grupo encontrado.</td>
                </tr>
            `;
            return;
        }

        entregas.forEach(entrega => {
            tbody.appendChild(criarLinhaEntregaGrupo(entrega));
        });

    } catch (erro) {
        console.error("Erro ao carregar entregas em grupo:", erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="6">Erro ao carregar entregas em grupo.</td>
            </tr>
        `;
    }
}

// Cria uma linha da tabela para entrega em grupo
function criarLinhaEntregaGrupo(entrega) {
    const dataFormatada = entrega.dataEntrega ?
        new Date(entrega.dataEntrega).toLocaleDateString("pt-BR") :
        "---";

    const status = entrega.status || "PENDENTE";
    const arquivo = entrega.arquivo || "---";

    const statusClasse =
        status === "ENVIADO" || status === "AVALIADO" ?
        "enviado" :
        "pendente";

    const tr = document.createElement("tr");

    tr.innerHTML = `
        <td>${entrega.nomeGrupo}</td>
        <td>${entrega.integrantes}</td>
        <td>${arquivo}</td>
        <td>${dataFormatada}</td>

        <td>
            <span class="status ${statusClasse}">
                ${status}
            </span>
        </td>

        <td class="acoes">
            ${entrega.arquivo
                ? `
                    <button
                        onclick="visualizarEntrega('${entrega.arquivo}')"
                        class="btn-view">
                        Visualizar
                    </button>

                    <button
                        onclick="avaliarEntregaGrupo(${entrega.entrega_id})"
                        class="btn-primary">
                        Avaliar
                    </button>
                `
                : `
                    <button class="btn-disabled">
                        Sem envio
                    </button>
                `
            }
        </td>
    `;

    return tr;
}

// Abre o arquivo enviado pelo aluno ou grupo
function visualizarEntrega(arquivo) {
    const url = `${API_URL}/uploads/` + arquivo;
    window.open(url, "_blank");
}

// Vai para a tela de feedback individual
function avaliarEntrega(entregaId) {
    localStorage.setItem("entregaSelecionada", entregaId);
    localStorage.setItem("tipoFeedback", "individual");

    window.location.href = "feedback-professor.html";
}

// Vai para a tela de feedback em grupo
function avaliarEntregaGrupo(entregaId) {
    localStorage.setItem("entregaSelecionada", entregaId);
    localStorage.setItem("tipoFeedback", "grupo");

    window.location.href = "feedback-professor.html";
}

// Volta ao dashboard do professor
function voltar() {
    window.location.href = "dashboard-professor.html";
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