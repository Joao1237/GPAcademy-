const entregaRepository = require('../repositories/entregaRepository');

function cadastrarEntrega(dados, callback) {
    const entrega = {
        usuario_id: dados.usuario_id,
        projeto_id: dados.projeto_id,
        grupo_id: dados.grupo_id || null,
        arquivo: dados.arquivo
    };

    if (!entrega.usuario_id ||
        !entrega.projeto_id ||
        !entrega.arquivo
    ) {
        return callback({
            status: 400,
            mensagem: 'Aluno, projeto e arquivo são obrigatórios.'
        });
    }

    entregaRepository.buscarEntregaPorAlunoProjeto(
        entrega.usuario_id,
        entrega.projeto_id,
        (erroBusca, entregasExistentes) => {
            if (erroBusca) {
                console.error('Erro ao verificar entrega:', erroBusca);
                return callback({
                    status: 500,
                    mensagem: 'Erro ao verificar entrega.'
                });
            }

            if (entregasExistentes.length > 0) {
                return callback({
                    status: 400,
                    mensagem: 'Você já enviou um trabalho para este projeto.'
                });
            }

            entregaRepository.cadastrarEntrega(entrega, (erro, resultado) => {
                if (erro) {
                    console.error('Erro ao cadastrar entrega:', erro);
                    return callback({
                        status: 500,
                        mensagem: 'Erro ao cadastrar entrega.'
                    });
                }

                callback(null, {
                    mensagem: 'Entrega realizada com sucesso!',
                    id: resultado.insertId,
                    arquivo: entrega.arquivo
                });
            });
        }
    );
}

function listarEntregas(callback) {
    entregaRepository.listarEntregas((erro, resultados) => {
        if (erro) {
            console.error('Erro ao listar entregas:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao listar entregas.'
            });
        }

        callback(null, resultados);
    });
}

function listarEntregasPorProjeto(projeto_id, callback) {
    entregaRepository.listarEntregasPorProjeto(
        projeto_id,
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao listar entregas do projeto:', erro);
                return callback({
                    status: 500,
                    mensagem: 'Erro ao listar entregas do projeto.'
                });
            }

            callback(null, resultados);
        }
    );
}

function listarEntregasGrupoPorProjeto(projeto_id, callback) {
    entregaRepository.listarEntregasGrupoPorProjeto(
        projeto_id,
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao listar entregas em grupo:', erro);
                return callback({
                    status: 500,
                    mensagem: 'Erro ao listar entregas em grupo.'
                });
            }

            callback(null, resultados);
        }
    );
}

function salvarFeedback(entrega, callback) {
    if (!entrega.id || !entrega.feedback) {
        return callback({
            status: 400,
            mensagem: 'Entrega e feedback são obrigatórios.'
        });
    }

    entregaRepository.salvarFeedback(entrega, (erro) => {
        if (erro) {
            console.error('Erro ao salvar feedback:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao salvar feedback.'
            });
        }

        callback(null, {
            mensagem: 'Feedback salvo com sucesso!'
        });
    });
}

module.exports = {
    cadastrarEntrega,
    listarEntregas,
    listarEntregasPorProjeto,
    listarEntregasGrupoPorProjeto,
    salvarFeedback
};
