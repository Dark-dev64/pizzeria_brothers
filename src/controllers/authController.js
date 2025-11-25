// src/controllers/authController.js - ACTUALIZADO PARA TU SP
const User = require('../models/User');
const { MESSAGES, ROLES } = require('../../config/constants');
const jwt = require('jsonwebtoken');

class AuthController {
  // Registro de usuario
  static async register(req, res) {
    try {
      const { nombre, apellido, username, password, id_rol, additional_info } = req.body;

      // Validaciones básicas
      if (!nombre || !apellido || !username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, apellido, usuario y contraseña son requeridos'
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Verificar si el username ya existe
      const usernameExists = await User.usernameExists(username);
      if (usernameExists) {
        return res.status(400).json({
          success: false,
          message: MESSAGES.ERROR.USER_EXISTS
        });
      }

      // Crear usuario
      const user = await User.create({
        nombre,
        apellido,
        username: username,
        password,
        id_rol: id_rol || ROLES.CLIENTE,
        additional_info: additional_info || null
      });

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.REGISTER,
        data: {
          id: user.id,
          nombre: user.nombre,
          apellido: user.apellido,
          username: user.username,
          id_rol: user.id_rol
        }
      });

    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({
        success: false,
        message: error.message || MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }

  // Login de usuario - CORREGIDO PARA TU SP
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }

      // Autenticar usuario usando tu SP
      const user = await User.login(username, password);

      // Generar token JWT
      const token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username,
          role: user.id_rol 
        },
        process.env.JWT_SECRET || 'pizzeria_secret_key',
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.LOGIN,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            id_rol: user.id_rol,
            rol_nombre: user.rol_nombre,
            activo: user.activo
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      
      // Manejar errores específicos de tu SP
      let statusCode = 401;
      let errorMessage = error.message || MESSAGES.ERROR.INVALID_CREDENTIALS;
      
      if (error.message.includes('Usuario inactivo')) {
        statusCode = 403;
        errorMessage = 'Tu cuenta está inactiva';
      }
      
      res.status(statusCode).json({
        success: false,
        message: errorMessage
      });
    }
  }

  // Obtener roles disponibles
  static async getRoles(req, res) {
    try {
      const roles = await User.getRoles();
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      console.error('Error obteniendo roles:', error);
      res.status(500).json({
        success: false,
        message: MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }

  // Verificar token
  static async verifyToken(req, res) {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        return res.status(401).json({
          success: false,
          message: 'Token no proporcionado'
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'pizzeria_secret_key');
      
      // Obtener información actualizada del usuario
      const user = await User.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            username: user.username,
            id_rol: user.id_rol
          }
        }
      });

    } catch (error) {
      console.error('Error verificando token:', error);
      res.status(401).json({
        success: false,
        message: 'Token inválido o expirado'
      });
    }
  }
}

module.exports = AuthController;