const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const mesaController = require('../controllers/mesaController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const { ROLES } = require('../../config/constants');


// Rutas protegidas de usuarios
router.get('/users/profile', authenticateToken, UserController.getProfile);
router.put('/users/profile', authenticateToken, UserController.updateProfile);

// Rutas para mesas
router.get('/mesas', authenticateToken, mesaController.obtenerTodas);
router.get('/mesas/estadisticas', authenticateToken, mesaController.obtenerEstadisticas);
router.get('/mesas/ubicacion/:ubicacion', authenticateToken, mesaController.obtenerPorUbicacion);
router.get('/mesas/:id', authenticateToken, mesaController.obtenerPorId);
router.put('/mesas/:id/estado', authenticateToken, mesaController.cambiarEstado);

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