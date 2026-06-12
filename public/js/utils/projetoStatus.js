function idsIguais(a, b) {
    return String(a) === String(b);
}

function calcularStatusProjeto(entregas, statusProjeto, labelRecebido) {
    const temAvaliado = entregas.some(
        entrega => entrega.status === 'AVALIADO'
    );

    const temRecebido = entregas.some(
        entrega => entrega.status === 'ENVIADO'
    );

    let statusCalculado;

    if (temAvaliado) {
        statusCalculado = 'Avaliado';
    } else if (temRecebido) {
        statusCalculado = labelRecebido;
    } else {
        statusCalculado = statusProjeto || 'Publicado';
    }

    return {
        temRecebido,
        temAvaliado,
        statusCalculado
    };
}

function obterClasseStatus(status) {
    if (status === 'Recebidos' || status === 'Recebido') {
        return 'recebido';
    }

    if (status === 'Avaliado') {
        return 'avaliado';
    }

    return (status || 'Publicado').toLowerCase();
}

function statusPassaNoFiltro(card, filtroStatus) {
    if (filtroStatus === 'Todos') {
        return true;
    }

    if (filtroStatus === 'Recebidos' || filtroStatus === 'Recebido') {
        return card.temRecebido === true
            || card.temRecebido === 'true'
            || card.status === 'Recebidos'
            || card.status === 'Recebido';
    }

    if (filtroStatus === 'Avaliado') {
        return card.temAvaliado === true
            || card.temAvaliado === 'true';
    }

    return card.status === filtroStatus;
}

function cardPassaFiltros(card, filtros) {
    const statusOk = statusPassaNoFiltro(card, filtros.status || 'Todos');

    const tipoOk =
        !filtros.tipo ||
        filtros.tipo === 'Todos' ||
        card.tipo === filtros.tipo;

    const periodoOk =
        !filtros.periodo ||
        filtros.periodo === 'Todos' ||
        card.periodo === filtros.periodo;

    const cursoOk =
        !filtros.curso ||
        filtros.curso === 'Todos' ||
        card.curso === filtros.curso;

    return statusOk && tipoOk && periodoOk && cursoOk;
}

const ProjetoStatus = {
    idsIguais,
    calcularStatusProjeto,
    obterClasseStatus,
    statusPassaNoFiltro,
    cardPassaFiltros
};

if (typeof window !== 'undefined') {
    window.ProjetoStatus = ProjetoStatus;
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProjetoStatus;
}
