/**
 * FODEXA - Módulo de Domicilios
 * Sistema completo de gestión de pedidos a domicilio
 */

// ============================
// VARIABLES GLOBALES
// ============================
let pedidos = [];
let domiciliarios = [];
let productos = [];
let configuracionDomicilios = {
    costoDomicilio: 3000,
    tiempoDefault: 45,
    radioCobertura: 5,
    barrios: []
};
let pedidoActual = null;
let pasoActual = 1;
let vistaActual = 'card';

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener('DOMContentLoaded', function() {
    initializeDomicilios();
});

function initializeDomicilios() {
    // Verificar autenticación
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '../../login.html';
        return;
    }
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar datos
    cargarPedidos();
    cargarDomiciliarios();
    cargarProductos();
    cargarConfiguracion();
    
    // Actualizar estadísticas
    actualizarEstadisticas();
    
    // Configurar fecha por defecto
    document.getElementById('filter-fecha').value = new Date().toISOString().split('T')[0];
}

function cargarDatosIniciales() {
    // Crear domiciliarios demo si no existen
    if (!getStoredData('domiciliarios')) {
        crearDomiciliariosDemo();
    }
    
    // Crear configuración demo si no existe
    if (!getStoredData('configDomicilios')) {
        crearConfiguracionDemo();
    }
    
    // Crear barrios demo si no existen
    if (!getStoredData('barrios')) {
        crearBarriosDemo();
    }
}

function crearDomiciliariosDemo() {
    const domiciliariosDemo = [
        {
            id: 1,
            nombre: 'Carlos Rodríguez',
            telefono: '3001234567',
            vehiculo: 'Moto',
            placa: 'ABC123',
            estado: 'disponible',
            pedidosAsignados: 0,
            calificacion: 4.8
        },
        {
            id: 2,
            nombre: 'Ana María López',
            telefono: '3007654321',
            vehiculo: 'Bicicleta',
            placa: 'BIC001',
            estado: 'disponible',
            pedidosAsignados: 0,
            calificacion: 4.9
        },
        {
            id: 3,
            nombre: 'Luis Fernando Gómez',
            telefono: '3009876543',
            vehiculo: 'Moto',
            placa: 'XYZ789',
            estado: 'ocupado',
            pedidosAsignados: 1,
            calificacion: 4.7
        }
    ];
    
    setStoredData('domiciliarios', domiciliariosDemo);
}

function crearConfiguracionDemo() {
    const configDemo = {
        costoDomicilio: 3000,
        tiempoDefault: 45,
        radioCobertura: 5,
        horaInicio: '08:00',
        horaFin: '22:00',
        diasAtencion: ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo']
    };
    
    setStoredData('configDomicilios', configDemo);
}

function crearBarriosDemo() {
    const barriosDemo = [
        { id: 1, nombre: 'Centro', costoDomicilio: 2500, tiempoEstimado: 30 },
        { id: 2, nombre: 'Norte', costoDomicilio: 3000, tiempoEstimado: 45 },
        { id: 3, nombre: 'Sur', costoDomicilio: 3500, tiempoEstimado: 50 },
        { id: 4, nombre: 'Occidente', costoDomicilio: 4000, tiempoEstimado: 60 },
        { id: 5, nombre: 'Oriente', costoDomicilio: 3000, tiempoEstimado: 45 }
    ];
    
    setStoredData('barrios', barriosDemo);
}

// ============================
// CONFIGURACIÓN DE EVENTOS
// ============================
function setupEventListeners() {
    // Formulario de nuevo pedido
    const formNuevoPedido = document.getElementById('form-nuevo-pedido');
    if (formNuevoPedido) {
        formNuevoPedido.addEventListener('submit', crearPedido);
    }
    
    // Formulario de configuración
    const formConfigDomicilios = document.getElementById('form-config-domicilios');
    if (formConfigDomicilios) {
        formConfigDomicilios.addEventListener('submit', guardarConfiguracion);
    }
    
    // Búsqueda de pedidos (debounce)
    const searchInput = document.getElementById('search-pedidos');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => filtrarPedidos(), 300);
        });
    }
    
    // Filtros
    document.getElementById('filter-estado')?.addEventListener('change', filtrarPedidos);
    document.getElementById('filter-domiciliario')?.addEventListener('change', filtrarPedidos);
    document.getElementById('filter-fecha')?.addEventListener('change', filtrarPedidos);
    
    // Búsqueda de productos en el pedido
    const searchProductos = document.getElementById('buscar-productos-pedido');
    if (searchProductos) {
        let productosTimeout;
        searchProductos.addEventListener('input', function(e) {
            clearTimeout(productosTimeout);
            productosTimeout = setTimeout(() => buscarProductosPedido(e.target.value), 300);
        });
    }
    
    // Selector de barrio
    const selectBarrio = document.getElementById('cliente-barrio');
    if (selectBarrio) {
        selectBarrio.addEventListener('change', actualizarCostoDomicilio);
    }
}

// ============================
// GESTIÓN DE PEDIDOS
// ============================
function cargarPedidos() {
    pedidos = getStoredData('pedidos') || [];
    renderizarPedidos();
}

function cargarDomiciliarios() {
    domiciliarios = getStoredData('domiciliarios') || [];
    actualizarSelectDomiciliarios();
}

function cargarProductos() {
    productos = getStoredData('productos') || [];
    renderizarProductosDisponibles();
}

function cargarConfiguracion() {
    const config = getStoredData('configDomicilios');
    if (config) {
        configuracionDomicilios = { ...configuracionDomicilios, ...config };
    }
    cargarBarrios();
}

function cargarBarrios() {
    const barrios = getStoredData('barrios') || [];
    const selectBarrio = document.getElementById('cliente-barrio');
    
    if (selectBarrio) {
        selectBarrio.innerHTML = '<option value="">Seleccionar barrio...</option>';
        barrios.forEach(barrio => {
            const option = document.createElement('option');
            option.value = barrio.id;
            option.textContent = barrio.nombre;
            option.dataset.costo = barrio.costoDomicilio;
            selectBarrio.appendChild(option);
        });
    }
}

function renderizarPedidos(pedidosFiltrados = pedidos) {
    if (vistaActual === 'card') {
        renderizarPedidosCard(pedidosFiltrados);
    } else {
        renderizarPedidosTable(pedidosFiltrados);
    }
}

function renderizarPedidosCard(pedidosFiltrados) {
    const container = document.getElementById('pedidos-cards');
    if (!container) return;
    
    if (pedidosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-motorcycle"></i>
                <h3>No hay pedidos</h3>
                <p>No se encontraron pedidos con los filtros actuales</p>
                <button class="btn btn-primary" onclick="nuevoPedido()">
                    <i class="fas fa-plus"></i> Crear Nuevo Pedido
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = pedidosFiltrados.map(pedido => `
        <div class="pedido-card estado-${pedido.estado}" data-pedido-id="${pedido.id}">
            <div class="pedido-header">
                <div class="pedido-numero">Pedido #${pedido.numero}</div>
                <div class="pedido-tiempo">${formatTiempoTranscurrido(pedido.fechaCreacion)}</div>
            </div>
            
            <div class="pedido-cliente">
                <div class="cliente-nombre">${pedido.cliente.nombre}</div>
                <div class="cliente-telefono">📞 ${pedido.cliente.telefono}</div>
                <div class="cliente-direccion">📍 ${pedido.cliente.direccion}</div>
            </div>
            
            <div class="pedido-detalles">
                <div class="pedido-estado">
                    <span class="estado-${pedido.estado}">${getEstadoTexto(pedido.estado)}</span>
                </div>
                ${pedido.domiciliario ? `
                    <div class="pedido-domiciliario">
                        🏍️ ${pedido.domiciliario.nombre}
                    </div>
                ` : ''}
                <div class="pedido-total">
                    <div class="total-amount">${formatCurrency(pedido.total)}</div>
                </div>
            </div>
            
            <div class="pedido-actions">
                <button class="btn-action btn-ver" onclick="verDetallePedido(${pedido.id})">
                    <i class="fas fa-eye"></i> Ver
                </button>
                ${pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' ? `
                    <button class="btn-action btn-actualizar" onclick="actualizarEstadoPedido(${pedido.id})">
                        <i class="fas fa-edit"></i> Actualizar
                    </button>
                ` : ''}
                ${pedido.estado === 'pendiente' ? `
                    <button class="btn-action btn-cancelar" onclick="cancelarPedido(${pedido.id})">
                        <i class="fas fa-times"></i> Cancelar
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function renderizarPedidosTable(pedidosFiltrados) {
    const tableBody = document.getElementById('pedidos-table-body');
    if (!tableBody) return;
    
    if (pedidosFiltrados.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center">
                    <div class="empty-state">
                        <i class="fas fa-motorcycle"></i>
                        <h3>No hay pedidos</h3>
                        <p>No se encontraron pedidos con los filtros actuales</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = pedidosFiltrados.map(pedido => `
        <tr data-pedido-id="${pedido.id}">
            <td>
                <strong>#${pedido.numero}</strong><br>
                <small>${formatFecha(pedido.fechaCreacion)}</small>
            </td>
            <td>
                <strong>${pedido.cliente.nombre}</strong><br>
                <small>${pedido.cliente.telefono}</small>
            </td>
            <td>${pedido.cliente.direccion}</td>
            <td>${pedido.domiciliario ? pedido.domiciliario.nombre : 'Sin asignar'}</td>
            <td><strong>${formatCurrency(pedido.total)}</strong></td>
            <td>
                <span class="pedido-estado estado-${pedido.estado}">
                    ${getEstadoTexto(pedido.estado)}
                </span>
            </td>
            <td>${formatTiempoTranscurrido(pedido.fechaCreacion)}</td>
            <td>
                <div class="pedido-actions">
                    <button class="btn-action btn-ver" onclick="verDetallePedido(${pedido.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    ${pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' ? `
                        <button class="btn-action btn-actualizar" onclick="actualizarEstadoPedido(${pedido.id})">
                            <i class="fas fa-edit"></i>
                        </button>
                    ` : ''}
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================
// GESTIÓN DE NUEVO PEDIDO
// ============================
function nuevoPedido() {
    pedidoActual = {
        items: [],
        cliente: {},
        domicilio: {},
        total: 0,
        subtotal: 0,
        costoDomicilio: configuracionDomicilios.costoDomicilio
    };
    
    pasoActual = 1;
    actualizarPasos();
    limpiarFormularioPedido();
    renderizarProductosDisponibles();
    showModal('modal-nuevo-pedido');
}

function siguientePaso() {
    if (validarPasoActual()) {
        if (pasoActual < 3) {
            pasoActual++;
            actualizarPasos();
        }
    }
}

function anteriorPaso() {
    if (pasoActual > 1) {
        pasoActual--;
        actualizarPasos();
    }
}

function actualizarPasos() {
    // Ocultar todas las secciones
    document.querySelectorAll('.step-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Mostrar sección actual
    const seccionActual = document.querySelector(`[data-step="${pasoActual}"]`);
    if (seccionActual) {
        seccionActual.classList.add('active');
    }
    
    // Actualizar indicadores
    document.querySelectorAll('.step-indicator').forEach((indicator, index) => {
        indicator.classList.remove('active', 'completed');
        const step = index + 1;
        
        if (step < pasoActual) {
            indicator.classList.add('completed');
        } else if (step === pasoActual) {
            indicator.classList.add('active');
        }
    });
    
    // Controlar botones
    const btnPrev = document.getElementById('btn-prev-step');
    const btnNext = document.getElementById('btn-next-step');
    const btnCrear = document.getElementById('btn-crear-pedido');
    
    if (btnPrev) btnPrev.disabled = pasoActual === 1;
    
    if (pasoActual === 3) {
        if (btnNext) btnNext.classList.add('hidden');
        if (btnCrear) btnCrear.classList.remove('hidden');
    } else {
        if (btnNext) btnNext.classList.remove('hidden');
        if (btnCrear) btnCrear.classList.add('hidden');
    }
}

function validarPasoActual() {
    switch (pasoActual) {
        case 1:
            return validarPaso1();
        case 2:
            return validarPaso2();
        case 3:
            return validarPaso3();
        default:
            return true;
    }
}

function validarPaso1() {
    const nombre = document.getElementById('cliente-nombre').value.trim();
    const telefono = document.getElementById('cliente-telefono').value.trim();
    const direccion = document.getElementById('cliente-direccion').value.trim();
    
    if (!nombre) {
        showNotification('El nombre del cliente es obligatorio', 'warning');
        return false;
    }
    
    if (!telefono) {
        showNotification('El teléfono del cliente es obligatorio', 'warning');
        return false;
    }
    
    if (!direccion) {
        showNotification('La dirección es obligatoria', 'warning');
        return false;
    }
    
    // Guardar datos del cliente
    pedidoActual.cliente = {
        nombre,
        telefono,
        direccion,
        barrio: document.getElementById('cliente-barrio').value,
        referencias: document.getElementById('cliente-referencias').value
    };
    
    return true;
}

function validarPaso2() {
    if (pedidoActual.items.length === 0) {
        showNotification('Agrega al menos un producto al pedido', 'warning');
        return false;
    }
    
    return true;
}

function validarPaso3() {
    const metodoPago = document.getElementById('metodo-pago-domicilio').value;
    
    if (!metodoPago) {
        showNotification('Selecciona un método de pago', 'warning');
        return false;
    }
    
    return true;
}

// ============================
// GESTIÓN DE PRODUCTOS EN PEDIDO
// ============================
function renderizarProductosDisponibles() {
    const container = document.getElementById('productos-disponibles');
    if (!container) return;
    
    container.innerHTML = productos.map(producto => `
        <div class="producto-item" onclick="agregarProductoPedido(${producto.id})">
            <div class="producto-nombre">${producto.nombre}</div>
            <div class="producto-precio">${formatCurrency(producto.precio)}</div>
            ${producto.stock <= 0 ? '<div class="producto-agotado">Agotado</div>' : ''}
        </div>
    `).join('');
}

function buscarProductosPedido(termino) {
    if (!termino.trim()) {
        renderizarProductosDisponibles();
        return;
    }
    
    const productosFiltrados = productos.filter(producto =>
        producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
        producto.codigo.toLowerCase().includes(termino.toLowerCase())
    );
    
    const container = document.getElementById('productos-disponibles');
    if (container) {
        container.innerHTML = productosFiltrados.map(producto => `
            <div class="producto-item" onclick="agregarProductoPedido(${producto.id})">
                <div class="producto-nombre">${producto.nombre}</div>
                <div class="producto-precio">${formatCurrency(producto.precio)}</div>
                ${producto.stock <= 0 ? '<div class="producto-agotado">Agotado</div>' : ''}
            </div>
        `).join('');
    }
}

function agregarProductoPedido(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock <= 0) {
        showNotification('Producto no disponible', 'warning');
        return;
    }
    
    const itemExistente = pedidoActual.items.find(item => item.id === productoId);
    
    if (itemExistente) {
        if (itemExistente.cantidad >= producto.stock) {
            showNotification('Stock insuficiente', 'warning');
            return;
        }
        itemExistente.cantidad++;
    } else {
        pedidoActual.items.push({
            id: producto.id,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });
    }
    
    actualizarResumenPedido();
    showNotification(`${producto.nombre} agregado al pedido`, 'success', 1500);
}

function modificarCantidadPedido(productoId, operacion) {
    const item = pedidoActual.items.find(item => item.id === productoId);
    if (!item) return;
    
    if (operacion === 'aumentar') {
        const producto = productos.find(p => p.id === productoId);
        if (item.cantidad >= producto.stock) {
            showNotification('Stock insuficiente', 'warning');
            return;
        }
        item.cantidad++;
    } else if (operacion === 'disminuir') {
        item.cantidad--;
        if (item.cantidad <= 0) {
            eliminarProductoPedido(productoId);
            return;
        }
    }
    
    actualizarResumenPedido();
}

function eliminarProductoPedido(productoId) {
    pedidoActual.items = pedidoActual.items.filter(item => item.id !== productoId);
    actualizarResumenPedido();
}

function actualizarResumenPedido() {
    const container = document.getElementById('items-pedido');
    if (!container) return;
    
    if (pedidoActual.items.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay productos agregados</p>';
    } else {
        container.innerHTML = pedidoActual.items.map(item => `
            <div class="item-pedido">
                <div class="item-info">
                    <div class="item-nombre">${item.nombre}</div>
                    <div class="item-detalle">${formatCurrency(item.precio)} c/u</div>
                </div>
                <div class="item-cantidad-controls">
                    <button class="cantidad-btn" onclick="modificarCantidadPedido(${item.id}, 'disminuir')">-</button>
                    <span class="cantidad-display">${item.cantidad}</span>
                    <button class="cantidad-btn" onclick="modificarCantidadPedido(${item.id}, 'aumentar')">+</button>
                </div>
                <div class="item-total">${formatCurrency(item.precio * item.cantidad)}</div>
            </div>
        `).join('');
    }
    
    // Calcular totales
    pedidoActual.subtotal = pedidoActual.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    pedidoActual.total = pedidoActual.subtotal + pedidoActual.costoDomicilio;
    
    // Actualizar UI
    document.getElementById('subtotal-pedido').textContent = formatCurrency(pedidoActual.subtotal);
    document.getElementById('costo-domicilio').textContent = formatCurrency(pedidoActual.costoDomicilio);
    document.getElementById('total-pedido').textContent = formatCurrency(pedidoActual.total);
}

function actualizarCostoDomicilio() {
    const selectBarrio = document.getElementById('cliente-barrio');
    const selectedOption = selectBarrio.options[selectBarrio.selectedIndex];
    
    if (selectedOption && selectedOption.dataset.costo) {
        pedidoActual.costoDomicilio = parseInt(selectedOption.dataset.costo);
    } else {
        pedidoActual.costoDomicilio = configuracionDomicilios.costoDomicilio;
    }
    
    actualizarResumenPedido();
}

// ============================
// CREAR PEDIDO
// ============================
async function crearPedido(e) {
    e.preventDefault();
    
    if (!validarPasoActual()) {
        return;
    }
    
    showLoading('Creando pedido...');
    
    try {
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Crear pedido completo
        const nuevoPedido = {
            id: generateId(),
            numero: getNextPedidoNumber(),
            fechaCreacion: new Date().toISOString(),
            estado: 'pendiente',
            cliente: pedidoActual.cliente,
            items: pedidoActual.items,
            subtotal: pedidoActual.subtotal,
            costoDomicilio: pedidoActual.costoDomicilio,
            total: pedidoActual.total,
            metodoPago: document.getElementById('metodo-pago-domicilio').value,
            tiempoEstimado: parseInt(document.getElementById('tiempo-estimado').value),
            notas: document.getElementById('notas-pedido').value,
            domiciliario: asignarDomiciliario(),
            usuario: getCurrentUser().username,
            timeline: [{
                estado: 'pendiente',
                fecha: new Date().toISOString(),
                descripcion: 'Pedido creado'
            }]
        };
        
        // Guardar pedido
        pedidos.push(nuevoPedido);
        setStoredData('pedidos', pedidos);
        
        // Actualizar stock de productos
        actualizarStockProductos(nuevoPedido.items);
        
        hideLoading();
        
        showNotification('¡Pedido creado exitosamente!', 'success');
        
        // Cerrar modal y actualizar UI
        closeModal('modal-nuevo-pedido');
        cargarPedidos();
        actualizarEstadisticas();
        
        // Limpiar variables
        pedidoActual = null;
        pasoActual = 1;
        
        // Mostrar detalles del pedido
        verDetallePedido(nuevoPedido.id);
        
    } catch (error) {
        hideLoading();
        showNotification('Error al crear el pedido', 'error');
        console.error('Error creando pedido:', error);
    }
}

function getNextPedidoNumber() {
    const ultimoPedido = pedidos.reduce((max, pedido) => 
        pedido.numero > max ? pedido.numero : max, 0);
    return ultimoPedido + 1;
}

function asignarDomiciliario() {
    const domiciliarioId = document.getElementById('domiciliario-asignado').value;
    
    if (domiciliarioId) {
        return domiciliarios.find(d => d.id === parseInt(domiciliarioId));
    }
    
    // Asignación automática: buscar domiciliario disponible
    const disponibles = domiciliarios.filter(d => d.estado === 'disponible');
    if (disponibles.length > 0) {
        // Elegir el que tenga menos pedidos asignados
        return disponibles.reduce((min, domiciliario) => 
            domiciliario.pedidosAsignados < min.pedidosAsignados ? domiciliario : min);
    }
    
    return null;
}

function actualizarStockProductos(items) {
    items.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock -= item.cantidad;
        }
    });
    
    setStoredData('productos', productos);
}

// ============================
// GESTIÓN DE ESTADOS
// ============================
function actualizarEstadoPedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const estadosDisponibles = getEstadosDisponibles(pedido.estado);
    
    if (estadosDisponibles.length === 0) {
        showNotification('No hay estados disponibles para actualizar', 'info');
        return;
    }
    
    const nuevoEstado = prompt(
        `Estado actual: ${getEstadoTexto(pedido.estado)}\n\n` +
        'Selecciona el nuevo estado:\n' +
        estadosDisponibles.map((estado, index) => 
            `${index + 1}. ${getEstadoTexto(estado)}`
        ).join('\n')
    );
    
    const estadoIndex = parseInt(nuevoEstado) - 1;
    
    if (estadoIndex >= 0 && estadoIndex < estadosDisponibles.length) {
        const estadoSeleccionado = estadosDisponibles[estadoIndex];
        cambiarEstadoPedido(pedidoId, estadoSeleccionado);
    }
}

function getEstadosDisponibles(estadoActual) {
    const flujo = {
        'pendiente': ['preparando', 'cancelado'],
        'preparando': ['en-ruta', 'cancelado'],
        'en-ruta': ['entregado', 'cancelado'],
        'entregado': [],
        'cancelado': []
    };
    
    return flujo[estadoActual] || [];
}

function cambiarEstadoPedido(pedidoId, nuevoEstado) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const estadoAnterior = pedido.estado;
    pedido.estado = nuevoEstado;
    
    // Agregar al timeline
    pedido.timeline.push({
        estado: nuevoEstado,
        fecha: new Date().toISOString(),
        descripcion: getDescripcionEstado(nuevoEstado)
    });
    
    // Actualizar domiciliario si es necesario
    if (nuevoEstado === 'entregado' && pedido.domiciliario) {
        const domiciliario = domiciliarios.find(d => d.id === pedido.domiciliario.id);
        if (domiciliario) {
            domiciliario.estado = 'disponible';
            domiciliario.pedidosAsignados = Math.max(0, domiciliario.pedidosAsignados - 1);
        }
    }
    
    // Guardar cambios
    setStoredData('pedidos', pedidos);
    setStoredData('domiciliarios', domiciliarios);
    
    // Actualizar UI
    cargarPedidos();
    actualizarEstadisticas();
    
    showNotification(`Pedido #${pedido.numero} actualizado a ${getEstadoTexto(nuevoEstado)}`, 'success');
}

function cancelarPedido(pedidoId) {
    if (confirm('¿Estás seguro de que quieres cancelar este pedido?')) {
        cambiarEstadoPedido(pedidoId, 'cancelado');
    }
}

function getEstadoTexto(estado) {
    const estados = {
        'pendiente': 'Pendiente',
        'preparando': 'Preparando',
        'en-ruta': 'En Ruta',
        'entregado': 'Entregado',
        'cancelado': 'Cancelado'
    };
    return estados[estado] || estado;
}

function getDescripcionEstado(estado) {
    const descripciones = {
        'pendiente': 'Pedido recibido',
        'preparando': 'Preparando pedido',
        'en-ruta': 'Pedido en camino',
        'entregado': 'Pedido entregado',
        'cancelado': 'Pedido cancelado'
    };
    return descripciones[estado] || estado;
}

// ============================
// DETALLES Y SEGUIMIENTO
// ============================
function verDetallePedido(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    document.getElementById('pedido-numero').textContent = `#${pedido.numero}`;
    
    const content = document.getElementById('detalle-pedido-content');
    if (content) {
        content.innerHTML = `
            <div class="pedido-detalle-grid">
                <div class="pedido-info-section">
                    <h4>Información del Cliente</h4>
                    <div class="info-grid">
                        <div><strong>Nombre:</strong> ${pedido.cliente.nombre}</div>
                        <div><strong>Teléfono:</strong> ${pedido.cliente.telefono}</div>
                        <div><strong>Dirección:</strong> ${pedido.cliente.direccion}</div>
                        ${pedido.cliente.referencias ? `<div><strong>Referencias:</strong> ${pedido.cliente.referencias}</div>` : ''}
                    </div>
                </div>
                
                <div class="pedido-info-section">
                    <h4>Detalles del Pedido</h4>
                    <div class="info-grid">
                        <div><strong>Estado:</strong> <span class="estado-${pedido.estado}">${getEstadoTexto(pedido.estado)}</span></div>
                        <div><strong>Fecha:</strong> ${formatFecha(pedido.fechaCreacion)}</div>
                        <div><strong>Método de Pago:</strong> ${pedido.metodoPago}</div>
                        ${pedido.domiciliario ? `<div><strong>Domiciliario:</strong> ${pedido.domiciliario.nombre}</div>` : ''}
                        <div><strong>Tiempo Estimado:</strong> ${pedido.tiempoEstimado} minutos</div>
                    </div>
                </div>
                
                <div class="pedido-items-section">
                    <h4>Productos</h4>
                    <div class="items-detalle">
                        ${pedido.items.map(item => `
                            <div class="item-detalle-row">
                                <div class="item-nombre">${item.nombre}</div>
                                <div class="item-cantidad">x${item.cantidad}</div>
                                <div class="item-precio">${formatCurrency(item.precio)}</div>
                                <div class="item-total">${formatCurrency(item.precio * item.cantidad)}</div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="totales-detalle">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>${formatCurrency(pedido.subtotal)}</span>
                        </div>
                        <div class="total-row">
                            <span>Domicilio:</span>
                            <span>${formatCurrency(pedido.costoDomicilio)}</span>
                        </div>
                        <div class="total-row total-final">
                            <span>Total:</span>
                            <span>${formatCurrency(pedido.total)}</span>
                        </div>
                    </div>
                </div>
                
                ${pedido.notas ? `
                    <div class="pedido-notas-section">
                        <h4>Notas Especiales</h4>
                        <p>${pedido.notas}</p>
                    </div>
                ` : ''}
                
                <div class="pedido-acciones">
                    <button class="btn btn-primary" onclick="verSeguimiento(${pedido.id})">
                        <i class="fas fa-route"></i> Ver Seguimiento
                    </button>
                    ${pedido.estado !== 'entregado' && pedido.estado !== 'cancelado' ? `
                        <button class="btn btn-success" onclick="actualizarEstadoPedido(${pedido.id})">
                            <i class="fas fa-edit"></i> Actualizar Estado
                        </button>
                    ` : ''}
                    ${pedido.estado === 'entregado' ? `
                        <button class="btn btn-outline" onclick="imprimirComprobanteEntrega(${pedido.id})">
                            <i class="fas fa-print"></i> Imprimir Comprobante
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }
    
    showModal('modal-detalle-pedido');
}

function verSeguimiento(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const timeline = document.getElementById('timeline-pedido');
    if (timeline) {
        timeline.innerHTML = pedido.timeline.map((evento, index) => `
            <div class="timeline-item ${index === pedido.timeline.length - 1 ? 'active' : 'completed'}">
                <div class="timeline-content">
                    <div class="timeline-title">${getEstadoTexto(evento.estado)}</div>
                    <div class="timeline-time">${formatFecha(evento.fecha)}</div>
                    <div class="timeline-description">${evento.descripcion}</div>
                </div>
            </div>
        `).join('');
    }
    
    showModal('modal-seguimiento');
}

// ============================
// FILTROS Y BÚSQUEDA
// ============================
function filtrarPedidos() {
    const termino = document.getElementById('search-pedidos').value.toLowerCase();
    const estado = document.getElementById('filter-estado').value;
    const domiciliario = document.getElementById('filter-domiciliario').value;
    const fecha = document.getElementById('filter-fecha').value;
    
    let pedidosFiltrados = [...pedidos];
    
    // Filtro por búsqueda
    if (termino) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido =>
            pedido.cliente.nombre.toLowerCase().includes(termino) ||
            pedido.cliente.telefono.includes(termino) ||
            pedido.cliente.direccion.toLowerCase().includes(termino) ||
            pedido.numero.toString().includes(termino)
        );
    }
    
    // Filtro por estado
    if (estado) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido => pedido.estado === estado);
    }
    
    // Filtro por domiciliario
    if (domiciliario) {
        pedidosFiltrados = pedidosFiltrados.filter(pedido => 
            pedido.domiciliario && pedido.domiciliario.id === parseInt(domiciliario)
        );
    }
    
    // Filtro por fecha
    if (fecha) {
        const fechaFiltro = new Date(fecha);
        pedidosFiltrados = pedidosFiltrados.filter(pedido => {
            const fechaPedido = new Date(pedido.fechaCreacion);
            return fechaPedido.toDateString() === fechaFiltro.toDateString();
        });
    }
    
    renderizarPedidos(pedidosFiltrados);
}

function cambiarVista(vista) {
    vistaActual = vista;
    
    // Actualizar botones
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-view="${vista}"]`).classList.add('active');
    
    // Mostrar/ocultar vistas
    const cardsContainer = document.getElementById('pedidos-cards');
    const tableContainer = document.getElementById('pedidos-table');
    
    if (vista === 'card') {
        cardsContainer.classList.remove('hidden');
        tableContainer.classList.add('hidden');
    } else {
        cardsContainer.classList.add('hidden');
        tableContainer.classList.remove('hidden');
    }
    
    renderizarPedidos();
}

// ============================
// ESTADÍSTICAS
// ============================
function actualizarEstadisticas() {
    const hoy = new Date().toDateString();
    const pedidosHoy = pedidos.filter(pedido => 
        new Date(pedido.fechaCreacion).toDateString() === hoy
    );
    
    const pendientes = pedidos.filter(p => p.estado === 'pendiente').length;
    const enRuta = pedidos.filter(p => p.estado === 'en-ruta').length;
    const entregadosHoy = pedidosHoy.filter(p => p.estado === 'entregado').length;
    const ingresosHoy = pedidosHoy
        .filter(p => p.estado === 'entregado')
        .reduce((sum, p) => sum + p.total, 0);
    
    document.getElementById('pedidos-pendientes').textContent = pendientes;
    document.getElementById('pedidos-en-ruta').textContent = enRuta;
    document.getElementById('pedidos-entregados').textContent = entregadosHoy;
    document.getElementById('ingresos-domicilios').textContent = formatCurrency(ingresosHoy);
}

function actualizarSelectDomiciliarios() {
    const selects = ['filter-domiciliario', 'domiciliario-asignado'];
    
    selects.forEach(selectId => {
        const select = document.getElementById(selectId);
        if (select) {
            const optionsHTML = domiciliarios.map(domiciliario => 
                `<option value="${domiciliario.id}">${domiciliario.nombre} (${domiciliario.vehiculo})</option>`
            ).join('');
            
            if (selectId === 'filter-domiciliario') {
                select.innerHTML = '<option value="">Todos los domiciliarios</option>' + optionsHTML;
            } else {
                select.innerHTML = '<option value="">Asignar automáticamente</option>' + optionsHTML;
            }
        }
    });
}

// ============================
// CONFIGURACIÓN
// ============================
function mostrarModalConfiguracion() {
    // Cargar configuración actual
    document.getElementById('costo-domicilio-config').value = configuracionDomicilios.costoDomicilio;
    document.getElementById('tiempo-default').value = configuracionDomicilios.tiempoDefault;
    document.getElementById('radio-cobertura').value = configuracionDomicilios.radioCobertura;
    
    showModal('modal-configuracion-domicilios');
}

function guardarConfiguracion(e) {
    e.preventDefault();
    
    configuracionDomicilios.costoDomicilio = parseInt(document.getElementById('costo-domicilio-config').value);
    configuracionDomicilios.tiempoDefault = parseInt(document.getElementById('tiempo-default').value);
    configuracionDomicilios.radioCobertura = parseFloat(document.getElementById('radio-cobertura').value);
    
    setStoredData('configDomicilios', configuracionDomicilios);
    
    showNotification('Configuración guardada exitosamente', 'success');
    closeModal('modal-configuracion-domicilios');
}

// ============================
// UTILIDADES
// ============================
function limpiarFormularioPedido() {
    document.getElementById('form-nuevo-pedido').reset();
    document.getElementById('items-pedido').innerHTML = '<p class="text-muted">No hay productos agregados</p>';
    document.getElementById('subtotal-pedido').textContent = formatCurrency(0);
    document.getElementById('costo-domicilio').textContent = formatCurrency(configuracionDomicilios.costoDomicilio);
    document.getElementById('total-pedido').textContent = formatCurrency(configuracionDomicilios.costoDomicilio);
}

function volverDashboard() {
    window.location.href = '../../index.html';
}

function formatTiempoTranscurrido(fecha) {
    const ahora = new Date();
    const fechaPedido = new Date(fecha);
    const diferencia = ahora - fechaPedido;
    
    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(minutos / 60);
    
    if (horas > 0) {
        return `${horas}h ${minutos % 60}m`;
    } else {
        return `${minutos}m`;
    }
}

function formatFecha(fecha) {
    return new Date(fecha).toLocaleString('es-CO', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Funciones auxiliares
function getCurrentUser() {
    try {
        const userStr = localStorage.getItem('fodexa_user');
        return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
        return null;
    }
}

function getStoredData(key) {
    try {
        const data = localStorage.getItem(`fodexa_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        return null;
    }
}

function setStoredData(key, data) {
    try {
        localStorage.setItem(`fodexa_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
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

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }
}

function cerrarModal(modalId) {
    closeModal(modalId);
}

function showNotification(message, type = 'info', duration = 3000) {
    if (window.FODEXA && window.FODEXA.showNotification) {
        window.FODEXA.showNotification(message, type, duration);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

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
