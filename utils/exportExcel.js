// Exporta los datos de reportes mensuales a Excel usando SheetJS (xlsx)
// Requiere que xlsx.min.js esté cargado en la página
export function exportarReportesExcel({ventasPorMes, topProductos, clientesFrecuentes, gastosPorCategoria, margenPorProducto, mes, anio}) {
    const wb = XLSX.utils.book_new();
    // Hoja resumen
    const resumen = [
        ['Mes', mes],
        ['Año', anio],
        ['Ventas Totales', ventasPorMes.reduce((a,b)=>a+b.total,0)],
        ['Productos Distintos Vendidos', topProductos.length],
        ['Clientes Frecuentes', clientesFrecuentes.length],
        ['Gastos Totales', gastosPorCategoria.reduce((a,b)=>a+b.total,0)],
        ['Margen Estimado Total', margenPorProducto.reduce((a,b)=>a+b.margen,0)]
    ];
    wb.SheetNames.push('Resumen');
    wb.Sheets['Resumen'] = XLSX.utils.aoa_to_sheet(resumen);
    // Top productos
    wb.SheetNames.push('Top Productos');
    wb.Sheets['Top Productos'] = XLSX.utils.json_to_sheet(topProductos);
    // Clientes frecuentes
    wb.SheetNames.push('Clientes Frecuentes');
    wb.Sheets['Clientes Frecuentes'] = XLSX.utils.json_to_sheet(clientesFrecuentes);
    // Gastos por categoría
    wb.SheetNames.push('Gastos por Categoría');
    wb.Sheets['Gastos por Categoría'] = XLSX.utils.json_to_sheet(gastosPorCategoria);
    // Margen por producto
    wb.SheetNames.push('Margen por Producto');
    wb.Sheets['Margen por Producto'] = XLSX.utils.json_to_sheet(margenPorProducto);
    XLSX.writeFile(wb, `Reporte_FODEXA_${mes}_${anio}.xlsx`);
}
