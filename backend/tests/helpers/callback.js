function executarServico(fn, ...args) {
    return new Promise((resolve, reject) => {
        fn(...args, (erro, resultado) => {
            if (erro) {
                reject(erro);
                return;
            }

            resolve(resultado);
        });
    });
}

module.exports = {
    executarServico
};
