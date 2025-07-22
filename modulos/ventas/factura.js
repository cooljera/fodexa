/**
 * FODEXA - Gestión de Facturas
 * Sistema completo de facturación e impresión
 */

// ============================
// VARIABLES GLOBALES
// ============================
let facturaActual = null;
let configuracionFactura = {
    empresa: {
        nombre: 'FODEXA RESTAURANT',
        nit: '900123456-1',
        direccion: 'Calle 123 #45-67, Bogotá, Colombia',
        telefono: '+57 1 234 5678',
        email: 'info@fodexa.com',
        website: 'www.fodexa.com'
    },
    factura: {
        prefijo: 'FV',
        numeracion: 1,
        resolucionDian: 'Res. DIAN 18764003282318 del 2024-01-15',
        rangoAutorizado: 'Del FV-1 al FV-10000',
        fechaVencimiento: '2025-01-15'
    },
    impresion: {
        formato: 'ticket', // ticket, carta
        mostrarLogo: true,
        mostrarQR: true,
        copias: 1,
        impresora: 'default'
    }
};

// ============================
// GESTIÓN DE FACTURAS
// ============================
const FacturaManager = {
    
    // Generar factura completa
    generateFactura(ventaData) {
        try {
            const numeroFactura = this.getNextFacturaNumber();
            
            const factura = {
                id: generateId(),
                numero: numeroFactura,
                prefijo: configuracionFactura.factura.prefijo,
                numeroCompleto: `${configuracionFactura.factura.prefijo}-${numeroFactura}`,
                fecha: new Date().toISOString(),
                fechaFormateada: new Date().toLocaleDateString('es-CO', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit'
                }),
                
                // Datos de la empresa
                empresa: { ...configuracionFactura.empresa },
                
                // Datos del cliente
                cliente: this.getClienteData(ventaData.clienteId),
                
                // Items de la venta
                items: ventaData.items.map(item => ({
                    ...item,
                    subtotal: item.precio * item.cantidad
                })),
                
                // Totales
                subtotal: ventaData.subtotal,
                impuestos: ventaData.impuestos,
                total: ventaData.total,
                
                // Pago
                metodoPago: ventaData.metodoPago,
                montoRecibido: ventaData.montoRecibido,
                cambio: ventaData.cambio,
                
                // Metadatos
                usuario: ventaData.usuario,
                fechaVenta: ventaData.fechaProcesamiento,
                ventaId: ventaData.id,
                
                // DIAN
                resolucionDian: configuracionFactura.factura.resolucionDian,
                rangoAutorizado: configuracionFactura.factura.rangoAutorizado,
                fechaVencimiento: configuracionFactura.factura.fechaVencimiento
            };
            
            // Guardar factura
            this.saveFactura(factura);
            
            // Actualizar numeración
            this.updateFacturaNumber(numeroFactura + 1);
            
            return factura;
            
        } catch (error) {
            console.error('Error generando factura:', error);
            throw new Error('Error al generar la factura');
        }
    },
    
    // Obtener datos del cliente
    getClienteData(clienteId) {
        if (!clienteId) {
            return {
                nombre: 'CLIENTE GENERAL',
                documento: '',
                direccion: '',
                telefono: '',
                email: ''
            };
        }
        
        const clientes = getStoredData('clientes') || [];
        const cliente = clientes.find(c => c.id === parseInt(clienteId));
        
        return cliente ? {
            nombre: cliente.nombre.toUpperCase(),
            documento: cliente.documento || '',
            direccion: cliente.direccion || '',
            telefono: cliente.telefono || '',
            email: cliente.email || ''
        } : {
            nombre: 'CLIENTE GENERAL',
            documento: '',
            direccion: '',
            telefono: '',
            email: ''
        };
    },
    
    // Obtener siguiente número de factura
    getNextFacturaNumber() {
        const config = getStoredData('configFactura') || configuracionFactura;
        return config.factura.numeracion;
    },
    
    // Actualizar número de factura
    updateFacturaNumber(nuevoNumero) {
        const config = getStoredData('configFactura') || configuracionFactura;
        config.factura.numeracion = nuevoNumero;
        setStoredData('configFactura', config);
    },
    
    // Guardar factura
    saveFactura(factura) {
        const facturas = getStoredData('facturas') || [];
        facturas.push(factura);
        setStoredData('facturas', facturas);
    },
    
    // Obtener todas las facturas
    getAllFacturas() {
        return getStoredData('facturas') || [];
    },
    
    // Obtener factura por ID
    getFacturaById(id) {
        const facturas = this.getAllFacturas();
        return facturas.find(f => f.id === id);
    },
    
    // Buscar facturas
    searchFacturas(termino) {
        const facturas = this.getAllFacturas();
        return facturas.filter(factura =>
            factura.numeroCompleto.toLowerCase().includes(termino.toLowerCase()) ||
            factura.cliente.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            factura.cliente.documento.includes(termino)
        );
    },
    
    // Filtrar facturas por fecha
    filterByDate(fechaInicio, fechaFin) {
        const facturas = this.getAllFacturas();
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        return facturas.filter(factura => {
            const fechaFactura = new Date(factura.fecha);
            return fechaFactura >= inicio && fechaFactura <= fin;
        });
    },
    
    // Generar reporte de ventas
    generateSalesReport(fechaInicio, fechaFin) {
        const facturas = this.filterByDate(fechaInicio, fechaFin);
        
        const reporte = {
            periodo: `${fechaInicio} - ${fechaFin}`,
            totalFacturas: facturas.length,
            totalVentas: facturas.reduce((sum, f) => sum + f.total, 0),
            totalImpuestos: facturas.reduce((sum, f) => sum + f.impuestos, 0),
            ventaPromedio: facturas.length > 0 ? facturas.reduce((sum, f) => sum + f.total, 0) / facturas.length : 0,
            
            // Por método de pago
            metodosPago: this.groupByPaymentMethod(facturas),
            
            // Por día
            ventasPorDia: this.groupByDay(facturas),
            
            // Productos más vendidos
            productosVendidos: this.getTopProducts(facturas)
        };
        
        return reporte;
    },
    
    // Agrupar por método de pago
    groupByPaymentMethod(facturas) {
        const metodos = {};
        
        facturas.forEach(factura => {
            const metodo = factura.metodoPago;
            if (!metodos[metodo]) {
                metodos[metodo] = {
                    cantidad: 0,
                    total: 0
                };
            }
            metodos[metodo].cantidad++;
            metodos[metodo].total += factura.total;
        });
        
        return metodos;
    },
    
    // Agrupar por día
    groupByDay(facturas) {
        const dias = {};
        
        facturas.forEach(factura => {
            const fecha = new Date(factura.fecha).toLocaleDateString('es-CO');
            if (!dias[fecha]) {
                dias[fecha] = {
                    cantidad: 0,
                    total: 0
                };
            }
            dias[fecha].cantidad++;
            dias[fecha].total += factura.total;
        });
        
        return dias;
    },
    
    // Obtener productos más vendidos
    getTopProducts(facturas) {
        const productos = {};
        
        facturas.forEach(factura => {
            factura.items.forEach(item => {
                if (!productos[item.nombre]) {
                    productos[item.nombre] = {
                        cantidad: 0,
                        total: 0
                    };
                }
                productos[item.nombre].cantidad += item.cantidad;
                productos[item.nombre].total += item.subtotal;
            });
        });
        
        // Convertir a array y ordenar
        return Object.entries(productos)
            .map(([nombre, data]) => ({ nombre, ...data }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);
    }
};

// ============================
// SISTEMA DE IMPRESIÓN
// ============================
const PrintManager = {
    
    // Imprimir factura
    printFactura(factura, formato = 'ticket') {
        try {
            const html = formato === 'ticket' 
                ? this.generateTicketHTML(factura)
                : this.generateFacturaHTML(factura);
            
            const printWindow = window.open('', '_blank');
            printWindow.document.write(html);
            printWindow.document.close();
            
            printWindow.onload = () => {
                printWindow.print();
                printWindow.onafterprint = () => {
                    printWindow.close();
                };
            };
            
            showNotification('Factura enviada a impresión', 'success');
            
        } catch (error) {
            console.error('Error imprimiendo factura:', error);
            showNotification('Error al imprimir factura', 'error');
        }
    },
    
    // Generar HTML para ticket
    generateTicketHTML(factura) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Factura ${factura.numeroCompleto}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: 'Courier New', monospace;
                        font-size: 12px;
                        line-height: 1.4;
                        width: 58mm;
                        margin: 0 auto;
                        padding: 5px;
                    }
                    
                    .header {
                        text-align: center;
                        border-bottom: 1px dashed #000;
                        padding-bottom: 10px;
                        margin-bottom: 10px;
                    }
                    
                    .empresa-nombre {
                        font-size: 16px;
                        font-weight: bold;
                        margin-bottom: 5px;
                    }
                    
                    .empresa-info {
                        font-size: 10px;
                        margin-bottom: 2px;
                    }
                    
                    .factura-info {
                        margin: 10px 0;
                        font-size: 11px;
                    }
                    
                    .cliente-info {
                        margin: 10px 0;
                        padding: 5px 0;
                        border-top: 1px dashed #000;
                        border-bottom: 1px dashed #000;
                    }
                    
                    .items {
                        margin: 10px 0;
                    }
                    
                    .item {
                        margin-bottom: 8px;
                        border-bottom: 1px dotted #ccc;
                        padding-bottom: 5px;
                    }
                    
                    .item-nombre {
                        font-weight: bold;
                        margin-bottom: 2px;
                    }
                    
                    .item-detalle {
                        display: flex;
                        justify-content: space-between;
                        font-size: 10px;
                    }
                    
                    .totales {
                        border-top: 1px dashed #000;
                        padding-top: 10px;
                        margin-top: 10px;
                    }
                    
                    .total-linea {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 3px;
                    }
                    
                    .total-final {
                        font-weight: bold;
                        font-size: 14px;
                        border-top: 1px solid #000;
                        padding-top: 5px;
                        margin-top: 5px;
                    }
                    
                    .pago-info {
                        margin: 10px 0;
                        padding: 5px 0;
                        border-top: 1px dashed #000;
                        font-size: 10px;
                    }
                    
                    .footer {
                        text-align: center;
                        margin-top: 15px;
                        padding-top: 10px;
                        border-top: 1px dashed #000;
                        font-size: 9px;
                    }
                    
                    .qr-code {
                        text-align: center;
                        margin: 10px 0;
                    }
                    
                    @media print {
                        body { 
                            width: 58mm;
                            margin: 0;
                        }
                        
                        .no-print {
                            display: none;
                        }
                    }
                </style>
            </head>
            <body>
                <!-- Header -->
                <div class="header">
                    <div class="empresa-nombre">${factura.empresa.nombre}</div>
                    <div class="empresa-info">NIT: ${factura.empresa.nit}</div>
                    <div class="empresa-info">${factura.empresa.direccion}</div>
                    <div class="empresa-info">Tel: ${factura.empresa.telefono}</div>
                    <div class="empresa-info">${factura.empresa.email}</div>
                </div>
                
                <!-- Información de factura -->
                <div class="factura-info">
                    <div><strong>FACTURA DE VENTA</strong></div>
                    <div>No: ${factura.numeroCompleto}</div>
                    <div>Fecha: ${factura.fechaFormateada}</div>
                    <div>Cajero: ${factura.usuario}</div>
                </div>
                
                <!-- Cliente -->
                <div class="cliente-info">
                    <div><strong>CLIENTE:</strong></div>
                    <div>${factura.cliente.nombre}</div>
                    ${factura.cliente.documento ? `<div>CC/NIT: ${factura.cliente.documento}</div>` : ''}
                    ${factura.cliente.telefono ? `<div>Tel: ${factura.cliente.telefono}</div>` : ''}
                </div>
                
                <!-- Items -->
                <div class="items">
                    ${factura.items.map(item => `
                        <div class="item">
                            <div class="item-nombre">${item.nombre}</div>
                            <div class="item-detalle">
                                <span>${item.cantidad} x ${formatCurrency(item.precio)}</span>
                                <span>${formatCurrency(item.subtotal)}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                
                <!-- Totales -->
                <div class="totales">
                    <div class="total-linea">
                        <span>Subtotal:</span>
                        <span>${formatCurrency(factura.subtotal)}</span>
                    </div>
                    <div class="total-linea">
                        <span>IVA (19%):</span>
                        <span>${formatCurrency(factura.impuestos)}</span>
                    </div>
                    <div class="total-linea total-final">
                        <span>TOTAL:</span>
                        <span>${formatCurrency(factura.total)}</span>
                    </div>
                </div>
                
                <!-- Información de pago -->
                <div class="pago-info">
                    <div><strong>Método de pago:</strong> ${this.getMetodoPagoText(factura.metodoPago)}</div>
                    ${factura.metodoPago === 'efectivo' ? `
                        <div>Recibido: ${formatCurrency(factura.montoRecibido)}</div>
                        <div>Cambio: ${formatCurrency(factura.cambio)}</div>
                    ` : ''}
                </div>
                
                <!-- QR Code (placeholder) -->
                ${configuracionFactura.impresion.mostrarQR ? `
                    <div class="qr-code">
                        <div>[QR CODE]</div>
                        <div style="font-size: 8px;">Escanea para verificar</div>
                    </div>
                ` : ''}
                
                <!-- Footer -->
                <div class="footer">
                    <div>${factura.resolucionDian}</div>
                    <div>${factura.rangoAutorizado}</div>
                    <div>Vigencia hasta: ${factura.fechaVencimiento}</div>
                    <div style="margin-top: 5px;">¡Gracias por su compra!</div>
                    <div>${factura.empresa.website}</div>
                </div>
            </body>
            </html>
        `;
    },
    
    // Generar HTML para factura formato carta
    generateFacturaHTML(factura) {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <title>Factura ${factura.numeroCompleto}</title>
                <style>
                    * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                    }
                    
                    body {
                        font-family: Arial, sans-serif;
                        font-size: 12px;
                        line-height: 1.4;
                        margin: 20px;
                    }
                    
                    .factura-container {
                        max-width: 210mm;
                        margin: 0 auto;
                        border: 1px solid #ddd;
                        padding: 20px;
                    }
                    
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: start;
                        margin-bottom: 30px;
                        padding-bottom: 20px;
                        border-bottom: 2px solid #333;
                    }
                    
                    .empresa-info h1 {
                        font-size: 24px;
                        color: #333;
                        margin-bottom: 10px;
                    }
                    
                    .factura-numero {
                        text-align: right;
                        background: #f8f9fa;
                        padding: 15px;
                        border: 1px solid #ddd;
                    }
                    
                    .factura-numero h2 {
                        color: #007bff;
                        font-size: 18px;
                        margin-bottom: 5px;
                    }
                    
                    .cliente-factura {
                        display: flex;
                        justify-content: space-between;
                        margin-bottom: 30px;
                    }
                    
                    .cliente-info, .factura-datos {
                        width: 48%;
                        padding: 15px;
                        background: #f8f9fa;
                        border: 1px solid #ddd;
                    }
                    
                    .items-table {
                        width: 100%;
                        border-collapse: collapse;
                        margin-bottom: 20px;
                    }
                    
                    .items-table th,
                    .items-table td {
                        border: 1px solid #ddd;
                        padding: 10px;
                        text-align: left;
                    }
                    
                    .items-table th {
                        background: #333;
                        color: white;
                        font-weight: bold;
                    }
                    
                    .items-table td.number {
                        text-align: right;
                    }
                    
                    .totales-section {
                        display: flex;
                        justify-content: flex-end;
                        margin-bottom: 30px;
                    }
                    
                    .totales-tabla {
                        width: 300px;
                        border-collapse: collapse;
                    }
                    
                    .totales-tabla td {
                        padding: 8px 12px;
                        border: 1px solid #ddd;
                    }
                    
                    .totales-tabla .total-final {
                        background: #333;
                        color: white;
                        font-weight: bold;
                        font-size: 14px;
                    }
                    
                    .footer-info {
                        margin-top: 30px;
                        padding-top: 20px;
                        border-top: 1px solid #ddd;
                        font-size: 10px;
                        color: #666;
                    }
                    
                    @media print {
                        body { margin: 0; }
                        .factura-container { 
                            border: none; 
                            margin: 0;
                            max-width: none;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="factura-container">
                    <!-- Header -->
                    <div class="header">
                        <div class="empresa-info">
                            <h1>${factura.empresa.nombre}</h1>
                            <div>NIT: ${factura.empresa.nit}</div>
                            <div>${factura.empresa.direccion}</div>
                            <div>Tel: ${factura.empresa.telefono}</div>
                            <div>Email: ${factura.empresa.email}</div>
                        </div>
                        <div class="factura-numero">
                            <h2>FACTURA DE VENTA</h2>
                            <div><strong>${factura.numeroCompleto}</strong></div>
                        </div>
                    </div>
                    
                    <!-- Cliente y datos de factura -->
                    <div class="cliente-factura">
                        <div class="cliente-info">
                            <h3>INFORMACIÓN DEL CLIENTE</h3>
                            <div><strong>Nombre:</strong> ${factura.cliente.nombre}</div>
                            ${factura.cliente.documento ? `<div><strong>Documento:</strong> ${factura.cliente.documento}</div>` : ''}
                            ${factura.cliente.direccion ? `<div><strong>Dirección:</strong> ${factura.cliente.direccion}</div>` : ''}
                            ${factura.cliente.telefono ? `<div><strong>Teléfono:</strong> ${factura.cliente.telefono}</div>` : ''}
                        </div>
                        <div class="factura-datos">
                            <h3>DATOS DE LA FACTURA</h3>
                            <div><strong>Fecha:</strong> ${factura.fechaFormateada}</div>
                            <div><strong>Cajero:</strong> ${factura.usuario}</div>
                            <div><strong>Método de pago:</strong> ${this.getMetodoPagoText(factura.metodoPago)}</div>
                        </div>
                    </div>
                    
                    <!-- Tabla de items -->
                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Descripción</th>
                                <th>Cant.</th>
                                <th>Precio Unit.</th>
                                <th>Subtotal</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${factura.items.map(item => `
                                <tr>
                                    <td>${item.nombre}</td>
                                    <td class="number">${item.cantidad}</td>
                                    <td class="number">${formatCurrency(item.precio)}</td>
                                    <td class="number">${formatCurrency(item.subtotal)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <!-- Totales -->
                    <div class="totales-section">
                        <table class="totales-tabla">
                            <tr>
                                <td>Subtotal:</td>
                                <td class="number">${formatCurrency(factura.subtotal)}</td>
                            </tr>
                            <tr>
                                <td>IVA (19%):</td>
                                <td class="number">${formatCurrency(factura.impuestos)}</td>
                            </tr>
                            <tr class="total-final">
                                <td>TOTAL:</td>
                                <td class="number">${formatCurrency(factura.total)}</td>
                            </tr>
                        </table>
                    </div>
                    
                    <!-- Footer -->
                    <div class="footer-info">
                        <div><strong>INFORMACIÓN TRIBUTARIA</strong></div>
                        <div>${factura.resolucionDian}</div>
                        <div>${factura.rangoAutorizado}</div>
                        <div>Vigencia de la numeración hasta: ${factura.fechaVencimiento}</div>
                        <div style="margin-top: 15px; text-align: center;">
                            <strong>¡Gracias por su compra!</strong><br>
                            ${factura.empresa.website}
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;
    },
    
    // Obtener texto del método de pago
    getMetodoPagoText(metodo) {
        const metodos = {
            'efectivo': 'Efectivo',
            'tarjeta': 'Tarjeta de Crédito/Débito',
            'transferencia': 'Transferencia Bancaria',
            'qr': 'Código QR'
        };
        return metodos[metodo] || metodo;
    },
    
    // Vista previa de factura
    previewFactura(factura, formato = 'ticket') {
        const html = formato === 'ticket' 
            ? this.generateTicketHTML(factura)
            : this.generateFacturaHTML(factura);
        
        const previewWindow = window.open('', '_blank', 'width=600,height=800');
        previewWindow.document.write(html);
        previewWindow.document.close();
    }
};

// ============================
// FUNCIÓN PRINCIPAL
// ============================
function generarFactura(ventaData) {
    try {
        facturaActual = FacturaManager.generateFactura(ventaData);
        return facturaActual;
    } catch (error) {
        console.error('Error generando factura:', error);
        throw error;
    }
}

function imprimirFactura(factura = facturaActual, formato = 'ticket') {
    if (!factura) {
        showNotification('No hay factura para imprimir', 'warning');
        return;
    }
    
    PrintManager.printFactura(factura, formato);
}

function previsualizarFactura(factura = facturaActual, formato = 'ticket') {
    if (!factura) {
        showNotification('No hay factura para previsualizar', 'warning');
        return;
    }
    
    PrintManager.previewFactura(factura, formato);
}

// ============================
// CONFIGURACIÓN
// ============================
function actualizarConfiguracionFactura(nuevaConfig) {
    configuracionFactura = { ...configuracionFactura, ...nuevaConfig };
    setStoredData('configFactura', configuracionFactura);
    showNotification('Configuración actualizada', 'success');
}

function obtenerConfiguracionFactura() {
    const config = getStoredData('configFactura');
    if (config) {
        configuracionFactura = config;
    }
    return configuracionFactura;
}

// ============================
// UTILIDADES
// ============================
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

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

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

function showNotification(message, type = 'info', duration = 3000) {
    if (window.FODEXA && window.FODEXA.showNotification) {
        window.FODEXA.showNotification(message, type, duration);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

// ============================
// EXPORTAR FUNCIONES
// ============================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        FacturaManager,
        PrintManager,
        generarFactura,
        imprimirFactura,
        previsualizarFactura,
        actualizarConfiguracionFactura,
        obtenerConfiguracionFactura
    };
} else {
    // Hacer disponible globalmente
    window.FacturaManager = FacturaManager;
    window.PrintManager = PrintManager;
    window.generarFactura = generarFactura;
    window.imprimirFactura = imprimirFactura;
    window.previsualizarFactura = previsualizarFactura;
    window.actualizarConfiguracionFactura = actualizarConfiguracionFactura;
    window.obtenerConfiguracionFactura = obtenerConfiguracionFactura;
}
