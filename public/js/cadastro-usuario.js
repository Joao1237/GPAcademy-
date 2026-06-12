let vinculosProfessor = [];

// Carrega os dados iniciais da tela
window.onload = function() {
    carregarCursos();
    alterarPerfil();
};

// Carrega os cursos cadastrados no banco
async function carregarCursos() {
    try {
        const resposta = await fetch(`${API_URL}/cursos`);
        const cursos = await resposta.json();

        preencherSelectCursos("curso", cursos);
        preencherSelectCursos("cursoProfessor", cursos);

        document
            .getElementById("curso")
            .addEventListener("change", () => {
                gerarPeriodos("curso", "periodo");
            });

        document
            .getElementById("cursoProfessor")
            .addEventListener("change", () => {
                gerarPeriodos("cursoProfessor", "periodoProfessor");
            });

    } catch (erro) {
        console.error("Erro ao carregar cursos:", erro);
        alert("Erro ao carregar cursos.");
    }
}

// Preenche um select com os cursos
function preencherSelectCursos(idSelect, cursos) {
    const select = document.getElementById(idSelect);

    select.innerHTML = `<option value="">Selecione o curso</option>`;

    cursos.forEach(curso => {
        const option = document.createElement("option");

        option.value = curso.id;
        option.textContent = curso.nome;
        option.setAttribute("data-periodos", curso.quantidadePeriodos);

        select.appendChild(option);
    });
}

// Gera períodos conforme a quantidade de períodos do curso
function gerarPeriodos(idCurso, idPeriodo) {
    const selectCurso = document.getElementById(idCurso);
    const selectPeriodo = document.getElementById(idPeriodo);

    const optionSelecionada =
        selectCurso.options[selectCurso.selectedIndex];

    const quantidadePeriodos =
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

// Mostra campos de aluno ou professor conforme o perfil escolhido
function alterarPerfil() {
    const perfil = document.getElementById("perfil").value;
    const areaAluno = document.getElementById("areaAluno");
    const areaProfessor = document.getElementById("areaProfessor");

    if (perfil === "Aluno") {
        areaAluno.style.display = "grid";
        areaProfessor.style.display = "none";
        return;
    }

    if (perfil === "Professor") {
        areaAluno.style.display = "none";
        areaProfessor.style.display = "block";
        return;
    }

    areaAluno.style.display = "none";
    areaProfessor.style.display = "none";
}

// Adiciona um vínculo de curso/período para o professor
function adicionarVinculoProfessor() {
    const cursoSelect = document.getElementById("cursoProfessor");
    const periodoSelect = document.getElementById("periodoProfessor");

    const curso_id = cursoSelect.value;
    const periodo = periodoSelect.value;

    if (curso_id === "" || periodo === "") {
        alert("Selecione o curso e o período do professor.");
        return;
    }

    const jaExiste = vinculosProfessor.some(v =>
        v.curso_id === Number(curso_id) &&
        v.periodo === Number(periodo)
    );

    if (jaExiste) {
        alert("Esse vínculo já foi adicionado.");
        return;
    }

    const nomeCurso =
        cursoSelect.options[cursoSelect.selectedIndex].textContent;

    vinculosProfessor.push({
        curso_id: Number(curso_id),
        nomeCurso,
        periodo: Number(periodo)
    });

    atualizarListaVinculosProfessor();
}

// Atualiza visualmente a lista de vínculos do professor
function atualizarListaVinculosProfessor() {
    const lista = document.getElementById("listaVinculosProfessor");

    lista.innerHTML = "";

    vinculosProfessor.forEach((vinculo, index) => {
        const item = document.createElement("div");
        item.className = "vinculo-item";

        item.innerHTML = `
            <span>${vinculo.nomeCurso} - ${vinculo.periodo}º Período</span>

            <button
                type="button"
                onclick="removerVinculoProfessor(${index})"
                class="btn-secondary">
                Remover
            </button>
        `;

        lista.appendChild(item);
    });
}

// Remove um vínculo da lista temporária
function removerVinculoProfessor(index) {
    vinculosProfessor.splice(index, 1);
    atualizarListaVinculosProfessor();
}

// Cadastra usuário aluno, professor ou administrador
async function cadastrarUsuario() {
    const nome = document.getElementById("nome").value;
    const email = document.getElementById("email").value;
    const perfil = document.getElementById("perfil").value;
    const senha = document.getElementById("senha").value;

    const curso = document.getElementById("curso").value;
    const periodo = document.getElementById("periodo").value;

    if (nome === "" || email === "" || perfil === "" || senha === "") {
        alert("Preencha todos os campos obrigatórios.");
        return;
    }

    if (perfil === "Aluno" && (curso === "" || periodo === "")) {
        alert("Selecione o curso e o período do aluno.");
        return;
    }

    if (perfil === "Professor" && vinculosProfessor.length === 0) {
        alert("Adicione pelo menos um vínculo de curso/período para o professor.");
        return;
    }

    const usuario = {
        nome,
        email,
        senha,
        tipo: perfil.toUpperCase(),
        curso_id: perfil === "Aluno" ? Number(curso) : null,
        periodo: perfil === "Aluno" ? Number(periodo) : null
    };

    try {
        const usuarioCriado = await salvarUsuario(usuario);

        if (!usuarioCriado) {
            return;
        }

        if (perfil === "Professor") {
            const vinculosSalvos =
                await salvarVinculosProfessor(usuarioCriado.id);

            if (!vinculosSalvos) {
                return;
            }
        }

        document.getElementById("successModal").style.display = "flex";

    } catch (erro) {
        console.error("Erro ao cadastrar usuário:", erro);
        alert("Erro de conexão com o servidor.");
    }
}

// Salva o usuário no backend
async function salvarUsuario(usuario) {
    const resposta = await fetch(`${API_URL}/usuarios`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(usuario)
    });

    const dados = await resposta.json();

    if (!resposta.ok) {
        console.error("Erro ao cadastrar usuário:", dados);
        alert(dados.mensagem || "Erro ao cadastrar usuário.");
        return null;
    }

    return dados;
}

// Salva os vínculos de curso/período do professor
async function salvarVinculosProfessor(professorId) {
    for (const vinculo of vinculosProfessor) {
        const resposta = await fetch(
            `${API_URL}/professor-cursos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    professor_id: professorId,
                    curso_id: vinculo.curso_id,
                    periodo: vinculo.periodo
                })
            }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
            console.error("Erro ao salvar vínculo:", dados);
            alert("Usuário cadastrado, mas erro ao salvar vínculo do professor.");
            return false;
        }
    }

    return true;
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

// Fecha o modal de sucesso
function fecharSucesso() {
    window.location.href = "dashboard-admin.html";
}