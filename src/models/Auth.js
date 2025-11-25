const { executeSP } = require('../../config/database');
const { SP_NAMES } = require('../../config/constants');

class Auth {
  // Verificar si el usuario existe por email
  static async userExists(email) {
    try {
      const result = await executeSP(SP_NAMES.USUARIO_LOGIN, [email]);
      return result.length > 0;
    } catch (error) {
      throw error;
    }
  }

  // Cambiar contraseña (podrías crear un SP para esto)
  static async changePassword(userId, newPassword) {
    try {
      // Esto es un ejemplo - necesitarías crear un SP para cambiar contraseña
      const bcrypt = require('bcryptjs');
      const password_hash = await bcrypt.hash(newPassword, 12);
      
      // Llamar a un SP de actualización de contraseña
      // const result = await executeSP('sp_usuario_cambiar_password', [userId, password_hash]);
      // return result[0];
      
      return { success: true }; // Placeholder
    } catch (error) {
      throw error;
    }
  }

  // Registrar intento de login (para auditoría)
  static async logLoginAttempt(userId, success, ipAddress) {
    try {
      // Podrías crear un SP para registrar intentos de login
      // await executeSP('sp_log_login', [userId, success, ipAddress]);
      console.log(`Login attempt - User: ${userId}, Success: ${success}, IP: ${ipAddress}`);
    } catch (error) {
      console.error('Error logging login attempt:', error);
    }
  }
}

module.exports = Auth;