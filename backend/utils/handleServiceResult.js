function responderServico(res, erro, resultado, statusSucesso = 200) {
    if (erro) {
        return res.status(erro.status || 500).json({
            mensagem: erro.mensagem || 'Erro interno do servidor.'
        });
    }

    return res.status(statusSucesso).json(resultado);
}

module.exports = {
    responderServico
};
