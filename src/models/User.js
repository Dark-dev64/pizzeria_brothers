// src/models/User.js - ACTUALIZADO PARA TU SP
const { executeSP, executeQuery } = require('../../config/database');
const { SP_NAMES } = require('../../config/constants');
const bcrypt = require('bcryptjs');

class User {
  // Crear usuario usando SP
  static async create(userData) {
    try {
      const {
        nombre,
        apellido,
        username,
        password,
        id_rol = 1,
        additional_info = null
      } = userData;

      // Hash de contraseña
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      // Llamar al SP de creación
      const result = await executeSP(SP_NAMES.USUARIO_CREAR, [
        nombre,
        apellido,
        username,
        password_hash,
        id_rol,
        additional_info
      ]);

      return result[0];
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate')) {
        throw new Error('El usuario ya está registrado');
      }
      throw error;
    }
  }

  // ✅ CORREGIDO: Para tu SP que recibe username y password_hash
  static async login(username, password) {
    try {
      // Hash de la contraseña para comparar con la BD
      const password_hash = await bcrypt.hash(password, 12);
      
      // Llamar al SP de login con username y password_hash
      const result = await executeSP(SP_NAMES.USUARIO_LOGIN, [
        username,
        password_hash
      ]);
      
      if (result.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = result[0];
      
      // Tu SP ya hizo la validación, solo retornar el usuario
      return {
        id: user.id_usuario,
        username: user.username,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        id_rol: user.id_rol,
        rol_nombre: user.nombre_rol,
        activo: user.activo,
        fecha_creacion: user.fecha_creacion
      };

    } catch (error) {
      // Manejar errores específicos de tu SP
      if (error.message.includes('Credenciales inválidas')) {
        throw new Error('Credenciales inválidas');
      }
      if (error.message.includes('Usuario inactivo')) {
        throw new Error('Usuario inactivo');
      }
      throw error;
    }
  }

  // Obtener usuario por ID usando SP
  static async findById(id) {
    try {
      const result = await executeSP(SP_NAMES.USUARIO_OBTENER, [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  }

  // Buscar por username (necesitarías un SP específico para esto)
  static async findByUsername(username) {
    try {
      // Si no tienes un SP para buscar solo por username, podemos usar uno existente
      // o crear una función temporal
      const [result] = await executeQuery(
        'SELECT * FROM usuarios WHERE username = ? AND activo = 1',
        [username]
      );
      return result || null;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar usuario usando SP
  static async update(id, userData) {
    try {
      const { nombre, apellido, username, id_rol, additional_info } = userData;
      
      const result = await executeSP(SP_NAMES.USUARIO_ACTUALIZAR, [
        id,
        nombre,
        apellido,
        username,
        id_rol,
        additional_info
      ]);

      return result[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los roles usando SP
  static async getRoles() {
    try {
      const result = await executeSP(SP_NAMES.ROLES_LISTAR);
      return result;
    } catch (error) {
      throw error;
    }
  }

  // Verificar si username existe
  static async usernameExists(username) {
    try {
      const user = await this.findByUsername(username);
      return user !== null;
    } catch (error) {
      throw error;
    }
  }

  // Obtener todos los usuarios
  static async findAll() {
    try {
      const result = await executeSP('sp_usuarios_listar');
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;