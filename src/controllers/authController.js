// src/controllers/authController.js - ACTUALIZADO PARA SP
const User = require('../models/User');
const { MESSAGES, ROLES } = require('../../config/constants');
const jwt = require('jsonwebtoken');

class AuthController {
  // Registro de usuario - ACTUALIZADO para usar tu SP
  static async register(req, res) {
    try {
      const { username, password, nombre, apellido, email, id_rol } = req.body;

      console.log('📝 Datos recibidos para registro:', {
        username, nombre, apellido, email, id_rol
      });

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

      // Crear usuario usando tu SP
      const user = await User.create({
        username,
        password,
        nombre,
        apellido,
        email: email || null,
        id_rol: id_rol || ROLES.CLIENTE
      });

      res.status(201).json({
        success: true,
        message: MESSAGES.SUCCESS.REGISTER,
        data: {
          id: user.id_usuario,
          username: user.username,
          nombre: user.nombre,
          apellido: user.apellido,
          email: user.email,
          id_rol: user.id_rol,
          rol_nombre: user.nombre_rol
        }
      });

    } catch (error) {
      console.error('❌ Error en registro:', error);
      
      // Manejar errores específicos del SP
      if (error.message.includes('ya existe') || 
          error.message.includes('ya está registrado')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }
      
      if (error.message.includes('obligatorio') || 
          error.message.includes('no existe')) {
        return res.status(400).json({
          success: false,
          message: error.message
        });
      }

      res.status(500).json({
        success: false,
        message: error.message || MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }

  // Login de usuario (mantener igual)
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }

      // Autenticar usuario
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
            rol_nombre: user.rol_nombre
          }
        }
      });

    } catch (error) {
      console.error('Error en login:', error);
      res.status(401).json({
        success: false,
        message: error.message || MESSAGES.ERROR.INVALID_CREDENTIALS
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