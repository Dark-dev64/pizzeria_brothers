const { executeSP, executeQuery } = require('../../config/database');
const { SP_NAMES } = require('../../config/constants');
const bcrypt = require('bcryptjs');

class User {
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

      const password_hash = await bcrypt.hash(password, 12);
      const result = await executeSP(SP_NAMES.USUARIO_CREAR, [
        username,
        password_hash,
        nombre,
        apellido,
        email,
        id_rol
      ]);

      return result[0];

    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY' || error.message.includes('Duplicate')) {
        throw new Error('El usuario ya está registrado');
      }
      
      if (error.message.includes('ya existe') || error.message.includes('ya está registrado')) {
        throw new Error(error.message);
      }
      
      if (error.message.includes('obligatorio')) {
        throw new Error(error.message);
      }
      
      throw new Error('Error al crear usuario');
    }
  }

  static async login(username, password) {
    try {
      const result = await executeSP(SP_NAMES.USUARIO_LOGIN, [username]);
      
      if (!result || result.length === 0) {
        throw new Error('USER_NOT_FOUND');
      }

      const user = result[0];

      if (user.activo !== 1 && user.activo !== true) {
        throw new Error('USER_INACTIVE');
      }

      if (!user.password_hash) {
        throw new Error('INVALID_USER_DATA');
      }

      const isPasswordValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isPasswordValid) {
        throw new Error('INVALID_PASSWORD');
      }

      const { password_hash, activo, ...userSafe } = user;
      return userSafe;

    } catch (error) {
      if (['USER_NOT_FOUND', 'USER_INACTIVE', 'INVALID_PASSWORD', 'INVALID_USER_DATA'].includes(error.message)) {
        throw error;
      }
      
      if (error.message.includes('Usuario no encontrado') || error.message.includes('no existe')) {
        throw new Error('USER_NOT_FOUND');
      }
      
      if (error.message.includes('inactivo')) {
        throw new Error('USER_INACTIVE');
      }
      
      throw new Error('LOGIN_ERROR');
    }
  }

  static async findById(id) {
    try {
      const result = await executeSP(SP_NAMES.USUARIO_OBTENER, [id]);
      return result.length > 0 ? result[0] : null;
    } catch (error) {
      throw new Error('Error al buscar usuario');
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
      throw new Error('Error al buscar usuario por username');
    }
  }

  static async getRoles() {
    try {
      const result = await executeSP(SP_NAMES.ROLES_LISTAR);
      return result;
    } catch (error) {
      throw new Error('Error al obtener roles');
    }
  }

  static async usernameExists(username) {
    try {
      const user = await this.findByUsername(username);
      return user !== null;
    } catch (error) {
      throw new Error('Error al verificar usuario');
    }
  }

  static async update(userId, userData) {
    try {
      const { nombre, apellido, email } = userData;
      
      const result = await executeSP(SP_NAMES.USUARIO_ACTUALIZAR, [
        userId,
        nombre,
        apellido,
        email
      ]);
      
      return result[0];
    } catch (error) {
      throw new Error('Error al actualizar usuario');
    }
  }

  static async findAll() {
    try {
      const result = await executeSP(SP_NAMES.USUARIOS_LISTAR);
      return result;
    } catch (error) {
      throw new Error('Error al obtener usuarios');
    }
  }
}

module.exports = User;