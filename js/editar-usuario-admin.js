let usuarioAtual = null;
let cursosDisponiveis = [];

// Carrega os dados necessários para a tela
window.onload = async function() {
    await carregarUsuario();
    await carregarCursos();

    preencherCursoPeriodo();

    document.getElementById("curso").addEventListener("change", () => {
        gerarPeriodos();
    });
};

// Busca os dados do usuário selecionado
async function carregarUsuario() {
    const usuarioId = localStorage.getItem("usuarioEditar");

    try {
        const resposta = await fetch(
            `${API_URL}/usuarios/${usuarioId}`
        );

        usuarioAtual = await resposta.json();

        if (!resposta.ok) {
            alert(usuarioAtual.mensagem || "Erro ao carregar usuário.");
            voltar();
            return;
        }

        preencherDadosUsuario();

    } catch (erro) {
        console.error("Erro ao carregar usuário:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

// Preenche os campos principais do usuário
function preencherDadosUsuario() {
    document.getElementById("nome").value = usuarioAtual.nome;
    document.getElementById("email").value = usuarioAtual.email;
    document.getElementById("perfil").value = usuarioAtual.tipo;
    document.getElementById("senha").value = "";
}

// Carrega os cursos cadastrados no banco
async function carregarCursos() {
    const selectCurso = document.getElementById("curso");

    try {
        const resposta = await fetch(`${API_URL}/cursos`);
        cursosDisponiveis = await resposta.json();

        selectCurso.innerHTML =
            `<option value="">Selecione o curso</option>`;

        cursosDisponiveis.forEach(curso => {
            const option = document.createElement("option");

            option.value = curso.id;
            option.textContent = curso.nome;
            option.setAttribute("data-periodos", curso.quantidadePeriodos);

            selectCurso.appendChild(option);
        });

    } catch (erro) {
        console.error("Erro ao carregar cursos:", erro);

        selectCurso.innerHTML =
            `<option value="">Erro ao carregar cursos</option>`;
    }
}

// Gera os períodos disponíveis
function gerarPeriodos() {
    const selectCurso = document.getElementById("curso");
    const selectPeriodo = document.getElementById("periodo");
    const optionSelecionada = selectCurso.options[selectCurso.selectedIndex];
    const quantidadePeriodos =
        optionSelecionada &&
        optionSelecionada.getAttribute("data-periodos");

    selectPeriodo.innerHTML =
        `<option value="">Selecione o período</option>`;

    if (!quantidadePeriodos) {
        selectPeriodo.innerHTML =
            `<option value="">Selecione um curso primeiro</option>`;
        return;
    }

    for (let i = 1; i <= Number(quantidadePeriodos); i++) {
        const option = document.createElement("option");

        option.value = i;
        option.textContent = `${i}º Período`;

        selectPeriodo.appendChild(option);
    }
}

// Seleciona o curso e período atuais do usuário
function preencherCursoPeriodo() {
    document.getElementById("curso").value =
        usuarioAtual.curso_id || "";

    gerarPeriodos();

    document.getElementById("periodo").value =
        usuarioAtual.periodo || "";
}

// Salva as alterações do usuário
async function salvar() {
    const usuarioId = localStorage.getItem("usuarioEditar");

    const novaSenha = document.getElementById("senha").value.trim();

    const usuario = {
        nome: document.getElementById("nome").value,
        email: document.getElementById("email").value,
        tipo: document.getElementById("perfil").value,
        curso_id: document.getElementById("curso").value || null,
        periodo: document.getElementById("periodo").value || null
    };

    if (novaSenha) {
        usuario.senha = novaSenha;
    }

    if (!usuario.nome ||
        !usuario.email ||
        !usuario.tipo
    ) {
        alert("Preencha os campos obrigatórios.");
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/usuarios/${usuarioId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(usuario)
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || "Erro ao atualizar usuário.");
            return;
        }

        document.getElementById("successModal").style.display = "flex";

    } catch (erro) {
        console.error("Erro ao atualizar usuário:", erro);
        alert("Erro ao conectar com o servidor.");
    }
}

// Volta para o dashboard do admin
function voltar() {
    window.location.href = "dashboard-admin.html";
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

function fecharSucesso() {
    window.location.href = "dashboard-admin.html";
}
