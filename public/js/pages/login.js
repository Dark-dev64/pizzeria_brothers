// public/js/pages/login.js - VERSIÓN MEJORADA
import { initRippleButtons } from '../components/buttons.js';
import { initParticles } from '../components/particles.js';

// Estado del formulario
let formState = {
    isLoading: false,
    errors: {}
};

// Función para mostrar errores en campos
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const inputWrapper = field?.closest('.input-wrapper');
    
    // Crear o actualizar elemento de error
    let errorElement = document.getElementById(fieldId + 'Error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.id = fieldId + 'Error';
        errorElement.className = 'error-message';
        inputWrapper?.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
    inputWrapper?.classList.add('error');
    inputWrapper?.classList.remove('valid');
    
    formState.errors[fieldId] = message;
}

// Función para limpiar errores de campo
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const inputWrapper = field?.closest('.input-wrapper');
    const errorElement = document.getElementById(fieldId + 'Error');
    
    if (errorElement) {
        errorElement.remove();
    }
    
    inputWrapper?.classList.remove('error');
    delete formState.errors[fieldId];
}

// Función para marcar campo como válido
function markFieldAsValid(fieldId) {
    const field = document.getElementById(fieldId);
    const inputWrapper = field?.closest('.input-wrapper');
    
    inputWrapper?.classList.add('valid');
    inputWrapper?.classList.remove('error');
    clearFieldError(fieldId);
}

// Validación en tiempo real
function setupRealTimeValidation() {
    const fields = ['username', 'password'];
    
    fields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('blur', () => {
                validateSingleField(fieldId);
            });
            
            field.addEventListener('input', () => {
                // Limpiar error cuando el usuario empiece a escribir
                if (field.value.trim() && formState.errors[fieldId]) {
                    clearFieldError(fieldId);
                }
            });
        }
    });
}

// Validación individual de campos
function validateSingleField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const value = field.value.trim();
    
    if (!value) {
        showFieldError(fieldId, 'Este campo es obligatorio');
    } else {
        markFieldAsValid(fieldId);
    }
}

// Validación del formulario completo
function validateForm(formData) {
    let isValid = true;
    
    if (!formData.username.trim()) {
        showFieldError('username', 'El usuario es obligatorio');
        isValid = false;
    }
    
    if (!formData.password) {
        showFieldError('password', 'La contraseña es obligatoria');
        isValid = false;
    }
    
    return isValid;
}

// En la función setLoadingState, CORREGIR:
function setLoadingState(loading) {
    formState.isLoading = loading;
    const submitButton = document.querySelector('.btn-primary');
    const registerButton = document.querySelector('.btn-secondary');
    
    if (loading) {
        submitButton.disabled = true;
        registerButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.innerHTML = '<div class="btn-text">Iniciando sesión...</div>';
    } else {
        submitButton.disabled = false;
        registerButton.disabled = false;
        submitButton.classList.remove('loading');
        // ✅ CORREGIDO: Agregar el icono de vuelta
        submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i><div class="btn-text">Iniciar sesión</div>';
    }
}

// Función para mostrar notificación
function showNotification(message, type = 'error') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Estilos para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: type === 'success' ? '#4caf50' : '#ff5a5a',
        color: 'white',
        padding: '15px 20px',
        borderRadius: '15px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        zIndex: '10000',
        maxWidth: '400px',
        animation: 'slideInRight 0.3s ease-out',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontWeight: '600'
    });

    document.body.appendChild(notification);

    // Remover después de 5 segundos
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Función para manejar el login
async function handleLogin(event) {
    event.preventDefault();
    
    if (formState.isLoading) return;
    
    const formData = {
        username: document.getElementById('username').value.trim(),
        password: document.getElementById('password').value
    };

    // Limpiar errores previos
    clearFieldError('username');
    clearFieldError('password');

    // Validar formulario
    if (!validateForm(formData)) {
        return;
    }

    // Mostrar estado de carga
    setLoadingState(true);

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: formData.username,
                password: formData.password
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Manejar errores específicos del servidor
            if (data.message?.includes('usuario') || data.message?.includes('Usuario') || data.message?.includes('username')) {
                showFieldError('username', 'Usuario no encontrado');
            } else if (data.message?.includes('contraseña') || data.message?.includes('password') || data.message?.includes('Credenciales')) {
                showFieldError('password', 'Contraseña incorrecta');
            } else {
                showNotification(data.message || 'Error en el inicio de sesión');
            }
            return;
        }

        if (data.success) {
            // Guardar token y datos del usuario
            localStorage.setItem('token', data.data.token);
            localStorage.setItem('user', JSON.stringify(data.data.user));
            
            showNotification('¡Inicio de sesión exitoso!', 'success');
            
            // Redirigir después de un breve delay
            setTimeout(() => {
                redirectByRole(data.data.user.id_rol);
            }, 1500);
            
        } else {
            showNotification(data.message || 'Error en el inicio de sesión');
        }
    } catch (error) {
        console.error('Error en login:', error);
        showNotification('Error de conexión. Intenta nuevamente.');
    } finally {
        setLoadingState(false);
    }
}

// Función para redirigir según el rol
function redirectByRole(roleId) {
    const routes = {
        1: '/cliente',      // Cliente
        2: '/cajero',       // Cajero
        3: '/admin',        // Administrador
        4: '/cocina',       // Cocina
        5: '/mesero'        // Mesero
    };
    
    window.location.href = routes[roleId] || '/dashboard';
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
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    // Conectar el formulario
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Conectar botón de registro
    const registerBtn = document.getElementById('registerBtn');
    if (registerBtn) {
        registerBtn.addEventListener('click', goToRegister);
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initLoginPage);