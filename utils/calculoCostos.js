// FODEXA - Utilidades para cálculo de costos de producción y margen de ganancia

/**
 * Calcula el costo de producción de un producto según sus insumos.
 * @param {Array} insumos - Array de objetos { id, nombre, cantidad, costoUnitario }
 * @returns {number} Costo total de producción
 */
export function calcularCostoProduccion(insumos = []) {
    if (!Array.isArray(insumos)) return 0;
    return insumos.reduce((total, insumo) => {
        const cantidad = Number(insumo.cantidad) || 0;
        const costoUnitario = Number(insumo.costoUnitario) || 0;
        return total + (cantidad * costoUnitario);
    }, 0);
}

/**
 * Calcula la ganancia bruta y el margen porcentual de un producto.
 * @param {number} precioVenta - Precio de venta del producto
 * @param {number} costoProduccion - Costo de producción calculado
 * @returns {{ganancia: number, margen: number}} Ganancia bruta y margen (%)
 */
export function calcularMargenGanancia(precioVenta, costoProduccion) {
    const ganancia = (Number(precioVenta) || 0) - (Number(costoProduccion) || 0);
    const margen = (precioVenta > 0) ? (ganancia / precioVenta) * 100 : 0;
    return {
        ganancia,
        margen: Math.round(margen * 100) / 100 // 2 decimales
    };
}

/**
 * Actualiza el costo unitario de un insumo en la lista de insumos de productos.
 * @param {Array} productos - Array de productos
 * @param {string} insumoId - ID del insumo actualizado
 * @param {number} nuevoCostoUnitario - Nuevo costo unitario
 * @returns {Array} Productos actualizados
 */
export function actualizarCostoInsumoEnProductos(productos, insumoId, nuevoCostoUnitario) {
    return productos.map(producto => {
        if (!producto.insumos) return producto;
        const nuevosInsumos = producto.insumos.map(insumo => {
            if (insumo.id === insumoId) {
                return { ...insumo, costoUnitario: nuevoCostoUnitario };
            }
            return insumo;
        });
        return { ...producto, insumos: nuevosInsumos };
    });
}
