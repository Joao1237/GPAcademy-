const multer = require('multer');
const path = require('path');

// Configuração de armazenamento dos arquivos
const storage = multer.diskStorage({

    // Pasta onde os arquivos serão salvos
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },

    // Gera um nome único para evitar conflitos
    filename: (req, file, cb) => {

        const nomeArquivo =
            Date.now() +
            path.extname(file.originalname);

        cb(null, nomeArquivo);
    }
});

// Permite apenas determinados tipos de arquivo
const fileFilter = (req, file, cb) => {

    const extensoesPermitidas = [
        '.pdf',
        '.doc',
        '.docx'
    ];

    const extensao =
        path.extname(file.originalname)
        .toLowerCase();

    if (extensoesPermitidas.includes(extensao)) {
        cb(null, true);
    } else {
        cb(
            new Error(
                'Apenas arquivos PDF, DOC e DOCX são permitidos.'
            ),
            false
        );
    }
};

// Configuração final do Multer
const upload = multer({
    storage,
    fileFilter
});

module.exports = upload;