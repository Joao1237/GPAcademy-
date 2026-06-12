function selecionarArquivo() {

    document.getElementById("arquivo").click();
}

document.getElementById("arquivo")
    .addEventListener("change", function() {

        let arquivo =
            this.files[0];

        let arquivoInfo =
            document.getElementById("arquivoInfo");

        let nomeArquivo =
            document.getElementById("nomeArquivo");

        if (arquivo) {

            arquivoInfo.style.display = "block";

            nomeArquivo.textContent =
                arquivo.name;
        }
    });

function enviarProjeto() {

    let arquivo =
        document.getElementById("arquivo").files[0];

    let erro =
        document.getElementById("erroUpload");

    if (!arquivo) {

        erro.style.display = "block";

        erro.textContent =
            "Selecione um arquivo antes de enviar.";

        return;
    }

    erro.style.display = "none";

    document.getElementById(
        "successModal"
    ).style.display = "flex";
}

function fecharSucesso() {

    window.location.href =
        "dashboard-aluno.html";
}

function voltar() {

    window.location.href =
        "dashboard-aluno.html";
}

/* MODAL LOGOUT */

function logout() {

    document.getElementById(
        "logoutModal"
    ).style.display = "flex";
}

function fecharModal() {

    document.getElementById(
        "logoutModal"
    ).style.display = "none";
}

function confirmarLogout() {

    window.location.href =
        "login.html";
}