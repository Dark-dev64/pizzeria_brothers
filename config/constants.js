const SP_NAMES = {
  USUARIO_CREAR: 'sp_usuario_crear',
  USUARIO_LOGIN: 'sp_usuario_login',
  USUARIO_OBTENER: 'sp_usuario_obtener',
  USUARIO_ACTUALIZAR: 'sp_usuario_actualizar',
  USUARIOS_LISTAR: 'sp_usuarios_listar',
  ROLES_LISTAR: 'sp_roles_listar',
  MESAS_LISTAR: 'sp_mesas_listar',
  MESAS_ESTADISTICAS: 'sp_mesas_estadisticas',
  MESA_CAMBIAR_ESTADO: 'sp_mesa_cambiar_estado',
  MESAS_POR_PISO: 'sp_mesas_por_piso',
  ESTADOS_MESA_LISTAR: 'sp_estados_mesa_listar'
};

const ROLES = {
  CLIENTE: 1,
  CAJERO: 2,
  ADMIN: 3,
  COCINA: 4,
  MESERO: 5
};

const MESSAGES = {
  SUCCESS: {
    LOGIN: 'Inicio de sesión exitoso',
    REGISTER: 'Usuario registrado exitosamente'
  },
  ERROR: {
    INVALID_CREDENTIALS: 'Credenciales inválidas',
    DB_CONNECTION: 'Error de conexión con la base de datos',
    USER_NOT_FOUND: 'Usuario no encontrado'
  }
};

module.exports = {
  SP_NAMES,
  ROLES,
  MESSAGES
};