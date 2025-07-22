/**
 * FODEXA - Sistema de Login
 * Gestión de autenticación de usuarios
 */

// ============================
// VARIABLES GLOBALES
// ============================
const DEMO_USERS = [
    {
        username: 'admin',
        password: 'admin123',
        role: 'administrador',
        nombre: 'Administrador',
        email: 'admin@fodexa.com'
    },
    {
        username: 'usuario',
        password: 'usuario123',
        role: 'usuario',
        nombre: 'Usuario Básico',
        email: 'usuario@fodexa.com'
    }
];

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener('DOMContentLoaded', function() {
    initializeLogin();
});

function initializeLogin() {
    // Verificar si ya hay usuario logueado
    const currentUser = getCurrentUser();
    if (currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Configurar eventos
    setupLoginEvents();
    
    // Verificar si hay datos de "recordar sesión"
    loadRememberedData();
    
    // Focus al primer input
    const usernameInput = document.getElementById('username');
    if (usernameInput) {
        usernameInput.focus();
    }
}

// ============================
// CONFIGURACIÓN DE EVENTOS
// ============================
function setupLoginEvents() {
    // Formulario de login
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // Enter en campos de input
    document.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const loginForm = document.getElementById('login-form');
            if (loginForm) {
                handleLogin(e);
            }
        }
    });
    
    // Limpiar errores al escribir
    const inputs = document.querySelectorAll('.form-input');
    inputs.forEach(input => {
        input.addEventListener('input', clearError);
    });
}

// ============================
// GESTIÓN DE LOGIN
// ============================
async function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('username').value.trim();
    const password = document.getElementById('password').value;
    const remember = document.getElementById('remember').checked;
    
    // Validar campos
    if (!username || !password) {
        showError('Por favor complete todos los campos');
        return;
    }
    
    // Mostrar loading
    showLoading('Verificando credenciales...');
    
    try {
        // Simular delay de autenticación
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Verificar credenciales
        const user = authenticateUser(username, password);
        
        if (user) {
            // Login exitoso
            saveUserSession(user, remember);
            
            // Mostrar mensaje de éxito
            showLoading('¡Bienvenido! Redirigiendo...');
            
            // Redirigir después de un momento
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
            
        } else {
            // Credenciales incorrectas
            hideLoading();
            showError('Usuario o contraseña incorrectos');
            shakeForm();
        }
        
    } catch (error) {
        hideLoading();
        showError('Error en el servidor. Intente nuevamente.');
        console.error('Error de login:', error);
    }
}

function authenticateUser(username, password) {
    // Buscar en usuarios demo
    const demoUser = DEMO_USERS.find(user => 
        user.username === username && user.password === password
    );
    
    if (demoUser) {
        return {
            id: demoUser.username,
            username: demoUser.username,
            role: demoUser.role,
            nombre: demoUser.nombre,
            email: demoUser.email,
            lastLogin: new Date().toISOString()
        };
    }
    
    // Buscar en usuarios guardados en localStorage
    const savedUsers = JSON.parse(localStorage.getItem('fodexa_users') || '[]');
    const savedUser = savedUsers.find(user => 
        user.username === username && user.password === password
    );
    
    if (savedUser) {
        return {
            ...savedUser,
            lastLogin: new Date().toISOString()
        };
    }
    
    return null;
}

function saveUserSession(user, remember) {
    // Guardar datos del usuario actual
    localStorage.setItem('fodexa_user', JSON.stringify(user));
    
    // Guardar preferencia de recordar
    if (remember) {
        localStorage.setItem('fodexa_remember', JSON.stringify({
            username: user.username,
            timestamp: new Date().toISOString()
        }));
    } else {
        localStorage.removeItem('fodexa_remember');
    }
    
    // Registrar log de login
    logUserActivity(user.id, 'login');
}

// ============================
// FUNCIONES DE UI
// ============================
function showError(message) {
    const errorElement = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    
    if (errorElement && errorText) {
        errorText.textContent = message;
        errorElement.classList.remove('hidden');
        
        // Auto-hide después de 5 segundos
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

function clearError() {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.classList.add('hidden');
    }
    
    // Remover clase de error de los inputs
    this.classList.remove('error');
}

function shakeForm() {
    const loginCard = document.querySelector('.login-card');
    if (loginCard) {
        loginCard.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            loginCard.style.animation = '';
        }, 500);
    }
}

function showLoading(message) {
    const loadingOverlay = document.getElementById('loading-overlay');
    const loadingText = loadingOverlay?.querySelector('p');
    
    if (loadingOverlay) {
        if (loadingText) {
            loadingText.textContent = message;
        }
        loadingOverlay.classList.remove('hidden');
    }
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.classList.add('hidden');
    }
}

// ============================
// GESTIÓN DE RECORDAR SESIÓN
// ============================
function loadRememberedData() {
    try {
        const rememberedStr = localStorage.getItem('fodexa_remember');
        if (rememberedStr) {
            const remembered = JSON.parse(rememberedStr);
            const usernameInput = document.getElementById('username');
            const rememberCheckbox = document.getElementById('remember');
            
            if (usernameInput && remembered.username) {
                usernameInput.value = remembered.username;
            }
            
            if (rememberCheckbox) {
                rememberCheckbox.checked = true;
            }
        }
    } catch (error) {
        console.error('Error al cargar datos recordados:', error);
    }
}

// ============================
// USUARIOS DEMO
// ============================
function fillDemoUser(username, password) {
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (usernameInput && passwordInput) {
        usernameInput.value = username;
        passwordInput.value = password;
        
        // Pequeña animación para mostrar que se llenó
        [usernameInput, passwordInput].forEach(input => {
            input.style.transform = 'scale(1.02)';
            input.style.transition = 'transform 0.2s ease';
            setTimeout(() => {
                input.style.transform = 'scale(1)';
            }, 200);
        });
        
        // Focus al botón de login
        const loginBtn = document.querySelector('.btn-login');
        if (loginBtn) {
            loginBtn.focus();
        }
    }
}

// ============================
// TOGGLE PASSWORD VISIBILITY
// ============================
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const passwordIcon = document.getElementById('password-icon');
    
    if (passwordInput && passwordIcon) {
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            passwordIcon.className = 'fas fa-eye-slash';
        } else {
            passwordInput.type = 'password';
            passwordIcon.className = 'fas fa-eye';
        }
    }
}

// ============================
// UTILIDADES
// ============================
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('fodexa_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

function logUserActivity(userId, action, details = {}) {
    try {
        const logs = JSON.parse(localStorage.getItem('fodexa_logs') || '[]');
        const logEntry = {
            id: Date.now().toString(),
            userId,
            action,
            details,
            timestamp: new Date().toISOString(),
            ip: 'localhost', // En una app real, se obtendría la IP real
            userAgent: navigator.userAgent
        };
        
        logs.push(logEntry);
        
        // Mantener solo los últimos 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('fodexa_logs', JSON.stringify(logs));
    } catch (error) {
        console.error('Error al registrar actividad:', error);
    }
}

// ============================
// FUNCIONES GLOBALES
// ============================
window.fillDemoUser = fillDemoUser;
window.togglePassword = togglePassword;

// Agregar estilos CSS para animaciones
const loginStyles = document.createElement('style');
loginStyles.textContent = `
    @keyframes shake {
        0%, 100% { transform: translateX(0); }
        10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
        20%, 40%, 60%, 80% { transform: translateX(5px); }
    }
    
    .form-input.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
        animation: shake 0.3s ease-in-out;
    }
    
    .demo-user:active {
        transform: scale(0.98);
    }
    
    .btn-login:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
document.head.appendChild(loginStyles);
