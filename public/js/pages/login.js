// public/js/pages/login.js - ACTUALIZADO PARA USERNAME
import { initRippleButtons } from '../components/buttons.js';
import { initParticles } from '../components/particles.js';

// Función para manejar el login
async function handleLogin(event) {
  event.preventDefault();
  
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  // Validación básica
  if (!username || !password) {
    alert('Por favor, completa todos los campos');
    return;
  }

  try {
    console.log('Enviando login...', { username, password });
    
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    });

    const data = await response.json();
    console.log('Respuesta del servidor:', data);

    if (data.success) {
      // Guardar token y datos del usuario
      localStorage.setItem('token', data.data.token);
      localStorage.setItem('user', JSON.stringify(data.data.user));
      
      // Mostrar mensaje de éxito
      alert('¡Login exitoso! Redirigiendo...');
      
      // Redirigir según el rol
      redirectByRole(data.data.user.id_rol);
      
    } else {
      alert('Error: ' + data.message);
    }
  } catch (error) {
    console.error('Error en login:', error);
    alert('Error de conexión. Verifica la consola para más detalles.');
  }
}

// Función para redirigir según el rol
function redirectByRole(roleId) {
  switch(roleId) {
    case 1: // Cliente
      window.location.href = '/cliente';
      break;
    case 2: // Cajero
      window.location.href = '/cajero';
      break;
    case 3: // Administrador
      window.location.href = '/admin';
      break;
    case 4: // Cocina
      window.location.href = '/cocina';
      break;
    default:
      window.location.href = '/dashboard';
  }
}

// Función para ir al registro
function goToRegister() {
  window.location.href = '/register';
}

// Inicializar la página
function initLoginPage() {
  // Inicializar efectos
  initRippleButtons();
  initParticles();
  
  // Conectar el formulario al manejador
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
    console.log('Formulario de login conectado - USERNAME VERSION');
  } else {
    console.error('No se encontró el formulario de login');
  }
  
  // Conectar botón de registro
  const registerBtn = document.getElementById('registerBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', goToRegister);
  }
  
  console.log('Login page initialized - USERNAME SYSTEM');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initLoginPage);