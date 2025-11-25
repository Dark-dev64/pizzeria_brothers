const express = require('express');
const UserController = require('../controllers/userController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../../config/constants');

const router = express.Router();

// Rutas protegidas de usuarios
router.get('/users/profile', authenticateToken, UserController.getProfile);
router.put('/users/profile', authenticateToken, UserController.updateProfile);

// Ruta solo para administradores
router.get('/users/all', 
  authenticateToken, 
  requireRole([ROLES.Administrador]), 
  UserController.getAllUsers
);

// Otras rutas de API pueden ir aquí
router.get('/test', authenticateToken, (req, res) => {
  res.json({
    success: true,
    message: 'API funcionando correctamente',
    user: req.user
  });
});

module.exports = router;