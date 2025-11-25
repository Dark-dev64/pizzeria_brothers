// src/routes/authRoutes.js - VERSIÓN CON VALIDACIONES CORREGIDAS
const express = require('express');
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Rutas de autenticación con validaciones CORREGIDAS
router.post('/register', validateRegister, handleValidationErrors, AuthController.register);
router.post('/login', validateLogin, handleValidationErrors, AuthController.login);
router.get('/roles', AuthController.getRoles);
router.get('/verify', AuthController.verifyToken);

module.exports = router;