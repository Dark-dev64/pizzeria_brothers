// public/js/pages/register.js - VERSIÓN CORREGIDA
import { initRippleButtons } from '../components/buttons.js';
import { initParticles } from '../components/particles.js';
import { validatePassword } from '../components/form-validator.js';

// Estado del formulario
let formState = {
    isLoading: false,
    errors: {},
    hasInteracted: new Set() // ✅ NUEVO: Para rastrear campos interactuados
};

// Función debounce para optimización
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Sanitización de inputs
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

// Función para cargar roles desde la API
async function loadRoles() {
    try {
        const response = await fetch('/api/auth/roles');
        if (!response.ok) throw new Error('Error en la respuesta');
        
        const data = await response.json();
        
        if (data.success) {
            populateRoles(data.data);
        } else {
            loadStaticRoles();
        }
    } catch (error) {
        console.warn('Error cargando roles desde API, usando roles estáticos:', error);
        loadStaticRoles();
    }
}

// Poblar roles en el select
function populateRoles(roles) {
    const roleSelect = document.getElementById('id_rol');
    const roleDescription = document.getElementById('roleDescription');
    
    if (roleSelect) {
        // Limpiar opciones existentes (excepto la primera)
        while (roleSelect.options.length > 1) {
            roleSelect.remove(1);
        }
        
        // Agregar roles desde la API
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id_rol;
            option.textContent = role.nombre_rol;
            option.setAttribute('data-descripcion', role.descripcion || 'Sin descripción disponible');
            roleSelect.appendChild(option);
        });
        
        // Mostrar descripción del primer rol por defecto
        if (roles.length > 0 && roleDescription) {
            const firstRole = roles[0];
            roleDescription.textContent = firstRole.descripcion || 'Sin descripción disponible';
        }
    }
}

// Función de respaldo si la API falla
function loadStaticRoles() {
    const roles = [
        { id_rol: 1, nombre_rol: 'Cliente', descripcion: 'Clientes que realizan pedidos en el sistema' },
        { id_rol: 2, nombre_rol: 'Cajero', descripcion: 'Personal encargado de la caja y atención al cliente' },
        { id_rol: 3, nombre_rol: 'Administrador', descripcion: 'Administrador con acceso completo al sistema' },
        { id_rol: 4, nombre_rol: 'Cocina', descripcion: 'Personal de cocina encargado de preparar los pedidos' },
        { id_rol: 5, nombre_rol: 'Mesero', descripcion: 'Personal encargado de atender mesas y tomar pedidos' }
    ];
    
    populateRoles(roles);
}

// Función para actualizar la descripción del rol
function updateRoleDescription() {
    const roleSelect = document.getElementById('id_rol');
    const roleDescription = document.getElementById('roleDescription');
    
    if (roleSelect && roleDescription) {
        const selectedOption = roleSelect.options[roleSelect.selectedIndex];
        if (selectedOption.value) {
            const descripcion = selectedOption.getAttribute('data-descripcion') || 'Sin descripción disponible';
            roleDescription.textContent = descripcion;
        } else {
            roleDescription.textContent = 'Selecciona un rol para ver su descripción';
        }
    }
}

// Configurar toggles de contraseña
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (!passwordInput) return;

            const isHidden = passwordInput.type === 'password';
            if (isHidden) {
                passwordInput.type = 'text';
                this.setAttribute('aria-label', 'Ocultar contraseña');
                this.setAttribute('aria-pressed', 'true');
                this.classList.add('show');
            } else {
                passwordInput.type = 'password';
                this.setAttribute('aria-label', 'Mostrar contraseña');
                this.setAttribute('aria-pressed', 'false');
                this.classList.remove('show');
            }
        });
    });
}

// Mostrar fuerza de contraseña
function updatePasswordStrength(password) {
    const strengthBar = document.getElementById('passwordStrength');
    const strengthFill = document.getElementById('passwordStrengthFill');
    
    if (!strengthBar || !strengthFill) return;
    
    let strength = 0;
    let className = '';
    
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    
    // Limpiar clases previas de fuerza
    strengthFill.classList.remove('strength-weak', 'strength-medium', 'strength-strong');
    strengthFill.className = 'password-strength-fill';

    // Si está vacío, dejar ancho 0 y salir
    if (!password || password.length === 0) {
        strengthFill.style.width = '0%';
        return;
    }

    if (strength <= 25) {
        className = 'strength-weak';
    } else if (strength <= 75) {
        className = 'strength-medium';
    } else {
        className = 'strength-strong';
    }

    strengthFill.classList.add(className);
    strengthFill.style.width = '';
}

// Actualizar contador de caracteres
function updateCharCounter(fieldId, maxLength = 50) {
    const field = document.getElementById(fieldId);
    const counter = document.getElementById(fieldId + 'Counter');
    
    if (!field || !counter) return;
    
    const length = field.value.length;
    const remaining = maxLength - length;
    
    counter.textContent = `${length}/${maxLength}`;
    counter.className = 'char-counter';
    
    if (remaining < 10) {
        counter.classList.add('warning');
    }
    if (remaining < 0) {
        counter.classList.add('error');
    }
}

// ✅ FUNCIÓN CORREGIDA: Solo mostrar error si el campo ha sido interactuado
function showFieldError(fieldId, message) {
    // Solo mostrar error si el campo ha sido interactuado
    if (!formState.hasInteracted.has(fieldId)) {
        return;
    }
    
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputContainer = field?.closest('.input-with-icon');
    
    if (inputContainer) {
        inputContainer.classList.add('error');
        inputContainer.classList.remove('valid');
    }
    
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.setAttribute('role', 'alert');
    }
    
    formState.errors[fieldId] = message;
}

// Función para limpiar errores de campo
function clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(fieldId + 'Error');
    const inputContainer = field?.closest('.input-with-icon');
    
    if (inputContainer) {
        inputContainer.classList.remove('error');
        inputContainer.classList.remove('valid');
    }
    
    if (errorElement) {
        errorElement.textContent = '';
        errorElement.removeAttribute('role');
    }
    
    delete formState.errors[fieldId];
}

// Marcar campo como válido
function markFieldAsValid(fieldId) {
    const field = document.getElementById(fieldId);
    const inputContainer = field?.closest('.input-with-icon');
    
    if (inputContainer) {
        inputContainer.classList.add('valid');
        inputContainer.classList.remove('error');
    }
    
    clearFieldError(fieldId);
}

// ✅ FUNCIÓN CORREGIDA: Limpiar todos los errores al inicializar
function clearAllErrors() {
    const errorFields = ['nombre', 'apellido', 'username', 'email', 'password', 'confirmPassword', 'id_rol'];
    errorFields.forEach(field => {
        clearFieldError(field);
    });
    formState.errors = {};
    formState.hasInteracted.clear(); // Limpiar interacciones
}

// Función para validar email
function isValidEmail(email) {
    if (!email) return true; // Email es opcional
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ✅ FUNCIÓN CORREGIDA: Validación individual de campos
function validateSingleField(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const value = field.value.trim();
    const isRequired = field.hasAttribute('required');
    
    // Solo validar si el campo ha sido interactuado o tiene valor
    const shouldValidate = formState.hasInteracted.has(fieldId) || value.length > 0;
    
    if (!shouldValidate) {
        clearFieldError(fieldId);
        return;
    }
    
    switch(fieldId) {
        case 'nombre':
        case 'apellido':
            if (isRequired && !value) {
                showFieldError(fieldId, 'Este campo es requerido');
            } else if (value.length > 50) {
                showFieldError(fieldId, 'Máximo 50 caracteres permitidos');
            } else if (value) {
                markFieldAsValid(fieldId);
            } else {
                clearFieldError(fieldId);
            }
            break;
            
        case 'username':
            if (isRequired && !value) {
                showFieldError(fieldId, 'El nombre de usuario es requerido');
            } else if (value.length < 3) {
                showFieldError(fieldId, 'Mínimo 3 caracteres');
            } else if (value.length > 20) {
                showFieldError(fieldId, 'Máximo 20 caracteres permitidos');
            } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
                showFieldError(fieldId, 'Solo letras, números y guiones bajos');
            } else if (value) {
                markFieldAsValid(fieldId);
            } else {
                clearFieldError(fieldId);
            }
            break;
            
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError('email', 'Por favor ingresa un email válido');
            } else if (value) {
                markFieldAsValid('email');
            } else {
                clearFieldError('email');
            }
            break;
            
        case 'password':
            if (isRequired && !value) {
                showFieldError('password', 'La contraseña es requerida');
            } else if (value) {
                const confirmPassword = document.getElementById('confirmPassword')?.value;
                const validation = validatePassword(value, confirmPassword);
                
                if (!validation.isValid) {
                    showFieldError('password', validation.message);
                } else {
                    markFieldAsValid('password');
                    if (confirmPassword && value === confirmPassword) {
                        markFieldAsValid('confirmPassword');
                    }
                }
                
                updatePasswordStrength(value);
            } else {
                clearFieldError('password');
                updatePasswordStrength('');
            }
            break;
            
        case 'confirmPassword':
            const password = document.getElementById('password')?.value;
            if (isRequired && !value) {
                showFieldError('confirmPassword', 'Confirma tu contraseña');
            } else if (value && password !== value) {
                showFieldError('confirmPassword', 'Las contraseñas no coinciden');
            } else if (value && password === value) {
                markFieldAsValid('confirmPassword');
            } else {
                clearFieldError('confirmPassword');
            }
            break;
            
        case 'id_rol':
            if (isRequired && !value) {
                showFieldError('id_rol', 'Selecciona un rol');
            } else if (value) {
                markFieldAsValid('id_rol');
            } else {
                clearFieldError('id_rol');
            }
            break;
    }
}

// ✅ FUNCIÓN CORREGIDA: Validación completa del formulario (siempre valida en submit)
function validateForm(formData) {
    let isValid = true;

    // Validar campos obligatorios
    const requiredFields = ['nombre', 'apellido', 'username', 'password', 'confirmPassword', 'id_rol'];
    requiredFields.forEach(field => {
        if (!formData[field]) {
            showFieldError(field, 'Este campo es requerido');
            isValid = false;
        }
    });

    // Validaciones específicas
    if (formData.nombre && formData.nombre.length > 50) {
        showFieldError('nombre', 'Máximo 50 caracteres permitidos');
        isValid = false;
    }

    if (formData.apellido && formData.apellido.length > 50) {
        showFieldError('apellido', 'Máximo 50 caracteres permitidos');
        isValid = false;
    }

    if (formData.username) {
        if (formData.username.length < 3) {
            showFieldError('username', 'Mínimo 3 caracteres');
            isValid = false;
        } else if (formData.username.length > 20) {
            showFieldError('username', 'Máximo 20 caracteres permitidos');
            isValid = false;
        } else if (!/^[a-zA-Z0-9_]+$/.test(formData.username)) {
            showFieldError('username', 'Solo letras, números y guiones bajos');
            isValid = false;
        }
    }

    if (formData.email && !isValidEmail(formData.email)) {
        showFieldError('email', 'Por favor ingresa un email válido');
        isValid = false;
    }

    if (formData.password) {
        const passwordValidation = validatePassword(formData.password, formData.confirmPassword);
        if (!passwordValidation.isValid) {
            showFieldError('password', passwordValidation.message);
            isValid = false;
        }
    }

    return isValid;
}

// ✅ FUNCIÓN CORREGIDA: Configurar validación en tiempo real
function setupRealTimeValidation() {
    const fields = ['nombre', 'apellido', 'username', 'email', 'password', 'confirmPassword', 'id_rol'];
    
    fields.forEach(field => {
        const element = document.getElementById(field);
        if (element) {
            // Marcar como interactuado cuando el usuario interactúa con el campo
            const markAsInteracted = () => {
                formState.hasInteracted.add(field);
            };
            
            element.addEventListener('focus', markAsInteracted);
            element.addEventListener('input', debounce(() => {
                markAsInteracted();
                validateSingleField(field);
                
                // Actualizar contadores de caracteres
                if (field === 'nombre' || field === 'apellido' || field === 'username') {
                    updateCharCounter(field, field === 'username' ? 20 : 50);
                }
            }, 300));
            
            element.addEventListener('blur', () => {
                markAsInteracted();
                validateSingleField(field);
            });
        }
    });
    
    // Validación para select de rol
    const roleSelect = document.getElementById('id_rol');
    if (roleSelect) {
        roleSelect.addEventListener('focus', () => {
            formState.hasInteracted.add('id_rol');
        });
        roleSelect.addEventListener('change', () => {
            formState.hasInteracted.add('id_rol');
            validateSingleField('id_rol');
            updateRoleDescription();
        });
    }
}

// Función para manejar el registro
async function handleRegister(event) {
    event.preventDefault();
    
    if (formState.isLoading) return;
    
    // Marcar todos los campos como interactuados al enviar el formulario
    const allFields = ['nombre', 'apellido', 'username', 'email', 'password', 'confirmPassword', 'id_rol'];
    allFields.forEach(field => formState.hasInteracted.add(field));
    
    // Sanitizar y obtener datos del formulario
    const formData = {
        username: document.getElementById('username')?.value.trim(),
        password: document.getElementById('password')?.value,
        confirmPassword: document.getElementById('confirmPassword')?.value,
        nombre: document.getElementById('nombre')?.value.trim(),
        apellido: document.getElementById('apellido')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        id_rol: document.getElementById('id_rol')?.value
    };

    console.log('📤 Datos a enviar:', formData);

    // Validar formulario
    if (!validateForm(formData)) {
        showNotification('Por favor corrige los errores del formulario', 'error');
        return;
    }

    // Mostrar estado de carga
    setLoadingState(true);

    try {
        const requestData = {
            username: formData.username,
            password: formData.password,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email || null,
            id_rol: parseInt(formData.id_rol) || 1
        };

        console.log('🔄 Enviando solicitud a /api/auth/register:', requestData);

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        const data = await response.json();
        console.log('📥 Respuesta del servidor:', data);

        if (!response.ok) {
            // Manejar errores del servidor
            if (data.errors && data.errors.length > 0) {
                data.errors.forEach(error => {
                    showFieldError(error.field, error.message);
                });
                showNotification('Por favor corrige los errores del formulario', 'error');
            } else {
                showNotification(data.message || 'Error en el registro', 'error');
            }
            return;
        }

        if (data.success) {
            showNotification(data.message, 'success');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            showNotification(data.message, 'error');
        }
    } catch (error) {
        console.error('❌ Error en registro:', error);
        showNotification('Error de conexión. Intenta nuevamente.', 'error');
    } finally {
        setLoadingState(false);
    }
}
// Función para mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.setAttribute('role', 'alert');
    notification.setAttribute('aria-live', 'polite');
    notification.innerHTML = `
        <div class="notification-content">
            <span>${message}</span>
        </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Función para manejar estado de carga
function setLoadingState(loading) {
    formState.isLoading = loading;
    const submitButton = document.querySelector('.btn-register');
    
    if (!submitButton) return;
    
    if (loading) {
        submitButton.disabled = true;
        submitButton.classList.add('loading');
        submitButton.innerHTML = '<i class="fas fa-spinner"></i> Creando cuenta...';
        submitButton.setAttribute('aria-label', 'Creando cuenta, por favor espere');
    } else {
        submitButton.disabled = false;
        submitButton.classList.remove('loading');
        submitButton.innerHTML = '<i class="fas fa-user-plus"></i> Crear Cuenta';
        submitButton.removeAttribute('aria-label');
    }
}

// ✅ INICIALIZACIÓN CORREGIDA: Limpiar errores al cargar
function initRegisterPage() {
    // Limpiar todos los errores al inicializar
    clearAllErrors();
    
    // Inicializar efectos de botones
    if (typeof initRippleButtons === 'function') {
        initRippleButtons();
    }
    
    // Inicializar partículas de fondo
    if (typeof initParticles === 'function') {
        initParticles();
    }
    
    // Cargar roles desde la API
    loadRoles();
    
    // Configurar event listener para cambio de rol
    const roleSelect = document.getElementById('id_rol');
    if (roleSelect) {
        roleSelect.addEventListener('change', updateRoleDescription);
    }
    
    // Configurar toggles de contraseñas
    setupPasswordToggles();
    
    // Configurar validación en tiempo real
    setupRealTimeValidation();
    
    // Configurar formulario
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.setAttribute('novalidate', 'true');
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // Inicializar contadores de caracteres
    ['nombre', 'apellido', 'username'].forEach(field => {
        updateCharCounter(field, field === 'username' ? 20 : 50);
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRegisterPage);
} else {
    initRegisterPage();
}