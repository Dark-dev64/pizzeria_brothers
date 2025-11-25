// public/js/pages/register.js
import { initRippleButtons } from '../components/buttons.js';
import { initParticles } from '../components/particles.js';
import { togglePasswordVisibility, validatePassword, initRoleSelector } from '../components/form-validator.js';

function initRegisterPage() {
  // Inicializar efectos de botones
  initRippleButtons();
  
  // Inicializar partículas de fondo
  initParticles();
  
  // Inicializar selector de roles
  initRoleSelector();
  
  // Configurar event listeners para toggle de contraseñas
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      // Buscar el input de contraseña más cercano
      const passwordWrapper = this.closest('.password-wrapper');
      if (passwordWrapper) {
        const passwordInput = passwordWrapper.querySelector('input[type="password"], input[type="text"]');
        if (passwordInput) {
          togglePasswordVisibility(passwordInput.id);
        }
      }
    });
  });
  
  // Validación del formulario
  const registerForm = document.getElementById('registerForm');
  if (registerForm) {
    registerForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      const password = document.getElementById('password')?.value || '';
      const confirmPassword = document.getElementById('confirmPassword')?.value || '';
      
      const validation = validatePassword(password, confirmPassword);
      if (!validation.isValid) {
        alert(validation.message);
        return;
      }
      
      // Aquí iría la lógica para enviar los datos al servidor
      console.log('Formulario enviado:', {
        nombre: document.getElementById('nombre')?.value,
        apellido: document.getElementById('apellido')?.value,
        email: document.getElementById('email')?.value,
        id_rol: document.getElementById('id_rol')?.value,
        additional_info: document.getElementById('additional_info')?.value
      });
      
      alert('¡Cuenta creada exitosamente! Serás redirigido al login.');
      // window.location.href = '/login';
    });
  }
  
  console.log('Register page initialized');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initRegisterPage);