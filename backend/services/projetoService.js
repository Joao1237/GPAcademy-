const projetoRepository = require('../repositories/projetoRepository');
const usuarioRepository = require('../repositories/usuarioRepository');
const participacaoRepository = require('../repositories/participacaoRepository');

function cadastrarProjeto(projeto, callback) {
    if (!projeto.titulo ||
        !projeto.descricao ||
        !projeto.materia ||
        !projeto.prazo ||
        !projeto.curso_id ||
        !projeto.periodo
    ) {
        return callback({
            status: 400,
            mensagem: 'Preencha todos os campos obrigatórios.'
        });
    }

    projeto.status = projeto.status || 'Criado';
    projeto.publicado = projeto.publicado || false;

    projetoRepository.cadastrarProjeto(projeto, (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar projeto:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao cadastrar projeto'
            });
        }

        const projeto_id = resultado.insertId;

        if (projeto.tipoEntrega !== 'individual') {
            return callback(null, {
                mensagem: 'Projeto cadastrado com sucesso!',
                id: projeto_id
            });
        }

        usuarioRepository.buscarAlunosPorCursoPeriodo(
            projeto.curso_id,
            projeto.periodo,
            (erroAlunos, alunos) => {
                if (erroAlunos) {
                    console.error('Erro ao buscar alunos:', erroAlunos);
                    return callback({
                        status: 500,
                        mensagem: 'Projeto cadastrado, mas ocorreu erro ao buscar alunos.'
                    });
                }

                if (alunos.length === 0) {
                    return callback(null, {
                        mensagem: 'Projeto cadastrado, mas nenhum aluno foi encontrado para esse curso e período.',
                        id: projeto_id
                    });
                }

                const participacoes = alunos.map(aluno => ({
                    usuario_id: aluno.id,
                    projeto_id: projeto_id
                }));

                participacaoRepository.adicionarParticipacoesEmLote(
                    participacoes,
                    (erroParticipacoes) => {
                        if (erroParticipacoes) {
                            console.error(
                                'Erro ao criar participações:',
                                erroParticipacoes
                            );
                            return callback({
                                status: 500,
                                mensagem: 'Projeto cadastrado, mas ocorreu erro ao criar participações.'
                            });
                        }

                        callback(null, {
                            mensagem: 'Projeto cadastrado e enviado aos alunos com sucesso!',
                            id: projeto_id
                        });
                    }
                );
            }
        );
    });
}

function listarProjetos(callback) {
    projetoRepository.listarProjetos((erro, resultados) => {
        if (erro) {
            console.error('Erro ao listar projetos:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao listar projetos'
            });
        }

        callback(null, resultados);
    });
}

function excluirProjeto(id, callback) {
    projetoRepository.excluirProjeto(id, (erro) => {
        if (erro) {
            console.error('Erro ao excluir projeto:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao excluir projeto.'
            });
        }

        callback(null, {
            mensagem: 'Projeto excluído com sucesso!'
        });
    });
}

module.exports = {
    cadastrarProjeto,
    listarProjetos,
    excluirProjeto
};
