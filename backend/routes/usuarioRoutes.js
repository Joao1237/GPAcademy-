const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuarioController');

// Cadastro de usuário
router.post(
    '/usuarios',
    usuarioController.cadastrarUsuario
);

// Login do sistema
router.post(
    '/login',
    usuarioController.login
);

// Listar todos os usuários
router.get(
    '/usuarios',
    usuarioController.listarUsuarios
);

// Listar alunos por curso e período
router.get(
    '/usuarios/alunos/:curso_id/:periodo',
    usuarioController.listarAlunosPorCursoPeriodo
);

// Buscar usuário por ID
router.get(
    '/usuarios/:id',
    usuarioController.buscarUsuarioPorId
);

// Atualizar usuário
router.put(
    '/usuarios/:id',
    usuarioController.atualizarUsuario
);

// Excluir usuário
router.delete(
    '/usuarios/:id',
    usuarioController.excluirUsuario
);

module.exports = router;