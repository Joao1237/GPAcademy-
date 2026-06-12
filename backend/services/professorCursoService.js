const professorCursoRepository = require('../repositories/professorCursoRepository');

function vincularProfessorCurso(dados, callback) {
    if (!dados.professor_id ||
        !dados.curso_id ||
        !dados.periodo
    ) {
        return callback({
            status: 400,
            mensagem: 'Professor, curso e período são obrigatórios.'
        });
    }

    professorCursoRepository.vincularProfessorCurso(
        dados,
        (erro) => {
            if (erro) {
                console.error('Erro ao vincular professor:', erro);
                return callback({
                    status: 500,
                    mensagem: 'Erro ao vincular professor ao curso/período.'
                });
            }

            callback(null, {
                mensagem: 'Professor vinculado com sucesso!'
            });
        }
    );
}

function listarVinculosProfessor(professor_id, callback) {
    professorCursoRepository.listarVinculosProfessor(
        professor_id,
        (erro, resultados) => {
            if (erro) {
                console.error(
                    'Erro ao listar vínculos do professor:',
                    erro
                );
                return callback({
                    status: 500,
                    mensagem: 'Erro ao listar vínculos do professor.'
                });
            }

            callback(null, resultados);
        }
    );
}

module.exports = {
    vincularProfessorCurso,
    listarVinculosProfessor
};
