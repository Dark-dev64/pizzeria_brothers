const User = require('../models/User');
const { MESSAGES, ROLES } = require('../../config/constants');
const jwt = require('jsonwebtoken');

const ERROR_TYPES = {
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_INACTIVE: 'USER_INACTIVE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',
  INVALID_USER_DATA: 'INVALID_USER_DATA',
  LOGIN_ERROR: 'LOGIN_ERROR'
};

const ERROR_RESPONSES = {
  [ERROR_TYPES.USER_NOT_FOUND]: {
    message: 'Usuario no encontrado',
    status: 404
  },
  [ERROR_TYPES.USER_INACTIVE]: {
    message: 'Usuario inactivo',
    status: 403
  },
  [ERROR_TYPES.INVALID_PASSWORD]: {
    message: 'Contraseña incorrecta',
    status: 401
  },
  [ERROR_TYPES.INVALID_USER_DATA]: {
    message: 'Datos de usuario inválidos',
    status: 500
  },
  [ERROR_TYPES.LOGIN_ERROR]: {
    message: 'Error en el inicio de sesión',
    status: 500
  }
};

class AuthController {
  static validateRegistration(data) {
    const { nombre, apellido, username, password } = data;
    const errors = [];

    if (!nombre?.trim()) errors.push('El nombre es requerido');
    if (!apellido?.trim()) errors.push('El apellido es requerido');
    if (!username?.trim()) errors.push('El usuario es requerido');
    if (!password) errors.push('La contraseña es requerida');
    
    if (password && password.length < 6) {
      errors.push('La contraseña debe tener al menos 6 caracteres');
    }

    return errors;
  }

  static async register(req, res) {
    try {
      const { username, password, nombre, apellido, email, id_rol } = req.body;

      const validationErrors = this.validateRegistration(req.body);
      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: validationErrors.join(', ')
        });
      }

      const user = await User.create({
        username: username.trim(),
        password,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        email: email?.trim() || null,
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
      const status = error.message.includes('ya existe') ? 400 : 500;
      res.status(status).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username?.trim() || !password) {
        return res.status(400).json({
          success: false,
          message: 'Usuario y contraseña son requeridos'
        });
      }

      const user = await User.login(username.trim(), password);

      const token = jwt.sign(
        { 
          userId: user.id_usuario, 
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
            id: user.id_usuario,
            username: user.username,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            id_rol: user.id_rol,
            rol_nombre: user.nombre_rol
          }
        }
      });

    } catch (error) {
      const errorResponse = ERROR_RESPONSES[error.message] || {
        message: MESSAGES.ERROR.INVALID_CREDENTIALS,
        status: 401
      };

      res.status(errorResponse.status).json({
        success: false,
        message: errorResponse.message
      });
    }
  }

  static async getRoles(req, res) {
    try {
      const roles = await User.getRoles();
      res.json({
        success: true,
        data: roles
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }

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
            id: user.id_usuario,
            nombre: user.nombre,
            apellido: user.apellido,
            username: user.username,
            id_rol: user.id_rol
          }
        }
      });

    } catch (error) {
      const message = error.name === 'TokenExpiredError' 
        ? 'Token expirado' 
        : 'Token inválido';

      res.status(401).json({
        success: false,
        message
      });
    }
  }
}

module.exports = AuthController;