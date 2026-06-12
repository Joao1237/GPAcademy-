const cursoRepository = require('../repositories/cursoRepository');

function cadastrarCurso(curso, callback) {
    if (!curso.nome || !curso.quantidadePeriodos) {
        return callback({
            status: 400,
            mensagem: 'Nome do curso e quantidade de períodos são obrigatórios.'
        });
    }

    cursoRepository.cadastrarCurso(curso, (erro, resultado) => {
        if (erro) {
            console.error('Erro ao cadastrar curso:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao cadastrar curso.'
            });
        }

        callback(null, {
            mensagem: 'Curso cadastrado com sucesso!',
            id: resultado.insertId
        });
    });
}

function listarCursos(callback) {
    cursoRepository.listarCursos((erro, resultados) => {
        if (erro) {
            console.error('Erro ao listar cursos:', erro);
            return callback({
                status: 500,
                mensagem: 'Erro ao listar cursos.'
            });
        }

        callback(null, resultados);
    });
}

module.exports = {
    cadastrarCurso,
    listarCursos
};
