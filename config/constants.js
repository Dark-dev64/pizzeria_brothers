// config/constants.js
module.exports = {
  ROLES: {
    CLIENTE: 1,
    CAJERO: 2,
    ADMINISTRADOR: 3,
    COCINA: 4,
    MESERO: 5
  },
  
  SP_NAMES: {
    // Stored Procedures de usuarios
    USUARIO_CREAR: 'sp_usuario_crear',
    USUARIO_LOGIN: 'sp_usuario_login',
    USUARIO_OBTENER: 'sp_usuario_obtener',
    USUARIO_ACTUALIZAR: 'sp_usuario_actualizar',
    
    // Stored Procedures de roles
    ROLES_LISTAR: 'sp_roles_listar'
  },
  
  MESSAGES: {
    SUCCESS: {
      REGISTER: 'Usuario registrado exitosamente',
      LOGIN: 'Login exitoso',
      USER_UPDATED: 'Usuario actualizado correctamente'
    },
    ERROR: {
      DB_CONNECTION: 'Error de conexión a la base de datos',
      USER_EXISTS: 'El nombre de usuario ya existe',
      INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
      USER_NOT_FOUND: 'Usuario no encontrado',
      USER_INACTIVE: 'Usuario inactivo',
      VALIDATION_ERROR: 'Error de validación'
    }
  }
};