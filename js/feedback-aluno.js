let entregaAtual = null;

window.onload = function() {
    carregarFeedback();
};

// Carrega o feedback do projeto selecionado
async function carregarFeedback() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const commentBox = document.querySelector(".comment-box");

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/participacoes/aluno/${usuarioLogado.id}`
        );

        const projetos = await resposta.json();

        const projetoId = localStorage.getItem("projetoSelecionadoFeedback");

        const projetoAvaliado = projetos.find(
            projeto =>
            projeto.id == projetoId &&
            projeto.statusEntrega === "AVALIADO"
        );

        if (!projetoAvaliado) {
            commentBox.textContent = "Nenhum feedback disponível.";
            return;
        }

        let entregas = [];

        if (projetoAvaliado.tipoEntrega === "grupo") {

            const respostaEntregas = await fetch(
                `${API_URL}/entregas/grupo/projeto/${projetoAvaliado.id}`
            );

            entregas = await respostaEntregas.json();

            entregaAtual = entregas.find(
                entrega => entrega.grupo_id == projetoAvaliado.grupo_id
            );

        } else {

            const respostaEntregas = await fetch(
                `${API_URL}/entregas/projeto/${projetoAvaliado.id}`
            );

            entregas = await respostaEntregas.json();

            entregaAtual = entregas.find(
                entrega => entrega.usuario_id === usuarioLogado.id
            );
        }

        if (!entregaAtual) {
            commentBox.textContent = "Entrega não encontrada.";
            return;
        }

        preencherFeedbackNaTela(projetoAvaliado);

    } catch (erro) {
        console.error("Erro ao carregar feedback:", erro);
        commentBox.textContent = "Erro ao carregar feedback.";
    }
}

// Preenche os dados na tela
function preencherFeedbackNaTela(projetoAvaliado) {

    document.querySelector(".title").textContent =
        "Feedback do Professor";

    document.querySelector(".feedback-card h2").textContent =
        projetoAvaliado.titulo;

    document.querySelector(".file-box h3").textContent =
        entregaAtual.arquivo;

    const data = new Date(entregaAtual.dataEntrega);

    document.querySelector(".file-box p").textContent =
        "Enviado em: " +
        data.toLocaleDateString("pt-BR");

    document.querySelector(".comment-box").textContent =
        entregaAtual.feedback || "Sem feedback.";
}

// Volta para o dashboard
function voltar() {
    window.location.href = "dashboard-aluno.html";
}

// Abre modal de logout
function logout() {
    document.getElementById("logoutModal").style.display = "flex";
}

// Fecha modal de logout
function fecharModal() {
    document.getElementById("logoutModal").style.display = "none";
}

// Confirma logout
function confirmarLogout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}