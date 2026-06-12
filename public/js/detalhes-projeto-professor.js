window.onload = async function() {
    carregarUsuarioTopo();
    carregarProjeto();
};

function verEntregas() {
    window.location.href = "lista-entregas-professor.html";
}

function voltar() {
    window.location.href = "dashboard-professor.html";
}

function logout() {

    document.getElementById("logoutModal").style.display = "flex";
}

function fecharModal() {

    document.getElementById("logoutModal").style.display = "none";
}

function confirmarLogout() {

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