const User = require('../models/User');
const { MESSAGES } = require('../../config/constants');

class UserController {
  // Obtener perfil de usuario
  static async getProfile(req, res) {
    try {
      const userId = req.userId; // Del middleware de autenticación
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: MESSAGES.ERROR.USER_NOT_FOUND
        });
      }

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            id_rol: user.id_rol,
            fecha_creacion: user.fecha_creacion
          }
        }
      });

    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }

  // Actualizar perfil de usuario
  static async updateProfile(req, res) {
    try {
      const userId = req.userId;
      const { nombre, apellido, email } = req.body;

      // Validaciones
      if (!nombre || !apellido) {
        return res.status(400).json({
          success: false,
          message: 'Nombre y apellido son requeridos'
        });
      }

      const updatedUser = await User.update(userId, {
        nombre,
        apellido,
        email
      });

      res.json({
        success: true,
        message: MESSAGES.SUCCESS.USER_UPDATED,
        data: {
          user: updatedUser
        }
      });

    } catch (error) {
      console.error('Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: error.message || MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }

  // Obtener todos los usuarios (solo admin)
  static async getAllUsers(req, res) {
    try {
      // En una implementación completa, aquí verificarías el rol del usuario
      const users = await User.findAll();
      
      res.json({
        success: true,
        data: {
          users: users.map(user => ({
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            email: user.email,
            id_rol: user.id_rol,
            fecha_creacion: user.fecha_creacion
          }))
        }
      });

    } catch (error) {
      console.error('Error obteniendo usuarios:', error);
      res.status(500).json({
        success: false,
        message: MESSAGES.ERROR.DB_CONNECTION
      });
    }
  }
}

module.exports = UserController;