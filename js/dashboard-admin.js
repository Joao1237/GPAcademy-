let linhaSelecionada = null;

// Carrega os dados principais da tela
window.onload = function() {
    carregarUsuarioTopo();
    carregarUsuarios();
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

// Busca os usuários cadastrados no banco e monta a tabela
async function carregarUsuarios() {
    const tbody = document.getElementById("tbodyUsuarios");

    try {
        const resposta = await fetch(`${API_URL}/usuarios`);
        const usuarios = await resposta.json();

        tbody.innerHTML = "";

        usuarios.forEach(usuario => {
            const curso = usuario.nomeCurso || "-";
            const periodo = usuario.periodo ?
                `${usuario.periodo}º Período` :
                "-";

            const tr = document.createElement("tr");

            tr.innerHTML = `
                <td>${usuario.nome}</td>
                <td>${usuario.email}</td>
                <td>${curso}</td>
                <td>${periodo}</td>
                <td>${usuario.tipo}</td>

                <td>
                    <span class="status ativo">Ativo</span>
                </td>

                <td class="acoes">
                    <button
                        onclick="editarUsuario(${usuario.id})"
                        class="btn-icon">
                        ✏️
                    </button>

                    <button
                        onclick="abrirDeleteUsuario(this, ${usuario.id})"
                        class="btn-icon delete">
                        🗑️
                    </button>
                </td>
            `;

            tbody.appendChild(tr);
        });

    } catch (erro) {
        console.error("Erro ao carregar usuários:", erro);

        tbody.innerHTML = `
            <tr>
                <td colspan="7">
                    Erro ao carregar usuários.
                </td>
            </tr>
        `;
    }
}

// Vai para a tela de cadastro de usuário
function cadastrarUsuario() {
    window.location.href = "cadastro-usuario.html";
}

// Salva o ID do usuário escolhido e abre a tela de edição
function editarUsuario(id) {
    localStorage.setItem("usuarioEditar", id);
    window.location.href = "editar-usuario-admin.html";
}

// Abre o modal de exclusão e guarda o ID do usuário
function abrirDeleteUsuario(botao, id) {
    linhaSelecionada = botao.closest("tr");
    localStorage.setItem("usuarioExcluir", id);

    document.getElementById("deleteUserModal").style.display = "flex";
}

// Fecha o modal de exclusão
function fecharDeleteUsuario() {
    document.getElementById("deleteUserModal").style.display = "none";
}

// Confirma a exclusão do usuário no banco
async function confirmarDeleteUsuario() {
    const usuarioId = localStorage.getItem("usuarioExcluir");

    try {
        const resposta = await fetch(
            `${API_URL}/usuarios/${usuarioId}`, {
                method: "DELETE"
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.mensagem || "Erro ao excluir usuário.");
            return;
        }

        fecharDeleteUsuario();
        localStorage.removeItem("usuarioExcluir");

        carregarUsuarios();

    } catch (erro) {
        console.error("Erro ao excluir usuário:", erro);
        alert("Erro ao conectar com o servidor.");
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

// Confirma logout e limpa o usuário logado
function confirmarLogout() {
    localStorage.removeItem("usuarioLogado");
    window.location.href = "login.html";
}

// Vai para a tela de cadastro de curso
function abrirCadastroCurso() {
    window.location.href = "cadastro-curso.html";
}