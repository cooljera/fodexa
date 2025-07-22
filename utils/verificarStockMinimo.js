// FODEXA - Utilidad para verificación de stock mínimo de insumos

/**
 * Verifica si un insumo está por debajo o igual a su stock mínimo.
 * @param {Object} insumo - Objeto insumo con stock_actual y stock_minimo
 * @returns {boolean} true si está en alerta, false si está normal
 */
function insumoEnAlerta(insumo) {
    if (!insumo) return false;
    const actual = Number(insumo.stock_actual) || 0;
    const minimo = Number(insumo.stock_minimo) || 0;
    return actual <= minimo;
}

/**
 * Devuelve un array de insumos en alerta de bajo stock.
 * @param {Array} insumos - Lista de insumos
 * @returns {Array} Insumos en alerta
 */
function obtenerInsumosEnAlerta(insumos = []) {
    return insumos.filter(insumoEnAlerta);
}

/**
 * Devuelve un mensaje de alerta para un insumo en bajo stock.
 * @param {Object} insumo
 * @returns {string}
 */
function mensajeAlertaInsumo(insumo) {
    return `Insumo por debajo del stock mínimo. Considere reabastecer. (Actual: ${insumo.stock_actual}, Mínimo: ${insumo.stock_minimo})`;
}

/**
 * Devuelve la clase CSS sugerida para la fila/elemento de insumo según su estado de stock.
 * @param {Object} insumo
 * @returns {string} Clase CSS sugerida
 */
function claseAlertaInsumo(insumo) {
    if (!insumo) return '';
    if (insumoEnAlerta(insumo)) {
        if (Number(insumo.stock_actual) === 0) return 'stock-agotado';
        return 'stock-bajo';
    }
    return '';
}

/**
 * Devuelve el icono sugerido para alerta de insumo (puede usarse en UI).
 * @param {Object} insumo
 * @returns {string} HTML de icono
 */
function iconoAlertaInsumo(insumo) {
    if (insumoEnAlerta(insumo)) {
        return '<i class="fas fa-exclamation-triangle" style="color:#e67e22;" title="Insumo por debajo del stock mínimo"></i>';
    }
    return '';
}

// Exponer funciones globalmente para FODEXA
window.insumoEnAlerta = insumoEnAlerta;
window.obtenerInsumosEnAlerta = obtenerInsumosEnAlerta;
window.mensajeAlertaInsumo = mensajeAlertaInsumo;
window.claseAlertaInsumo = claseAlertaInsumo;
window.iconoAlertaInsumo = iconoAlertaInsumo;
