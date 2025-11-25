// src/models/User.js - ACTUALIZADO para SP de registro
const { executeSP, executeQuery } = require('../../config/database');
const { SP_NAMES } = require('../../config/constants');
const bcrypt = require('bcryptjs');

class User {
  // Crear usuario usando tu SP - ACTUALIZADO
  static async create(userData) {
    try {
      const {
        username,
        password,
        nombre,
        apellido,
        email = null,
        id_rol = 1
      } = userData;

      console.log('🔐 Creando usuario con datos:', { username, nombre, apellido, id_rol });

      // Hash de contraseña usando bcrypt (o el método que uses)
      const saltRounds = 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      console.log('🔑 Password hash generado');

      // Llamar a tu SP de creación
      const result = await executeSP(SP_NAMES.USUARIO_CREAR, [
        username,
        password_hash,
        nombre,
        apellido,
        email,
        id_rol
      ]);

      console.log('✅ Usuario creado exitosamente:', result[0]);
      return result[0];

    } catch (error) {
      console.error('❌ Error en User.create:', error);
      
      // Manejar errores específicos del SP
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate')) {
        throw new Error('El usuario ya está registrado');
      }
      
      if (error.message.includes('ya existe') || error.message.includes('ya está registrado')) {
        throw new Error(error.message);
      }
      
      if (error.message.includes('obligatorio')) {
        throw new Error(error.message);
      }
      
      throw error;
    }
  }

  // Login usando SP (mantener igual o ajustar según tu SP de login)
  static async login(username, password) {
    try {
      // Hash de la contraseña para comparar
      const password_hash = await bcrypt.hash(password, 12);
      
      // Llamar al SP de login
      const result = await executeSP(SP_NAMES.USUARIO_LOGIN, [
        username,
        password_hash
      ]);
      
      if (result.length === 0) {
        throw new Error('Credenciales inválidas');
      }

      const user = result[0];
      return user;

    } catch (error) {
      console.error('Error en User.login:', error);
      throw error;
    }
  }

  // Resto de métodos se mantienen igual...
  static async findById(id) {
    try {
      const result = await executeSP(SP_NAMES.USUARIO_OBTENER, [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw error;
    }
  }

  static async findByUsername(username) {
    try {
      const [result] = await executeQuery(
        'SELECT * FROM usuarios WHERE username = ? AND activo = 1',
        [username]
      );
      return result || null;
    } catch (error) {
      throw error;
    }
  }

  static async getRoles() {
    try {
      console.log('📋 Obteniendo roles con SP:', SP_NAMES.ROLES_LISTAR);
      const result = await executeSP(SP_NAMES.ROLES_LISTAR);
      console.log('✅ Roles obtenidos:', result);
      return result;
    } catch (error) {
      console.error('❌ Error obteniendo roles:', error);
      throw error;
    }
  }

  static async usernameExists(username) {
    try {
      const user = await this.findByUsername(username);
      return user !== null;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;