// Cadastra um novo curso
async function cadastrarCurso() {
    const nomeCurso =
        document.getElementById("nomeCurso").value;

    const quantidadePeriodos =
        document.getElementById("quantidadePeriodos").value;

    const erro =
        document.getElementById("erro");

    // Validação dos campos obrigatórios
    if (nomeCurso === "" || quantidadePeriodos === "") {
        erro.style.display = "block";
        erro.textContent = "Preencha todos os campos.";
        return;
    }

    erro.style.display = "none";

    try {
        const resposta = await fetch(
            `${API_URL}/cursos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    nome: nomeCurso,
                    quantidadePeriodos: Number(quantidadePeriodos)
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            erro.style.display = "block";
            erro.textContent =
                dados.mensagem || "Erro ao cadastrar curso.";
            return;
        }

        document.getElementById("successModal").style.display =
            "flex";

    } catch (error) {
        console.error("Erro ao cadastrar curso:", error);

        erro.style.display = "block";
        erro.textContent =
            "Erro de conexão com o servidor.";
    }
}

// Fecha o modal de sucesso e retorna ao dashboard
function fecharModal() {
    window.location.href = "dashboard-admin.html";
}

// Volta para o dashboard sem salvar
function voltar() {
    window.location.href = "dashboard-admin.html";
}

// Realiza logout do sistema
function logout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}