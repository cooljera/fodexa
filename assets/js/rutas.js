/**
 * FODEXA - Sistema de Rutas
 * Gestión de navegación y enrutamiento
 */

// ============================
// CONFIGURACIÓN DE RUTAS
// ============================
const ROUTES = {
    // Rutas principales
    dashboard: {
        path: 'index.html',
        title: 'Dashboard - FODEXA',
        roles: ['admin', 'administrador', 'usuario']
    },
    login: {
        path: 'login.html',
        title: 'Iniciar Sesión - FODEXA',
        roles: ['public']
    },
    admin: {
        path: 'admin.html',
        title: 'Administración - FODEXA',
        roles: ['admin', 'administrador']
    },
    
    // Módulos
    ventas: {
        path: 'modulos/ventas/ventas.html',
        title: 'Ventas - FODEXA',
        roles: ['admin', 'administrador', 'usuario']
    },
    domicilios: {
        path: 'modulos/domicilios/domicilios.html',
        title: 'Domicilios - FODEXA',
        roles: ['admin', 'administrador', 'usuario']
    },
    clientes: {
        path: 'modulos/clientes/clientes.html',
        title: 'Clientes - FODEXA',
        roles: ['admin', 'administrador', 'usuario']
    },
    inventario: {
        path: 'modulos/inventario/inventario.html',
        title: 'Inventario - FODEXA',
        roles: ['admin', 'administrador']
    },
    reportes: {
        path: 'modulos/reportes/reportes.html',
        title: 'Reportes - FODEXA',
        roles: ['admin', 'administrador']
    }
};

// ============================
// NAVEGACIÓN PRINCIPAL
// ============================
function navegarA(routeName, params = {}) {
    const route = ROUTES[routeName];
    
    if (!route) {
        console.error(`Ruta no encontrada: ${routeName}`);
        showNotification('Página no encontrada', 'error');
        return false;
    }
    
    // Verificar permisos
    if (!checkRoutePermissions(route)) {
        showNotification('No tienes permisos para acceder a esta página', 'warning');
        return false;
    }
    
    // Construir URL con parámetros
    let url = route.path;
    if (Object.keys(params).length > 0) {
        const urlParams = new URLSearchParams(params);
        url += `?${urlParams.toString()}`;
    }
    
    // Actualizar título de la página
    if (route.title) {
        document.title = route.title;
    }
    
    // Registrar navegación
    logNavigation(routeName, url);
    
    // Navegar
    window.location.href = url;
    return true;
}

function checkRoutePermissions(route) {
    const currentUser = getCurrentUser();
    
    // Rutas públicas
    if (route.roles.includes('public')) {
        return true;
    }
    
    // Verificar si hay usuario logueado
    if (!currentUser) {
        return false;
    }
    
    // Verificar rol del usuario
    return route.roles.includes(currentUser.role);
}

// ============================
// NAVEGACIÓN ESPECÍFICA
// ============================
function irADashboard() {
    navegarA('dashboard');
}

function irALogin() {
    navegarA('login');
}

function irAAdmin() {
    navegarA('admin');
}

function irAVentas() {
    navegarA('ventas');
}

function irADomicilios() {
    navegarA('domicilios');
}

function irAClientes() {
    navegarA('clientes');
}

function irAInventario() {
    navegarA('inventario');
}

function irAReportes() {
    navegarA('reportes');
}

// ============================
// NAVEGACIÓN RELATIVA
// ============================
function volverAtras() {
    if (window.history.length > 1) {
        window.history.back();
    } else {
        irADashboard();
    }
}

function irAInicio() {
    irADashboard();
}

// ============================
// NAVEGACIÓN DESDE MÓDULOS
// ============================
function getBasePath() {
    const currentPath = window.location.pathname;
    const depth = (currentPath.match(/\//g) || []).length - 1;
    
    // Si estamos en un submódulo (ej: modulos/ventas/), necesitamos subir 2 niveles
    if (currentPath.includes('/modulos/')) {
        return '../../';
    }
    
    // Si estamos en la raíz, no necesitamos subir
    return './';
}

function navegarDesdeModulo(routeName, params = {}) {
    const route = ROUTES[routeName];
    
    if (!route) {
        console.error(`Ruta no encontrada: ${routeName}`);
        return false;
    }
    
    // Verificar permisos
    if (!checkRoutePermissions(route)) {
        showNotification('No tienes permisos para acceder a esta página', 'warning');
        return false;
    }
    
    // Calcular path relativo
    const basePath = getBasePath();
    let url = basePath + route.path;
    
    // Agregar parámetros si existen
    if (Object.keys(params).length > 0) {
        const urlParams = new URLSearchParams(params);
        url += `?${urlParams.toString()}`;
    }
    
    // Registrar navegación
    logNavigation(routeName, url);
    
    // Navegar
    window.location.href = url;
    return true;
}

// ============================
// MANEJO DE PARÁMETROS URL
// ============================
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    const params = {};
    
    for (const [key, value] of urlParams) {
        params[key] = value;
    }
    
    return params;
}

function setUrlParam(key, value) {
    const url = new URL(window.location);
    url.searchParams.set(key, value);
    window.history.replaceState({}, '', url);
}

function removeUrlParam(key) {
    const url = new URL(window.location);
    url.searchParams.delete(key);
    window.history.replaceState({}, '', url);
}

// ============================
// BREADCRUMB NAVIGATION
// ============================
function generateBreadcrumb() {
    const currentPath = window.location.pathname;
    const breadcrumb = [];
    
    // Dashboard siempre es el primer elemento
    breadcrumb.push({
        name: 'Dashboard',
        path: getBasePath() + 'index.html',
        active: currentPath.includes('index.html') || currentPath === '/'
    });
    
    // Detectar módulo actual
    if (currentPath.includes('/ventas/')) {
        breadcrumb.push({
            name: 'Ventas',
            path: currentPath,
            active: true
        });
    } else if (currentPath.includes('/domicilios/')) {
        breadcrumb.push({
            name: 'Domicilios',
            path: currentPath,
            active: true
        });
    } else if (currentPath.includes('/clientes/')) {
        breadcrumb.push({
            name: 'Clientes',
            path: currentPath,
            active: true
        });
    } else if (currentPath.includes('/inventario/')) {
        breadcrumb.push({
            name: 'Inventario',
            path: currentPath,
            active: true
        });
    } else if (currentPath.includes('/reportes/')) {
        breadcrumb.push({
            name: 'Reportes',
            path: currentPath,
            active: true
        });
    } else if (currentPath.includes('admin.html')) {
        breadcrumb.push({
            name: 'Administración',
            path: currentPath,
            active: true
        });
    }
    
    return breadcrumb;
}

function renderBreadcrumb(containerId = 'breadcrumb-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const breadcrumb = generateBreadcrumb();
    
    container.innerHTML = breadcrumb.map((item, index) => {
        if (item.active) {
            return `<span class="breadcrumb-active">${item.name}</span>`;
        } else {
            return `<a href="${item.path}" class="breadcrumb-link">${item.name}</a>`;
        }
    }).join(' <i class="fas fa-chevron-right breadcrumb-separator"></i> ');
}

// ============================
// GESTIÓN DE HISTORIAL
// ============================
function logNavigation(routeName, url) {
    try {
        const navigation = {
            route: routeName,
            url: url,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            referrer: document.referrer
        };
        
        const logs = JSON.parse(localStorage.getItem('fodexa_navigation_logs') || '[]');
        logs.push(navigation);
        
        // Mantener solo los últimos 100 registros
        if (logs.length > 100) {
            logs.splice(0, logs.length - 100);
        }
        
        localStorage.setItem('fodexa_navigation_logs', JSON.stringify(logs));
    } catch (error) {
        console.error('Error al registrar navegación:', error);
    }
}

function getNavigationHistory() {
    try {
        return JSON.parse(localStorage.getItem('fodexa_navigation_logs') || '[]');
    } catch (error) {
        console.error('Error al obtener historial de navegación:', error);
        return [];
    }
}

// ============================
// UTILIDADES DE NAVEGACIÓN
// ============================
function getCurrentRoute() {
    const currentPath = window.location.pathname;
    
    for (const [routeName, route] of Object.entries(ROUTES)) {
        if (currentPath.includes(route.path.replace('.html', ''))) {
            return routeName;
        }
    }
    
    return 'unknown';
}

function isCurrentRoute(routeName) {
    return getCurrentRoute() === routeName;
}

function reloadPage() {
    window.location.reload();
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

function showNotification(message, type = 'info') {
    // Esta función debería estar definida en main.js
    if (window.FODEXA && window.FODEXA.showNotification) {
        window.FODEXA.showNotification(message, type);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

/**
 * Navega a la vista de Base de Datos de Clientes
 */
function navegarBaseDatosClientes() {
    console.log('🗄️ Navegando a Base de Datos de Clientes');
    
    try {
        // Marcar origen para navegación de regreso (clave corregida)
        sessionStorage.setItem('origen_navegacion_clientes', 'dashboard');
        
        // Navegar a la vista
        window.location.href = 'src/pages/clientes/index.html';
        
    } catch (error) {
        console.error('❌ Error al navegar a Base de Datos de Clientes:', error);
        mostrarNotificacion?.('Error al acceder a la base de datos de clientes', 'error');
    }
}

// ============================
// EXPORTAR FUNCIONES
// ============================
window.FODEXA_ROUTES = {
    // Navegación principal
    navegarA,
    navegarDesdeModulo,
    
    // Rutas específicas
    irADashboard,
    irALogin,
    irAAdmin,
    irAVentas,
    irADomicilios,
    irAClientes,
    irAInventario,
    irAReportes,
    
    // Navegación utilitaria
    volverAtras,
    irAInicio,
    reloadPage,
    
    // Parámetros URL
    getUrlParams,
    setUrlParam,
    removeUrlParam,
    
    // Breadcrumb
    generateBreadcrumb,
    renderBreadcrumb,
    
    // Utilidades
    getCurrentRoute,
    isCurrentRoute,
    getNavigationHistory,
    
    // Constantes
    ROUTES
};

// Alias globales para compatibilidad
window.navegarModulo = irAVentas; // Por compatibilidad con main.js
window.navegarDashboard = irADashboard;
