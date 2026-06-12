let projetoAtual = null;

window.onload = function() {
    carregarUsuarioTopo();
    carregarProjeto();
};

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

// Exibe modal de erro
function mostrarModalErro(mensagem) {
    document.getElementById("errorMessage").textContent = mensagem;
    document.getElementById("errorModal").style.display = "flex";
}

// Fecha modal de erro
function fecharModalErro() {
    document.getElementById("errorModal").style.display = "none";
}

// Carrega os dados do projeto selecionado
async function carregarProjeto() {
    const projetoId = localStorage.getItem("projetoSelecionado");
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    try {
        const resposta = await fetch(
            `${API_URL}/participacoes/aluno/${usuarioLogado.id}`
        );

        const projetos = await resposta.json();

        projetoAtual = projetos.find(projeto => projeto.id == projetoId);

        if (!projetoAtual) {
            mostrarModalErro("Projeto não encontrado.");
            return;
        }

        preencherDadosProjeto();

    } catch (erro) {
        console.error("Erro ao carregar projeto:", erro);
        mostrarModalErro("Erro ao carregar projeto.");
    }
}

// Preenche os dados do projeto na tela
function preencherDadosProjeto() {
    document.getElementById("tituloProjeto").textContent =
        projetoAtual.titulo;

    document.getElementById("materiaProjeto").textContent =
        projetoAtual.materia || "Não informada";

    document.getElementById("descricaoProjeto").textContent =
        projetoAtual.descricao;

    document.getElementById("periodoProjeto").textContent =
        `${projetoAtual.periodo}º Período`;

    const dataPrazo = new Date(projetoAtual.prazo);

    document.getElementById("prazoProjeto").textContent =
        dataPrazo.toLocaleDateString("pt-BR");
}

// Envia o arquivo do trabalho
async function enviarProjeto() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const arquivoInput = document.getElementById("arquivo");

    if (arquivoInput.files.length === 0) {
        mostrarModalErro("Selecione um arquivo.");
        return;
    }

    const formData = montarFormDataEntrega(
        usuarioLogado.id,
        projetoAtual,
        arquivoInput.files[0]
    );

    try {
        const resposta = await fetch(`${API_URL}/entregas`, {
            method: "POST",
            body: formData
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarModalErro(dados.mensagem || "Erro ao enviar entrega.");
            return;
        }

        document.getElementById("successModal").style.display = "flex";

    } catch (erro) {
        console.error("Erro ao enviar entrega:", erro);
        mostrarModalErro("Erro ao enviar entrega.");
    }
}

// Monta os dados enviados para o backend
function montarFormDataEntrega(usuarioId, projeto, arquivo) {
    const formData = new FormData();

    formData.append("usuario_id", usuarioId);
    formData.append("projeto_id", projeto.id);
    formData.append("grupo_id", projeto.grupo_id || "");
    formData.append("arquivo", arquivo);

    return formData;
}

// Volta para o dashboard do aluno
function voltar() {
    window.location.href = "dashboard-aluno.html";
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

// Fecha o modal de sucesso após enviar trabalho
function fecharModalSucesso() {
    document.getElementById("successModal").style.display = "none";
    window.location.href = "dashboard-aluno.html";
}