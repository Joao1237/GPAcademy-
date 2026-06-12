function abrirNotificacoes() {
    const box = document.getElementById("notificationBox");

    if (!box) {
        return;
    }

    box.style.display =
        box.style.display === "block" ? "none" : "block";
}

function renderizarNotificacoes(notificacoes) {
    const box = document.getElementById("notificationBox");
    const countEl = document.querySelector(".notification-count");

    if (!box) {
        return;
    }

    const titulo = box.querySelector("h3");
    box.innerHTML = "";

    if (titulo) {
        box.appendChild(titulo);
    } else {
        const heading = document.createElement("h3");
        heading.textContent = "Notificações";
        box.appendChild(heading);
    }

    if (!notificacoes.length) {
        const vazio = document.createElement("div");
        vazio.className = "notification-item";
        vazio.textContent = "Nenhuma notificação no momento.";
        box.appendChild(vazio);
    } else {
        notificacoes.forEach(texto => {
            const item = document.createElement("div");
            item.className = "notification-item";
            item.textContent = texto;
            box.appendChild(item);
        });
    }

    if (countEl) {
        countEl.textContent = notificacoes.length;
        countEl.style.display = notificacoes.length > 0 ? "flex" : "none";
    }
}

async function buscarNotificacoesProfessor(professorId) {
    const [respostaProjetos, respostaEntregas] = await Promise.all([
        fetch(`${API_URL}/projetos`),
        fetch(`${API_URL}/entregas`)
    ]);

    const projetos = await respostaProjetos.json();
    const entregas = await respostaEntregas.json();

    const projetosDoProfessor = projetos.filter(
        projeto => projeto.professor_id === professorId
    );

    const idsProjetos = projetosDoProfessor.map(projeto => projeto.id);

    const entregasDoProfessor = entregas.filter(entrega =>
        idsProjetos.includes(entrega.projeto_id)
    );

    const notificacoes = [];
    const pendentes = entregasDoProfessor.filter(
        entrega => entrega.status === "ENVIADO"
    );

    if (pendentes.length === 1) {
        const projeto = projetosDoProfessor.find(
            item => item.id === pendentes[0].projeto_id
        );

        if (projeto) {
            notificacoes.push(
                `Nova entrega recebida: ${projeto.titulo}`
            );
        }
    } else if (pendentes.length > 1) {
        notificacoes.push(
            `${pendentes.length} entregas aguardando avaliação`
        );
    }

    return notificacoes;
}

async function buscarNotificacoesAluno(alunoId) {
    const resposta = await fetch(
        `${API_URL}/participacoes/aluno/${alunoId}`
    );

    const projetos = await resposta.json();
    const notificacoes = [];
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    projetos.forEach(projeto => {
        const statusEntrega = projeto.statusEntrega || "PENDENTE";

        if (statusEntrega === "AVALIADO") {
            notificacoes.push(
                `Feedback disponível: ${projeto.titulo}`
            );
        }

        if (statusEntrega === "PENDENTE" && projeto.prazo) {
            const prazo = new Date(projeto.prazo);
            prazo.setHours(0, 0, 0, 0);

            const diasRestantes = Math.ceil(
                (prazo - hoje) / (1000 * 60 * 60 * 24)
            );

            if (diasRestantes >= 0 && diasRestantes <= 3) {
                notificacoes.push(
                    `Prazo próximo (${diasRestantes} dia(s)): ${projeto.titulo}`
                );
            }
        }
    });

    return [...new Set(notificacoes)];
}

async function carregarNotificacoesInApp() {
    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));

    if (!usuarioLogado || !document.getElementById("notificationBox")) {
        return;
    }

    try {
        let notificacoes = [];

        if (usuarioLogado.tipo === "PROFESSOR") {
            notificacoes = await buscarNotificacoesProfessor(usuarioLogado.id);
        } else if (usuarioLogado.tipo === "ALUNO") {
            notificacoes = await buscarNotificacoesAluno(usuarioLogado.id);
        }

        renderizarNotificacoes(notificacoes);
    } catch (erro) {
        console.error("Erro ao carregar notificações:", erro);
        renderizarNotificacoes([]);
    }
}

document.addEventListener("DOMContentLoaded", carregarNotificacoesInApp);
