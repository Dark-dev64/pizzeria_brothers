const express = require('express');
const AuthController = require('../controllers/authController');
const { validateRegister, validateLogin, handleValidationErrors } = require('../middleware/validation');

const router = express.Router();

// Ruta para verificar que la API está funcionando
router.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'API de autenticación funcionando correctamente',
        endpoints: {
            register: 'POST /api/auth/register',
            login: 'POST /api/auth/login',
            roles: 'GET /api/auth/roles',
            verify: 'GET /api/auth/verify'
        }
    });
});

// Rutas de autenticación
router.post('/register', validateRegister, handleValidationErrors, AuthController.register);
router.post('/login', validateLogin, handleValidationErrors, AuthController.login);
router.get('/roles', AuthController.getRoles);
router.get('/verify', AuthController.verifyToken);

module.exports = router;