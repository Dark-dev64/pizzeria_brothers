// public/js/pages/login.js - VERSIÓN CORREGIDA
import { initRippleButtons } from '../components/buttons.js';
import { initParticles } from '../components/particles.js';

// Constantes
const ROUTES = {
    1: '/cliente',
    2: '/cajero', 
    3: '/admin',
    4: '/cocina',
    5: '/mesero'
};

const ERROR_MESSAGES = {
    USER_NOT_FOUND: 'Usuario no encontrado',
    WRONG_PASSWORD: 'Contraseña incorrecta',
    REQUIRED_FIELD: 'Este campo es obligatorio',
    CONNECTION_ERROR: 'Error de conexión. Intenta nuevamente.',
    LOGIN_SUCCESS: '¡Inicio de sesión exitoso!',
    LOGIN_ERROR: 'Error en el inicio de sesión'
};

// Estado del formulario
const formState = {
    isLoading: false,
    errors: new Map()
};

// Cache de elementos DOM
const elements = {
    get username() { return document.getElementById('username'); },
    get password() { return document.getElementById('password'); },
    get loginForm() { return document.getElementById('loginForm'); },
    get registerBtn() { return document.getElementById('registerBtn'); },
    get submitButton() { return document.querySelector('.btn-primary'); },
    get registerButton() { return document.querySelector('.btn-secondary'); }
};

// Utilidades
const DOM = {
    createElement(tag, className, innerHTML) {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (innerHTML) element.innerHTML = innerHTML;
        return element;
    },

    showElement(element, show = true) {
        element.style.display = show ? '' : 'none';
    }
};

// Gestión de errores de campos - CORREGIDO
const FieldManager = {
    showError(fieldId, message) {
        const field = elements[fieldId];
        if (!field) return;

        const inputContainer = field.closest('.input-with-icon'); // ✅ Cambiado a .input-with-icon
        let errorElement = document.getElementById(`${fieldId}Error`);

        if (!errorElement) {
            errorElement = DOM.createElement('div', 'error-message');
            errorElement.id = `${fieldId}Error`;
            inputContainer?.parentNode.appendChild(errorElement);
        }

        errorElement.textContent = message;
        inputContainer?.classList.add('error');
        inputContainer?.classList.remove('valid');
        formState.errors.set(fieldId, message);
    },

    clearError(fieldId) {
        const field = elements[fieldId];
        if (!field) return;

        const inputContainer = field.closest('.input-with-icon'); // ✅ Cambiado a .input-with-icon
        const errorElement = document.getElementById(`${fieldId}Error`);

        errorElement?.remove();
        inputContainer?.classList.remove('error');
        formState.errors.delete(fieldId);
    },

    markValid(fieldId) {
        const field = elements[fieldId];
        if (!field) return;

        const inputContainer = field.closest('.input-with-icon'); // ✅ Cambiado a .input-with-icon
        inputContainer?.classList.add('valid');
        inputContainer?.classList.remove('error');
        this.clearError(fieldId);
    },

    clearAllErrors() {
        formState.errors.forEach((_, fieldId) => this.clearError(fieldId));
        formState.errors.clear();
    }
};

// Validación
const Validator = {
    required(value) {
        return value && value.trim().length > 0;
    },

    validateField(fieldId) {
        const field = elements[fieldId];
        if (!field) return;

        const value = field.value.trim();
        const isRequired = field.hasAttribute('required');

        if (isRequired && !this.required(value)) {
            FieldManager.showError(fieldId, ERROR_MESSAGES.REQUIRED_FIELD);
        } else if (value) {
            FieldManager.markValid(fieldId);
        } else {
            FieldManager.clearError(fieldId);
        }
    },

    validateForm(formData) {
        FieldManager.clearAllErrors();
        let isValid = true;

        if (!this.required(formData.username)) {
            FieldManager.showError('username', ERROR_MESSAGES.REQUIRED_FIELD);
            isValid = false;
        }

        if (!this.required(formData.password)) {
            FieldManager.showError('password', ERROR_MESSAGES.REQUIRED_FIELD);
            isValid = false;
        }

        return isValid;
    }
};

// Gestión de estado de carga
const LoadingManager = {
    setLoading(loading) {
        formState.isLoading = loading;
        
        if (loading) {
            elements.submitButton.disabled = true;
            elements.registerButton.disabled = true;
            elements.submitButton.classList.add('loading');
            elements.submitButton.innerHTML = '<div class="btn-text">Iniciando sesión...</div>';
        } else {
            elements.submitButton.disabled = false;
            elements.registerButton.disabled = false;
            elements.submitButton.classList.remove('loading');
            elements.submitButton.innerHTML = '<i class="fas fa-sign-in-alt"></i><div class="btn-text">Iniciar sesión</div>';
        }
    }
};

// Notificaciones
const NotificationManager = {
    show(message, type = 'error') {
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-triangle';
        const notification = DOM.createElement(
            'div', 
            `notification notification-${type}`,
            `
                <div class="notification-content">
                    <i class="fas ${icon}"></i>
                    <span>${message}</span>
                </div>
            `
        );

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

        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
};

// API Client
const AuthAPI = {
    async login(credentials) {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials)
        });

        const data = await response.json();
        return { response, data };
    },

    handleLoginError(data) {
        const message = data.message?.toLowerCase() || '';
        
        if (message.includes('usuario') || message.includes('username')) {
            FieldManager.showError('username', ERROR_MESSAGES.USER_NOT_FOUND);
        } else if (message.includes('contraseña') || message.includes('password') || message.includes('credenciales')) {
            FieldManager.showError('password', ERROR_MESSAGES.WRONG_PASSWORD);
        } else {
            NotificationManager.show(data.message || ERROR_MESSAGES.LOGIN_ERROR);
        }
    },

    handleLoginSuccess(data) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        NotificationManager.show(ERROR_MESSAGES.LOGIN_SUCCESS, 'success');
        
        setTimeout(() => {
            this.redirectByRole(data.data.user.id_rol);
        }, 1500);
    },

    redirectByRole(roleId) {
        window.location.href = ROUTES[roleId] || '/dashboard';
    }
};

// Manejador del formulario de login
const LoginHandler = {
    async handleSubmit(event) {
        event.preventDefault();
        
        if (formState.isLoading) return;
        
        const formData = {
            username: elements.username.value.trim(),
            password: elements.password.value
        };

        FieldManager.clearAllErrors();

        if (!Validator.validateForm(formData)) {
            return;
        }

        LoadingManager.setLoading(true);

        try {
            const { response, data } = await AuthAPI.login(formData);

            if (!response.ok) {
                AuthAPI.handleLoginError(data);
                return;
            }

            if (data.success) {
                AuthAPI.handleLoginSuccess(data);
            } else {
                NotificationManager.show(data.message || ERROR_MESSAGES.LOGIN_ERROR);
            }
        } catch (error) {
            console.error('Error en login:', error);
            NotificationManager.show(ERROR_MESSAGES.CONNECTION_ERROR);
        } finally {
            LoadingManager.setLoading(false);
        }
    },

    goToRegister() {
        window.location.href = '/register';
    }
};

// Configuración de eventos
const EventManager = {
    setupRealTimeValidation() {
        const fields = ['username', 'password'];
        
        fields.forEach(fieldId => {
            const field = elements[fieldId];
            if (!field) return;

            field.addEventListener('blur', () => Validator.validateField(fieldId));
            
            field.addEventListener('input', () => {
                if (field.value.trim() && formState.errors.has(fieldId)) {
                    FieldManager.clearError(fieldId);
                }
            });
        });
    },

    setupFormEvents() {
        if (elements.loginForm) {
            elements.loginForm.addEventListener('submit', LoginHandler.handleSubmit);
        }
        
        if (elements.registerBtn) {
            elements.registerBtn.addEventListener('click', LoginHandler.goToRegister);
        }
    }
};

// Inicialización
function initLoginPage() {
    initRippleButtons();
    initParticles();
    
    EventManager.setupRealTimeValidation();
    EventManager.setupFormEvents();
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLoginPage);
} else {
    initLoginPage();
}

// Exportar para testing
export {
    FieldManager,
    Validator,
    AuthAPI,
    LoginHandler,
    formState
};