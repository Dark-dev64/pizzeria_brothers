// public/js/pages/register.js - VERSIÓN CON DEBUGGING MEJORADO
import { initRippleButtons } from '../components/buttons.js';
import { initParticles } from '../components/particles.js';
import { togglePasswordVisibility, validatePassword } from '../components/form-validator.js';

// Función para cargar roles desde la API
async function loadRoles() {
    try {
        console.log('🔄 Cargando roles desde API...');
        const response = await fetch('/api/auth/roles');
        const data = await response.json();
        
        console.log('📨 Respuesta de roles:', data);
        
        if (data.success) {
            const roleSelect = document.getElementById('id_rol');
            const roleDescription = document.getElementById('roleDescription');
            
            if (roleSelect) {
                // Limpiar opciones existentes (excepto la primera)
                while (roleSelect.options.length > 1) {
                    roleSelect.remove(1);
                }
                
                // Agregar roles desde la API
                data.data.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role.id_rol;
                    
                    // Agregar emoji según el rol para mejor UX
                    let emoji = '👤';
                    if (role.nombre_rol.toLowerCase().includes('cajero')) emoji = '💼';
                    if (role.nombre_rol.toLowerCase().includes('admin')) emoji = '👨‍💼';
                    if (role.nombre_rol.toLowerCase().includes('cocin')) emoji = '👨‍🍳';
                    
                    option.textContent = `${emoji} ${role.nombre_rol}`;
                    option.setAttribute('data-descripcion', role.descripcion || 'Sin descripción disponible');
                    roleSelect.appendChild(option);
                });
                
                console.log('✅ Roles cargados en select:', data.data);
                
                // Mostrar descripción del primer rol por defecto
                if (data.data.length > 0 && roleDescription) {
                    const firstRole = data.data[0];
                    roleDescription.textContent = firstRole.descripcion || 'Sin descripción disponible';
                }
            }
        } else {
            console.error('❌ Error en respuesta de roles:', data.message);
            loadStaticRoles();
        }
    } catch (error) {
        console.error('❌ Error cargando roles:', error);
        loadStaticRoles();
    }
}

// Función de respaldo si la API falla
function loadStaticRoles() {
    const roles = [
        { id_rol: 1, nombre_rol: 'Cliente', descripcion: 'Clientes que realizan pedidos en el sistema' },
        { id_rol: 2, nombre_rol: 'Cajero', descripcion: 'Personal encargado de la caja y atención al cliente' },
        { id_rol: 3, nombre_rol: 'Administrador', descripcion: 'Administrador con acceso completo al sistema' },
        { id_rol: 4, nombre_rol: 'Cocina', descripcion: 'Personal de cocina encargado de preparar los pedidos' }
    ];
    
    const roleSelect = document.getElementById('id_rol');
    const roleDescription = document.getElementById('roleDescription');
    
    if (roleSelect) {
        while (roleSelect.options.length > 1) {
            roleSelect.remove(1);
        }
        
        roles.forEach(role => {
            const option = document.createElement('option');
            option.value = role.id_rol;
            
            let emoji = '👤';
            if (role.nombre_rol.toLowerCase().includes('cajero')) emoji = '💼';
            if (role.nombre_rol.toLowerCase().includes('admin')) emoji = '👨‍💼';
            if (role.nombre_rol.toLowerCase().includes('cocin')) emoji = '👨‍🍳';
            
            option.textContent = `${emoji} ${role.nombre_rol}`;
            option.setAttribute('data-descripcion', role.descripcion);
            roleSelect.appendChild(option);
        });
        
        if (roleDescription) {
            roleDescription.textContent = roles[0].descripcion;
        }
        
        console.log('✅ Roles estáticos cargados');
    }
}

// Función para actualizar la descripción cuando cambie el rol
function updateRoleDescription() {
    const roleSelect = document.getElementById('id_rol');
    const roleDescription = document.getElementById('roleDescription');
    
    if (roleSelect && roleDescription) {
        const selectedOption = roleSelect.options[roleSelect.selectedIndex];
        if (selectedOption.value) {
            const descripcion = selectedOption.getAttribute('data-descripcion') || 'Sin descripción disponible';
            roleDescription.textContent = descripcion;
            
            roleDescription.style.opacity = '0';
            setTimeout(() => {
                roleDescription.style.opacity = '1';
            }, 150);
        } else {
            roleDescription.textContent = 'Selecciona un rol para ver su descripción';
        }
    }
}

// Función para manejar el toggle de contraseñas
function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
        button.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.getElementById(targetId);
            
            if (passwordInput) {
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    this.innerHTML = '<i class="fas fa-eye-slash"></i>';
                } else {
                    passwordInput.type = 'password';
                    this.innerHTML = '<i class="fas fa-eye"></i>';
                }
            }
        });
    });
}

// Función para manejar el registro - CON DEBUGGING MEJORADO
async function handleRegister(event) {
    event.preventDefault();
    
    const formData = {
        username: document.getElementById('username')?.value.trim(),
        password: document.getElementById('password')?.value,
        confirmPassword: document.getElementById('confirmPassword')?.value,
        nombre: document.getElementById('nombre')?.value.trim(),
        apellido: document.getElementById('apellido')?.value.trim(),
        email: document.getElementById('email')?.value.trim(),
        id_rol: document.getElementById('id_rol')?.value
    };

    console.log('📝 Datos del formulario:', formData);

    // Validación de campos obligatorios
    if (!formData.nombre || !formData.apellido || !formData.username || !formData.password || !formData.id_rol) {
        alert('❌ Por favor, completa todos los campos obligatorios');
        return;
    }

    // Validación de contraseña
    const validation = validatePassword(formData.password, formData.confirmPassword);
    if (!validation.isValid) {
        alert('❌ ' + validation.message);
        return;
    }

    // Validación de email si se proporciona
    if (formData.email && !isValidEmail(formData.email)) {
        alert('❌ Por favor, ingresa un email válido');
        return;
    }

    try {
        console.log('🚀 Enviando datos al servidor...');
        
        const requestData = {
            username: formData.username,
            password: formData.password,
            nombre: formData.nombre,
            apellido: formData.apellido,
            email: formData.email || null,
            id_rol: parseInt(formData.id_rol) || 1
        };

        console.log('📤 Datos enviados:', requestData);

        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestData)
        });

        console.log('📨 Status de respuesta:', response.status);
        console.log('📨 Headers de respuesta:', response.headers);

        const data = await response.json();
        console.log('📨 Respuesta completa del servidor:', data);

        if (!response.ok) {
            console.error('❌ Error HTTP:', response.status, data);
            
            // Mostrar errores específicos si existen
            if (data.errors && data.errors.length > 0) {
                const errorMessages = data.errors.map(error => `${error.field}: ${error.message}`).join('\n');
                alert('❌ Errores de validación:\n' + errorMessages);
            } else {
                alert('❌ Error: ' + (data.message || 'Error desconocido'));
            }
            return;
        }

        if (data.success) {
            alert('✅ ' + data.message + '\nSerás redirigido al login.');
            setTimeout(() => {
                window.location.href = '/login';
            }, 2000);
        } else {
            alert('❌ Error: ' + data.message);
        }
    } catch (error) {
        console.error('❌ Error en registro:', error);
        alert('❌ Error de conexión. Verifica la consola para más detalles.');
    }
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function initRegisterPage() {
    // Inicializar efectos de botones
    initRippleButtons();
    
    // Inicializar partículas de fondo
    initParticles();
    
    // Cargar roles desde la API
    loadRoles();
    
    // Configurar event listener para cambio de rol
    const roleSelect = document.getElementById('id_rol');
    if (roleSelect) {
        roleSelect.addEventListener('change', updateRoleDescription);
    }
    
    // Configurar toggles de contraseñas
    setupPasswordToggles();
    
    // Validación del formulario
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
        console.log('✅ Formulario de registro conectado - CON DEBUGGING MEJORADO');
    }
    
    console.log('✅ Register page initialized - CON DEBUGGING COMPLETO');
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', initRegisterPage);