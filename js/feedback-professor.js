let entregaAtual = null;

window.onload = function() {
    carregarEntrega();
};

// Carrega a entrega selecionada para avaliação
async function carregarEntrega() {
    const entregaId = localStorage.getItem("entregaSelecionada");
    const projetoId = localStorage.getItem("projetoSelecionadoProfessor");
    const tipoFeedback = localStorage.getItem("tipoFeedback");

    const infoEntrega = document.getElementById("infoEntrega");

    try {
        const url = obterUrlEntregas(tipoFeedback, projetoId);

        const resposta = await fetch(url);
        const entregas = await resposta.json();

        entregaAtual = encontrarEntrega(entregas, entregaId, tipoFeedback);

        if (!entregaAtual) {
            infoEntrega.innerHTML = "<p>Entrega não encontrada.</p>";
            return;
        }

        mostrarDadosEntrega(tipoFeedback);
        document.querySelector(".arquivo-box h3").textContent =
            entregaAtual.arquivo;

    } catch (erro) {
        console.error("Erro ao carregar entrega:", erro);
        infoEntrega.innerHTML = "<p>Erro ao carregar entrega.</p>";
    }
}

// Define a rota correta de acordo com o tipo de feedback
function obterUrlEntregas(tipoFeedback, projetoId) {
    if (tipoFeedback === "grupo") {
        return `${API_URL}/entregas/grupo/projeto/${projetoId}`;
    }

    return `${API_URL}/entregas/projeto/${projetoId}`;
}

// Encontra a entrega selecionada na lista recebida da API
function encontrarEntrega(entregas, entregaId, tipoFeedback) {
    if (tipoFeedback === "grupo") {
        return entregas.find(entrega => entrega.entrega_id == entregaId);
    }

    return entregas.find(entrega => entrega.id == entregaId);
}

// Exibe os dados da entrega na tela
function mostrarDadosEntrega(tipoFeedback) {
    const infoEntrega = document.getElementById("infoEntrega");

    const dataEntrega = new Date(entregaAtual.dataEntrega);
    const dataFormatada = dataEntrega.toLocaleDateString("pt-BR");

    if (tipoFeedback === "grupo") {
        infoEntrega.innerHTML = `
            <p><strong>Grupo:</strong> ${entregaAtual.nomeGrupo}</p>
            <p><strong>Integrantes:</strong> ${entregaAtual.integrantes}</p>
            <p><strong>Arquivo:</strong> ${entregaAtual.arquivo}</p>
            <p><strong>Status:</strong> ${entregaAtual.status}</p>
            <p><strong>Data de Envio:</strong> ${dataFormatada}</p>
        `;
        return;
    }

    infoEntrega.innerHTML = `
        <p><strong>Aluno:</strong> ${entregaAtual.nomeAluno}</p>
        <p><strong>Arquivo:</strong> ${entregaAtual.arquivo}</p>
        <p><strong>Status:</strong> ${entregaAtual.status}</p>
        <p><strong>Data de Envio:</strong> ${dataFormatada}</p>
    `;
}

// Envia o feedback do professor
async function enviarFeedback() {
    const feedback = document.getElementById("feedback").value;
    const erro = document.getElementById("erroFeedback");

    if (feedback === "") {
        erro.style.display = "block";
        erro.textContent = "Digite o feedback antes de enviar.";
        return;
    }

    erro.style.display = "none";

    try {
        const idEntrega = entregaAtual.entrega_id || entregaAtual.id;

        const resposta = await fetch(`${API_URL}/entregas/feedback`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                id: idEntrega,
                feedback
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            erro.style.display = "block";
            erro.textContent = dados.mensagem || "Erro ao salvar feedback.";
            return;
        }

        document.getElementById("successModal").style.display = "flex";

    } catch (erroServidor) {
        console.error("Erro ao enviar feedback:", erroServidor);

        erro.style.display = "block";
        erro.textContent = "Erro de conexão com o servidor.";
    }
}

// Abre o arquivo enviado
function visualizarArquivo() {
    const url = `${API_URL}/uploads/` + entregaAtual.arquivo;
    window.open(url, "_blank");
}

// Volta para o dashboard após sucesso
function fecharSucesso() {
    window.location.href = "dashboard-professor.html";
}

// Volta para a lista de entregas
function voltar() {
    window.location.href = "lista-entregas-professor.html";
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