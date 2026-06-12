function mostrarErroLogin(mensagem) {
    const erro = document.getElementById("loginErro");
    erro.textContent = mensagem;
    erro.hidden = false;
}

function limparErroLogin() {
    const erro = document.getElementById("loginErro");
    erro.textContent = "";
    erro.hidden = true;
}

document.getElementById("email").addEventListener("input", limparErroLogin);
document.getElementById("senha").addEventListener("input", limparErroLogin);

async function entrar() {
    const email = document.getElementById("email").value.trim();
    const senha = document.getElementById("senha").value;

    limparErroLogin();

    if (email === "" && senha === "") {
        mostrarErroLogin("Preencha o e-mail e a senha para entrar.");
        return;
    }

    if (email === "") {
        mostrarErroLogin("Informe seu e-mail institucional.");
        return;
    }

    if (senha === "") {
        mostrarErroLogin("Informe sua senha.");
        return;
    }

    try {
        const resposta = await fetch(`${API_URL}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email,
                senha
            })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            mostrarErroLogin(dados.mensagem || "E-mail ou senha inválidos.");
            return;
        }

        localStorage.setItem("usuarioLogado", JSON.stringify(dados.usuario));

        const tipo = dados.usuario.tipo;

        if (tipo === "ADMINISTRADOR") {
            window.location.href = "dashboard-admin.html";
        } else if (tipo === "PROFESSOR") {
            window.location.href = "dashboard-professor.html";
        } else if (tipo === "ALUNO") {
            window.location.href = "dashboard-aluno.html";
        }

    } catch (erro) {
        console.log(erro);
        mostrarErroLogin("Erro ao conectar com o servidor. Tente novamente.");
    }
}
