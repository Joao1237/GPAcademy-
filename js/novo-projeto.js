window.onload = function() {
    carregarCursosProfessor();
};

// Carrega os cursos vinculados ao professor logado
async function carregarCursosProfessor() {
    const selectCurso = document.getElementById("curso");
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || usuarioLogado.tipo !== "PROFESSOR") {
        alert("Acesso permitido apenas para professores.");
        window.location.href = "login.html";
        return;
    }

    try {
        const resposta = await fetch(
            `${API_URL}/professor-cursos/${usuarioLogado.id}`
        );

        const vinculos = await resposta.json();

        selectCurso.innerHTML = `<option value="">Selecione o curso</option>`;

        const cursosAdicionados = [];

        vinculos.forEach(vinculo => {
            if (!cursosAdicionados.includes(vinculo.curso_id)) {
                const option = document.createElement("option");

                option.value = vinculo.curso_id;
                option.textContent = vinculo.nomeCurso;

                selectCurso.appendChild(option);
                cursosAdicionados.push(vinculo.curso_id);
            }
        });

        selectCurso.dataset.vinculos = JSON.stringify(vinculos);
        selectCurso.addEventListener("change", gerarPeriodosProfessor);

    } catch (erro) {
        console.error("Erro ao carregar cursos do professor:", erro);
        alert("Erro ao carregar cursos do professor.");
    }
}

// Gera os períodos disponíveis de acordo com o curso escolhido
function gerarPeriodosProfessor() {
    const selectCurso = document.getElementById("curso");
    const selectPeriodo = document.getElementById("periodo");

    const cursoSelecionado = Number(selectCurso.value);
    const vinculos = JSON.parse(selectCurso.dataset.vinculos || "[]");

    selectPeriodo.innerHTML = `<option value="">Selecione o período</option>`;

    const periodos = vinculos.filter(
        vinculo => vinculo.curso_id === cursoSelecionado
    );

    periodos.forEach(vinculo => {
        const option = document.createElement("option");

        option.value = vinculo.periodo;
        option.textContent = `${vinculo.periodo}º Período`;

        selectPeriodo.appendChild(option);
    });
}

// Mostra ou esconde as opções de grupo
function alterarTipoEntrega() {
    const tipoSelecionado =
        document.querySelector('input[name="tipoEntrega"]:checked').value;

    const grupoConfig = document.getElementById("grupoConfig");
    const checkboxTodos = document.getElementById("checkboxTodos");
    const gruposBox = document.getElementById("gruposBox");

    if (tipoSelecionado === "grupo") {
        grupoConfig.style.display = "block";
        gruposBox.style.display = "block";
        checkboxTodos.style.display = "none";
        return;
    }

    grupoConfig.style.display = "none";
    gruposBox.style.display = "none";
    checkboxTodos.style.display = "flex";
}

// Cria os campos dos grupos conforme a quantidade informada
function gerarGrupos() {
    const quantidade = document.getElementById("quantidadeGrupos").value;
    const listaGrupos = document.getElementById("listaGrupos");

    listaGrupos.innerHTML = "";

    for (let i = 1; i <= quantidade; i++) {
        const grupo = document.createElement("div");

        grupo.classList.add("grupo-card");

        grupo.innerHTML = `
            <div class="input-group">
                <label>Nome do grupo</label>

                <input
                    type="text"
                    class="nome-grupo"
                    placeholder="Grupo ${i}">
            </div>

            <div class="input-group">
                <label>Participantes</label>

                <input
                    type="text"
                    class="participantes-grupo"
                    placeholder="Ex: João, Maria">
            </div>
        `;

        listaGrupos.appendChild(grupo);
    }
}

// Publica o projeto individual ou em grupo
async function publicarProjeto() {
    const titulo = document.getElementById("titulo").value;
    const descricao = document.getElementById("descricao").value;
    const materia = document.getElementById("materia").value;
    const curso = document.getElementById("curso").value;
    const periodo = document.getElementById("periodo").value;
    const prazo = document.getElementById("prazo").value;
    const erro = document.getElementById("erroFormulario");

    const tipoEntrega =
        document.querySelector('input[name="tipoEntrega"]:checked').value;

    if (
        titulo === "" ||
        descricao === "" ||
        materia === "" ||
        curso === "" ||
        periodo === "" ||
        prazo === ""
    ) {
        erro.textContent = "Preencha todos os campos obrigatórios.";
        erro.style.display = "block";
        return;
    }

    erro.style.display = "none";

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    const projeto = {
        titulo,
        descricao,
        materia,
        prazo,
        status: "Publicado",
        publicado: true,
        curso_id: Number(curso),
        periodo: Number(periodo),
        tipoEntrega,
        professor_id: usuarioLogado.id
    };

    try {
        const resposta = await fetch(`${API_URL}/projetos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(projeto)
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            erro.textContent = dados.mensagem || "Erro ao publicar projeto.";
            erro.style.display = "block";
            return;
        }

        const projetoId = dados.id;

        if (tipoEntrega === "grupo") {
            const grupoSalvo = await salvarGrupos(curso, periodo, projetoId);

            if (!grupoSalvo) {
                return;
            }
        }

        abrirModalSucesso("Projeto publicado com sucesso!");

    } catch (erroServidor) {
        console.error("Erro ao publicar projeto:", erroServidor);

        erro.textContent = "Erro de conexão com o servidor.";
        erro.style.display = "block";
    }
}

// Salva os grupos e os participantes do projeto
async function salvarGrupos(curso, periodo, projetoId) {
    const erro = document.getElementById("erroFormulario");

    const respostaAlunos = await fetch(
        `${API_URL}/usuarios/alunos/${curso}/${periodo}`
    );

    const alunos = await respostaAlunos.json();
    const gruposCards = document.querySelectorAll(".grupo-card");

    for (const card of gruposCards) {
        const nomeGrupo = card.querySelector(".nome-grupo").value;
        const participantesTexto =
            card.querySelector(".participantes-grupo").value;

        if (nomeGrupo === "" || participantesTexto === "") {
            erro.textContent =
                "Preencha o nome e os participantes de todos os grupos.";
            erro.style.display = "block";
            return false;
        }

        const grupoCriado = await cadastrarGrupo(nomeGrupo, projetoId);

        if (!grupoCriado) {
            erro.textContent = "Erro ao cadastrar grupo.";
            erro.style.display = "block";
            return false;
        }

        const participacoes = montarParticipacoes(
            participantesTexto,
            alunos,
            projetoId,
            grupoCriado.id
        );

        if (participacoes.includes(null)) {
            erro.textContent =
                "Um ou mais alunos digitados não foram encontrados.";
            erro.style.display = "block";
            return false;
        }

        const participacoesSalvas =
            await salvarParticipacoesGrupo(participacoes);

        if (!participacoesSalvas) {
            erro.textContent = "Erro ao salvar participantes do grupo.";
            erro.style.display = "block";
            return false;
        }
    }

    return true;
}

// Cadastra um grupo no backend
async function cadastrarGrupo(nomeGrupo, projetoId) {
    const resposta = await fetch(`${API_URL}/grupos`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            nome: nomeGrupo,
            projeto_id: projetoId
        })
    });

    if (!resposta.ok) {
        return null;
    }

    return await resposta.json();
}

// Monta a lista de participações a partir dos nomes digitados
function montarParticipacoes(
    participantesTexto,
    alunos,
    projetoId,
    grupoId
) {
    const nomesDigitados = participantesTexto
        .split(",")
        .map(nome => nome.trim().toLowerCase())
        .filter(nome => nome !== "");

    return nomesDigitados.map(nomeDigitado => {
        const alunoEncontrado = alunos.find(
            aluno => aluno.nome.toLowerCase() === nomeDigitado
        );

        if (!alunoEncontrado) {
            return null;
        }

        return {
            usuario_id: alunoEncontrado.id,
            projeto_id: projetoId,
            grupo_id: grupoId
        };
    });
}

// Salva os participantes do grupo no backend
async function salvarParticipacoesGrupo(participacoes) {
    const resposta = await fetch(
        `${API_URL}/participacoes/grupo`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                participacoes
            })
        }
    );

    return resposta.ok;
}

// Exibe o modal de sucesso
function abrirModalSucesso(mensagem) {
    document.getElementById("successMessage").textContent = mensagem;
    document.getElementById("successModal").style.display = "flex";
}

// Fecha o modal de sucesso e volta ao dashboard
function fecharModalSucesso() {
    window.location.href = "dashboard-professor.html";
}

// Volta ao dashboard
function voltar() {
    window.location.href = "dashboard-professor.html";
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