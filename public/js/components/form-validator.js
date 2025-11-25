// public/js/components/form-validator.js
function togglePasswordVisibility(fieldId) {
  const field = document.getElementById(fieldId);
  if (!field) return;
  
  const type = field.getAttribute('type') === 'password' ? 'text' : 'password';
  field.setAttribute('type', type);
}

function validatePassword(password, confirmPassword) {
  if (password !== confirmPassword) {
    return { isValid: false, message: 'Las contraseñas no coinciden' };
  }
  
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  
  return { isValid: true, message: 'Contraseña válida' };
}

function initRoleSelector() {
  const roleSelect = document.getElementById('id_rol');
  const roleDescription = document.getElementById('roleDescription');
  const additionalInfo = document.getElementById('additionalInfo');
  const additionalTextarea = document.getElementById('additional_info');

  if (!roleSelect) return;

  roleSelect.addEventListener('change', function() {
    switch(this.value) {
      case '1': // Cliente
        roleDescription.textContent = 'Perfecto! Podrás ordenar pizzas y hacer seguimiento de tus pedidos.';
        additionalTextarea.placeholder = '¿Alguna preferencia alimenticia o alergia que debamos conocer? (opcional)';
        additionalInfo.style.display = 'block';
        break;
      case '2': // Repartidor
        roleDescription.textContent = 'Únete a nuestro equipo de repartidores. Requiere verificación adicional.';
        additionalTextarea.placeholder = 'Información de vehículo y disponibilidad horaria...';
        additionalInfo.style.display = 'block';
        break;
      case '3': // Administrador
        roleDescription.textContent = 'Acceso completo al sistema de gestión. Requiere autorización especial.';
        additionalTextarea.placeholder = 'Motivo de la solicitud de acceso administrativo...';
        additionalInfo.style.display = 'block';
        break;
      case '4': // Cocina
        roleDescription.textContent = 'Forma parte de nuestro equipo de cocina. Experiencia requerida.';
        additionalTextarea.placeholder = 'Experiencia previa en cocina o preparación de pizzas...';
        additionalInfo.style.display = 'block';
        break;
      default:
        roleDescription.textContent = 'Selecciona el tipo de usuario que mejor describa tu propósito';
        additionalInfo.style.display = 'none';
    }
  });
}

export { togglePasswordVisibility, validatePassword, initRoleSelector };