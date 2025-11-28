// src/middleware/validation.js
const { body, validationResult } = require('express-validator');

// Lista corta de contraseñas comunes para rechazo básico
const commonPasswords = [
  '123456', 'password', '12345678', 'qwerty', 'abc123', '111111', '123123', 'admin', 'letmein'
];

// Validaciones para registro
const validateRegister = [
  body('nombre')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El nombre debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/u)
    .withMessage('El nombre solo puede contener letras y espacios (no caracteres especiales)'),
  
  body('apellido')
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('El apellido debe tener entre 3 y 50 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$/u)
    .withMessage('El apellido solo puede contener letras y espacios (no caracteres especiales)'),
  
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('El usuario debe tener entre 3 y 30 caracteres')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('El usuario solo puede contener letras, números y guiones bajos')
    .custom(value => {
      if (/^\d+$/.test(value)) {
        throw new Error('El usuario no puede ser sólo números');
      }
      return true;
    }),

  // Email opcional
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Por favor ingresa un email válido')
    .normalizeEmail(),
  
  body('password')
    .isLength({ min: 8 })
    .withMessage('La contraseña debe tener al menos 8 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/)
    .withMessage('La contraseña debe contener mayúscula, minúscula, número y un carácter especial')
    .custom(value => {
      if (!value) return true;
      const low = String(value).toLowerCase();
      if (commonPasswords.includes(low)) {
        throw new Error('La contraseña es demasiado común');
      }
      return true;
    }),
  
  body('id_rol')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rol inválido')
];

// Validaciones para login
const validateLogin = [
  body('username')
    .trim()
    .notEmpty()
    .withMessage('El usuario es requerido')
    .isLength({ min: 3, max: 50 })
    .withMessage('El usuario debe tener entre 3 y 50 caracteres'),
  
  body('password')
    .notEmpty()
    .withMessage('La contraseña es requerida')
];

// Middleware para manejar errores de validación
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    console.log('❌ Errores de validación encontrados:', errors.array());
    
    return res.status(400).json({
      success: false,
      message: 'Errores de validación',
      errors: errors.array().map(error => ({
        field: error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }
  
  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  handleValidationErrors
};