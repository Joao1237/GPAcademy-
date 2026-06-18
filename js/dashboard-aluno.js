window.onload = function() {
    carregarUsuarioTopo();
    carregarProjetosAluno();
};

// Mostra no topo o nome e o tipo do usuário logado
function carregarUsuarioTopo() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    document.getElementById("nomeUsuario").textContent = usuarioLogado.nome;
    document.getElementById("tipoUsuario").textContent = usuarioLogado.tipo;
}

// Carrega os projetos vinculados ao aluno logado
async function carregarProjetosAluno() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    const container = document.querySelector(".cards");
    const tipoUsuario = usuarioLogado && String(usuarioLogado.tipo).toUpperCase();

    if (!usuarioLogado || tipoUsuario !== "ALUNO") {
        window.location.href = "login.html";
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/participacoes/aluno/${usuarioLogado.id}`
        );

        const projetos = await resposta.json();

        if (!resposta.ok) {
            throw new Error(projetos.mensagem || "Erro ao buscar projetos.");
        }

        container.innerHTML = "";

        if (projetos.length === 0) {
            container.innerHTML = "<p>Nenhum projeto disponível.</p>";
            return;
        }

        projetos.forEach(projeto => {
            const dataPrazo = new Date(projeto.prazo);
            const prazoFormatado = dataPrazo.toLocaleDateString("pt-BR");

            const statusEntrega = projeto.statusEntrega || "PENDENTE";

            let statusClasse = "pendente";
            let statusTexto = "Pendente";

            let botao = `
                <button
                    onclick="verDetalhesProjeto(${projeto.id})"
                    class="btn-primary">
                    Ver Projeto
                </button>
            `;

            if (statusEntrega === "ENVIADO") {
                statusClasse = "enviado";
                statusTexto = "Enviado";

                botao = `
                    <button class="btn-secondary">
                        Trabalho Enviado
                    </button>
                `;
            }

            if (statusEntrega === "AVALIADO") {
                statusClasse = "avaliado";
                statusTexto = "Avaliado";

                botao = `
                    <button
                        onclick="verFeedback(${projeto.id})"
                        class="btn-secondary">
                        Ver Feedback
                    </button>
                `;
            }

            criarCardProjeto(
                projeto,
                statusClasse,
                statusTexto,
                prazoFormatado,
                botao
            );
        });

    } catch (erro) {
        console.error("Erro ao carregar projetos do aluno:", erro);
        container.innerHTML = "<p>Erro ao carregar projetos.</p>";
    }
}

// Cria o card visual de um projeto
function criarCardProjeto(
    projeto,
    statusClasse,
    statusTexto,
    prazoFormatado,
    botao
) {
    const container = document.querySelector(".cards");
    const card = document.createElement("div");

    card.classList.add("card");

    card.innerHTML = `
        <div class="tags">

        <span class="tag curso">
        ${projeto.nomeCurso || "Curso"}
        </span>

            <span class="status ${statusClasse}">
                ${statusTexto}
            </span>

            <span class="tag">
                ${projeto.periodo}º Período
            </span>
        </div>

        <p class="materia">
            📚Materia: ${projeto.materia || "Sem matéria"}
        </p>

        <h2>${projeto.titulo}</h2>

        <p>Prazo: ${prazoFormatado}</p>

        ${botao}
    `;

    container.appendChild(card);
}

// Abre a tela de detalhes/upload do projeto
function verDetalhesProjeto(projetoId) {
    localStorage.setItem("projetoSelecionado", projetoId);
    window.location.href = "detalhes-projeto-aluno.html";
}

// Abre a tela de feedback
function verFeedback(projetoId) {
    localStorage.setItem("projetoSelecionadoFeedback", projetoId);
    window.location.href = "feedback-aluno.html";
}

// Abre o modal de logout
function logout() {
    document.getElementById("logoutModal").style.display = "flex";
}

// Fecha o modal de logout
function fecharModal() {
    document.getElementById("logoutModal").style.display = "none";
}

// Confirma logout e remove o usuário logado
function confirmarLogout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}
