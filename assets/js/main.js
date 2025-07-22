/**
 * FODEXA - Sistema de Gestión para Restaurantes
 * Archivo principal de JavaScript
 */

// ============================
// VARIABLES GLOBALES
// ============================
let userData = null;
let appConfig = {
    restaurantName: 'FODEXA Restaurant',
    baseDeliveryCost: 3000,
    taxRate: 0.19
};

// ============================
// INICIALIZACIÓN DE LA APP
// ============================
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Verificar autenticación
    checkAuthentication();
    
    // Cargar configuración
    loadAppConfig();
    
    // Inicializar eventos
    initializeEvents();
    
    // Cargar datos del dashboard si estamos en index.html
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        loadDashboardData();
    }
}

// ============================
// GESTIÓN DE AUTENTICACIÓN
// ============================
function checkAuthentication() {
    const currentUser = getCurrentUser();
    
    // Si estamos en login.html y ya hay usuario, redirigir al dashboard
    if (isLoginPage() && currentUser) {
        window.location.href = 'index.html';
        return;
    }
    
    // Si no estamos en login.html y no hay usuario, redirigir al login
    if (!isLoginPage() && !currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    // Actualizar UI con datos del usuario
    if (currentUser) {
        updateUserInterface(currentUser);
    }
}

function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('fodexa_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        console.error('Error al obtener usuario actual:', error);
        return null;
    }
}

function setCurrentUser(user) {
    try {
        localStorage.setItem('fodexa_user', JSON.stringify(user));
        userData = user;
    } catch (error) {
        console.error('Error al guardar usuario:', error);
    }
}

function logout() {
    localStorage.removeItem('fodexa_user');
    localStorage.removeItem('fodexa_remember');
    userData = null;
    window.location.href = 'login.html';
}

function isLoginPage() {
    return window.location.pathname.includes('login.html');
}

// ============================
// GESTIÓN DE CONFIGURACIÓN
// ============================
function loadAppConfig() {
    try {
        const configStr = localStorage.getItem('fodexa_config');
        if (configStr) {
            const savedConfig = JSON.parse(configStr);
            appConfig = { ...appConfig, ...savedConfig };
        }
    } catch (error) {
        console.error('Error al cargar configuración:', error);
    }
}

function saveAppConfig() {
    try {
        localStorage.setItem('fodexa_config', JSON.stringify(appConfig));
    } catch (error) {
        console.error('Error al guardar configuración:', error);
    }
}

// ============================
// EVENTOS GLOBALES
// ============================
function initializeEvents() {
    // Botón de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    // Teclas de acceso rápido
    document.addEventListener('keydown', handleGlobalKeyboard);
}

function handleGlobalKeyboard(e) {
    // ESC para cerrar modales
    if (e.key === 'Escape') {
        closeAllModals();
    }
    
    // Ctrl/Cmd + teclas de acceso rápido
    if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
            case '1':
                e.preventDefault();
                navegarModulo('ventas');
                break;
            case '2':
                e.preventDefault();
                navegarModulo('domicilios');
                break;
            case '3':
                e.preventDefault();
                navegarModulo('clientes');
                break;
        }
    }
}

// ============================
// GESTIÓN DE UI
// ============================
function updateUserInterface(user) {
    // Actualizar nombre de usuario
    const usernameDisplay = document.getElementById('username-display');
    if (usernameDisplay) {
        usernameDisplay.textContent = user.username || 'Usuario';
    }
    
    // Mostrar/ocultar elementos según rol
    updateUIByRole(user.role);
}

function updateUIByRole(role) {
    const adminElements = document.querySelectorAll('[data-role="admin"]');
    const isAdmin = role === 'admin' || role === 'administrador';
    
    adminElements.forEach(element => {
        element.style.display = isAdmin ? 'block' : 'none';
    });
}

// ============================
// NAVEGACIÓN ENTRE MÓDULOS
// ============================
function navegarModulo(modulo) {
    const modulePaths = {
        'ventas': 'modulos/ventas/ventas.html',
        'domicilios': 'modulos/domicilios/domicilios.html',
        'clientes': 'modulos/clientes/clientes.html',
        'inventario': 'modulos/inventario/inventario.html',
        'reportes': 'modulos/reportes/reportes.html'
    };
    
    if (modulePaths[modulo]) {
        window.location.href = modulePaths[modulo];
    } else {
        showNotification('Módulo no disponible', 'warning');
    }
}

function navegarBaseDatosClientes() {
    console.log('🏪 Navegando directamente a base de datos de clientes...');
    // Ir al módulo de ventas con parámetro para abrir directamente la base de datos de clientes
    window.location.href = 'modulos/ventas/ventas.html?openClientes=true';
}

function navegarDashboard() {
    window.location.href = '../../index.html';
}

function navegarAdmin() {
    window.location.href = 'admin.html';
}

// ============================
// DASHBOARD DATA
// ============================
function loadDashboardData() {
    try {
        // Cargar estadísticas rápidas
        loadQuickStats();
        
        // Actualizar interfaz
        updateDashboardUI();
    } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
    }
}

function loadQuickStats() {
    // Obtener datos de localStorage
    const ventas = getStoredData('ventas') || [];
    const domicilios = getStoredData('domicilios') || [];
    const clientes = getStoredData('clientes') || [];
    
    // Calcular estadísticas de hoy
    const today = new Date().toDateString();
    const ventasHoy = ventas.filter(venta => 
        new Date(venta.fecha).toDateString() === today
    );
    const domiciliosHoy = domicilios.filter(domicilio => 
        new Date(domicilio.fecha).toDateString() === today
    );
    
    // Actualizar UI
    updateStatElement('ventas-hoy', formatCurrency(
        ventasHoy.reduce((sum, venta) => sum + (venta.total || 0), 0)
    ));
    updateStatElement('domicilios-hoy', domiciliosHoy.length.toString());
    updateStatElement('clientes-total', clientes.length.toString());
}

function updateStatElement(id, value) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = value;
        element.classList.add('fade-in-up');
    }
}

function updateDashboardUI() {
    // Animaciones de entrada
    const moduleCards = document.querySelectorAll('.module-card');
    moduleCards.forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('fade-in-up');
        }, index * 100);
    });
}

// ============================
// GESTIÓN DE DATOS (LocalStorage)
// ============================
function getStoredData(key) {
    try {
        const data = localStorage.getItem(`fodexa_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error al obtener ${key}:`, error);
        return null;
    }
}

function setStoredData(key, data) {
    try {
        localStorage.setItem(`fodexa_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error al guardar ${key}:`, error);
        return false;
    }
}

function appendStoredData(key, newItem) {
    const existingData = getStoredData(key) || [];
    const newId = existingData.length > 0 ? 
        Math.max(...existingData.map(item => item.id || 0)) + 1 : 1;
    
    const itemWithId = {
        ...newItem,
        id: newId,
        fechaCreacion: new Date().toISOString()
    };
    
    existingData.push(itemWithId);
    return setStoredData(key, existingData) ? itemWithId : null;
}

function updateStoredItem(key, id, updatedData) {
    const data = getStoredData(key) || [];
    const index = data.findIndex(item => item.id === id);
    
    if (index !== -1) {
        data[index] = { ...data[index], ...updatedData, fechaModificacion: new Date().toISOString() };
        return setStoredData(key, data);
    }
    return false;
}

function deleteStoredItem(key, id) {
    const data = getStoredData(key) || [];
    const filteredData = data.filter(item => item.id !== id);
    return setStoredData(key, filteredData);
}

// ============================
// UTILIDADES
// ============================
function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

function formatDate(date) {
    return new Intl.DateTimeFormat('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(date));
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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

// ============================
// GESTIÓN DE MODALES
// ============================
function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
        
        // Focus al primer input si existe
        const firstInput = modal.querySelector('input, select, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 100);
        }
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function closeAllModals() {
    const modals = document.querySelectorAll('.modal:not(.hidden)');
    modals.forEach(modal => {
        modal.classList.add('hidden');
    });
    document.body.style.overflow = 'auto';
}

// ============================
// NOTIFICACIONES
// ============================
function showNotification(message, type = 'info', duration = 3000) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Estilos inline para la notificación
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(15, 23, 42, 0.95);
        border: 1px solid ${getNotificationColor(type)};
        border-radius: 0.75rem;
        padding: 1rem;
        color: white;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 1rem;
        min-width: 300px;
        max-width: 500px;
        animation: slideInRight 0.3s ease;
        backdrop-filter: blur(10px);
    `;
    
    // Agregar al DOM
    document.body.appendChild(notification);
    
    // Auto-remove después del tiempo especificado
    if (duration > 0) {
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, duration);
    }
}

function getNotificationIcon(type) {
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'warning': 'exclamation-triangle',
        'info': 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function getNotificationColor(type) {
    const colors = {
        'success': '#10b981',
        'error': '#ef4444',
        'warning': '#f59e0b',
        'info': '#8b5cf6'
    };
    return colors[type] || '#8b5cf6';
}

// ============================
// VALIDACIONES
// ============================
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[0-9\s\-\+\(\)]{8,}$/;
    return phoneRegex.test(phone);
}

function validateRequired(value) {
    return value && value.toString().trim().length > 0;
}

function validateForm(formElement) {
    const requiredFields = formElement.querySelectorAll('[required]');
    let isValid = true;
    const errors = [];
    
    requiredFields.forEach(field => {
        if (!validateRequired(field.value)) {
            isValid = false;
            field.classList.add('error');
            errors.push(`${field.placeholder || field.name} es requerido`);
        } else {
            field.classList.remove('error');
        }
        
        // Validaciones específicas
        if (field.type === 'email' && field.value && !validateEmail(field.value)) {
            isValid = false;
            field.classList.add('error');
            errors.push('Email inválido');
        }
        
        if (field.type === 'tel' && field.value && !validatePhone(field.value)) {
            isValid = false;
            field.classList.add('error');
            errors.push('Teléfono inválido');
        }
    });
    
    return { isValid, errors };
}

// ============================
// GESTIÓN DE LOADING
// ============================
function showLoading(message = 'Cargando...') {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        const loadingText = loadingOverlay.querySelector('p');
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
// EXPORTAR FUNCIONES GLOBALES
// ============================
window.FODEXA = {
    // Navegación
    navegarModulo,
    navegarDashboard,
    navegarAdmin,
    logout,
    
    // Datos
    getStoredData,
    setStoredData,
    appendStoredData,
    updateStoredItem,
    deleteStoredItem,
    
    // UI
    showModal,
    closeModal,
    showNotification,
    showLoading,
    hideLoading,
    
    // Utilidades
    formatCurrency,
    formatDate,
    generateId,
    validateForm,
    
    // Configuración
    appConfig,
    getCurrentUser,
    setCurrentUser
};

// Agregar estilos CSS para notificaciones
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .form-input.error {
        border-color: #ef4444 !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        flex: 1;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: #94a3b8;
        cursor: pointer;
        padding: 0.25rem;
        border-radius: 0.25rem;
        transition: all 0.3s ease;
    }
    
    .notification-close:hover {
        background: rgba(139, 92, 246, 0.1);
        color: #8b5cf6;
    }
`;
document.head.appendChild(notificationStyles);
