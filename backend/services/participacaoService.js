const participacaoRepository = require('../repositories/participacaoRepository');

function adicionarParticipacao(participacao, callback) {
    if (!participacao.usuario_id || !participacao.projeto_id) {
        return callback({
            status: 400,
            mensagem: 'Usuário e projeto são obrigatórios.'
        });
    }

    participacaoRepository.adicionarParticipacao(
        participacao,
        (erro) => {
            if (erro) {
                console.error('Erro ao adicionar participação:', erro);
                return callback({
                    status: 500,
                    mensagem: 'Erro ao adicionar participação.'
                });
            }

            callback(null, {
                mensagem: 'Participação cadastrada com sucesso!'
            });
        }
    );
}

function listarParticipacoes(callback) {
    participacaoRepository.listarParticipacoes((erro, resultados) => {
        if (erro) {
            console.error('Erro ao listar participações:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao listar participações.'
            });
        }

        callback(null, resultados);
    });
}

function listarProjetosDoAluno(usuario_id, callback) {
    participacaoRepository.listarProjetosDoAluno(
        usuario_id,
        (erro, resultados) => {
            if (erro) {
                console.error('Erro ao listar projetos do aluno:', erro);
                return callback({
                    status: 500,
                    mensagem: 'Erro ao listar projetos do aluno.'
                });
            }

            callback(null, resultados);
        }
    );
}

function adicionarParticipacoesGrupo(participacoes, callback) {
    if (!participacoes || participacoes.length === 0) {
        return callback({
            status: 400,
            mensagem: 'Participações são obrigatórias.'
        });
    }

    participacaoRepository.adicionarParticipacoesGrupo(
        participacoes,
        (erro) => {
            if (erro) {
                console.error(
                    'Erro ao salvar participantes do grupo:',
                    erro
                );
                return callback({
                    status: 500,
                    mensagem: 'Erro ao salvar participantes do grupo.'
                });
            }

            callback(null, {
                mensagem: 'Participantes do grupo salvos com sucesso!'
            });
        }
    );
}

module.exports = {
    adicionarParticipacao,
    listarParticipacoes,
    listarProjetosDoAluno,
    adicionarParticipacoesGrupo
};
