// FODEXA - Utilidades para reportes mensuales
// Aquí se centralizan los cálculos y formateos de datos para los reportes

/**
 * Agrupa ventas por mes y suma el total.
 * @param {Array} ventas - Array de ventas (facturas)
 * @returns {Object} { '2025-07': total, ... }
 */
export function totalVentasPorMes(ventas) {
    const res = {};
    ventas.forEach(v => {
        const fecha = new Date(v.fecha);
        const key = `${fecha.getFullYear()}-${String(fecha.getMonth()+1).padStart(2,'0')}`;
        res[key] = (res[key] || 0) + (v.total || 0);
    });
    return res;
}

/**
 * Top N productos más vendidos en un periodo.
 * @param {Array} ventas
 * @param {number} topN
 * @returns {Array} [{ nombre, cantidad, porcentaje }]
 */
export function topProductosVendidos(ventas, topN=5) {
    const conteo = {};
    let total = 0;
    ventas.forEach(v => {
        (v.items||[]).forEach(item => {
            conteo[item.nombre] = (conteo[item.nombre]||0) + (item.cantidad||0);
            total += (item.cantidad||0);
        });
    });
    const arr = Object.entries(conteo).map(([nombre, cantidad]) => ({ nombre, cantidad }));
    arr.sort((a,b)=>b.cantidad-a.cantidad);
    return arr.slice(0,topN).map(p => ({...p, porcentaje: total ? Math.round((p.cantidad/total)*100) : 0 }));
}

/**
 * Clientes más frecuentes en el periodo.
 * @param {Array} ventas
 * @returns {Array} [{ nombre, compras }]
 */
export function clientesFrecuentes(ventas) {
    const conteo = {};
    ventas.forEach(v => {
        const nombre = v.clienteInfo?.nombre || 'Sin nombre';
        conteo[nombre] = (conteo[nombre]||0) + 1;
    });
    return Object.entries(conteo).map(([nombre, compras])=>({nombre, compras})).sort((a,b)=>b.compras-a.compras);
}

/**
 * Agrupa gastos por categoría.
 * @param {Array} gastos
 * @returns {Object} { categoria: total }
 */
export function resumenGastosPorCategoria(gastos) {
    const res = {};
    gastos.forEach(g => {
        res[g.categoria] = (res[g.categoria]||0) + (g.monto||0);
    });
    return res;
}

/**
 * Calcula margen de ganancia estimado por producto.
 * @param {Array} ventas
 * @returns {Array} [{ nombre, margen, totalGanancia }]
 */
export function margenGananciaPorProducto(ventas) {
    const res = {};
    ventas.forEach(v => {
        (v.items||[]).forEach(item => {
            // Se espera que item tenga precio, costoProduccion
            const ganancia = (item.precio - (item.costoProduccion||0)) * (item.cantidad||1);
            if (!res[item.nombre]) res[item.nombre] = { nombre: item.nombre, margen: 0, totalGanancia: 0, total: 0 };
            res[item.nombre].totalGanancia += ganancia;
            res[item.nombre].total += item.cantidad||1;
        });
    });
    // Margen promedio por unidad
    Object.values(res).forEach(p => {
        p.margen = p.total ? Math.round((p.totalGanancia/p.total)*100)/100 : 0;
    });
    return Object.values(res);
}
