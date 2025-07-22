// Función para cargar la lista de clientes en el modal BaseClientes
function cargarClientesEnModal() {
    var lista = document.getElementById('clientes-db-lista');
    var loading = document.getElementById('loading-clientes-db');
    var empty = document.getElementById('empty-clientes-db');
    var total = document.getElementById('total-clientes');
    var count = document.getElementById('clientes-count');
    if (!lista) return;
    // Mostrar estado de carga
    if (loading) loading.classList.remove('hidden');
    if (empty) empty.classList.add('hidden');
    lista.innerHTML = '';
    fetch('../../data/clientes.json')
        .then(function(res) { return res.json(); })
        .then(function(clientes) {
            if (loading) loading.classList.add('hidden');
            if (Array.isArray(clientes) && clientes.length > 0) {
                clientes.forEach(function(cliente) {
                    var div = document.createElement('div');
                    div.className = 'cliente-db-item';
                    div.innerHTML =
                        '<span class="cliente-nombre">' + (cliente.nombre || '-') + '</span>' +
                        ' <span class="cliente-doc">' + (cliente.documento || '-') + '</span>' +
                        ' <span class="cliente-tel">' + (cliente.whatsapp || cliente.telefono || '-') + '</span>';
                    lista.appendChild(div);
                });
                if (total) total.textContent = clientes.length;
                if (count) count.textContent = clientes.length + ' clientes encontrados';
            } else {
                if (empty) empty.classList.remove('hidden');
                if (total) total.textContent = '0';
                if (count) count.textContent = '0 clientes encontrados';
            }
        })
        .catch(function() {
            if (loading) loading.classList.add('hidden');
            if (empty) empty.classList.remove('hidden');
            if (total) total.textContent = '0';
            if (count) count.textContent = '0 clientes encontrados';
        });
}
window.cargarClientesEnModal = cargarClientesEnModal;
// Función global para abrir SIEMPRE el modal original de BaseClientes
function navegarBaseDatosClientes() {
    var modal = document.getElementById('modal-base-datos-clientes');
    if (modal) {
        modal.classList.remove('hidden');
        if (typeof cargarClientesEnModal === 'function') {
            cargarClientesEnModal();
        }
    }
}
window.navegarBaseDatosClientes = navegarBaseDatosClientes;
// Mostrar modal con la información completa del cliente seleccionado
function mostrarInfoCompletaCliente() {
    const c = window.clienteSeleccionado;
    if (!c) return;
    // Crear modal si no existe
    let modal = document.getElementById('modal-info-cliente');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-info-cliente';
        modal.className = 'modal-cliente-info';
        modal.style.zIndex = '99999';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-cliente-info-content">
                <button class="modal-close" onclick="document.getElementById('modal-info-cliente').classList.add('hidden')">&times;</button>
                <h3>Información completa del cliente</h3>
                <div id="modal-info-cliente-body"></div>
            </div>
        `;
        // Asegura que el modal se agregue al final del body
        document.body.appendChild(modal);
    }
    // Siempre forzar visibilidad
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
    modal.style.zIndex = '99999';
    // Rellenar datos
    const body = document.getElementById('modal-info-cliente-body');
    if (body) {
        body.innerHTML = `
            <p><strong>Nombre:</strong> ${c.nombre || '-'}</p>
            <p><strong>Teléfono:</strong> ${c.telefono || c.whatsapp || '-'}</p>
            <p><strong>Documento:</strong> ${c.documento || '-'}</p>
            <p><strong>Email:</strong> ${c.email || '-'}</p>
            <p><strong>Dirección principal:</strong> ${(Array.isArray(c.direcciones) && c.direcciones.length > 0 ? c.direcciones[0] : (c.direccion || '-'))}</p>
            ${Array.isArray(c.direcciones) && c.direcciones.length > 1 ? `<p><strong>Otras direcciones:</strong><br>${c.direcciones.slice(1).map(d => `<span>${d}</span>`).join('<br>')}</p>` : ''}
            <p><strong>Ciudad:</strong> ${c.ciudad || '-'}</p>
            <p><strong>Tipo:</strong> ${c.tipo || '-'}</p>
            <p><strong>Descuento:</strong> ${c.descuento ? c.descuento + '%' : '-'}</p>
            <p><strong>Notas:</strong> ${c.notas || '-'}</p>
        `;
    }
    modal.classList.remove('hidden');
}
window.mostrarInfoCompletaCliente = mostrarInfoCompletaCliente;
// Permite cambiar el cliente seleccionado y volver a mostrar el buscador
function cambiarCliente() {
    // Limpiar variables globales
    clienteSeleccionado = null;
    direccionEntregaSeleccionada = null;
    // Mostrar buscador y ocultar bloque de cliente seleccionado
    const selector = document.getElementById('cliente-selector');
    const seleccionado = document.getElementById('cliente-seleccionado');
    if (selector && seleccionado) {
        selector.classList.remove('hidden');
        seleccionado.classList.add('hidden');
    }
    // Limpiar campos
    const searchCliente = document.getElementById('search-cliente');
    if (searchCliente) searchCliente.value = '';
    // Limpiar dirección de entrega
    limpiarDireccionEntrega && limpiarDireccionEntrega();
    // Limpiar resultados de búsqueda
    cerrarBuscadorCliente && cerrarBuscadorCliente();
    // Actualizar resumen
    actualizarResumen && actualizarResumen();
}

// Hacer global
window.cambiarCliente = cambiarCliente;
// Asegurar que el alias global buscarClienteCarrito esté disponible después de cargar todo el script
window.buscarClienteCarrito = buscarClienteCarritoWrapper;
// Mostrar la vista de productos y ocultar otras vistas principales
function mostrarVistaProductos() {
    // Ocultar otras vistas principales si existen
    const secciones = [
        document.querySelector('[data-module="ventas"]'),
        document.querySelector('[data-module="domicilios"]'),
        document.querySelector('[data-module="clientes"]'),
        document.querySelector('[data-module="inventario"]'),
        document.querySelector('[data-module="reportes"]')
    ];
    secciones.forEach(sec => { if(sec) sec.style.display = 'none'; });
    // Mostrar la vista de productos
    const vista = document.getElementById('vista-productos');
    if(vista) vista.style.display = 'block';
}
// Botón cerrar moderno para el formulario de nuevo cliente
function cerrarFormularioClienteModerno() {
    const formContainer = document.getElementById('nuevo-cliente-form-container');
    if (formContainer) {
        formContainer.classList.add('hidden');
    }
    const form = document.getElementById('form-nuevo-cliente-insertado');
    if (form) {
        form.reset();
    }
}
// Cierra el formulario de nuevo cliente limpiando y ocultando el modal, sin validaciones ni guardado
function cerrarFormularioCliente() {
    const formContainer = document.getElementById('nuevo-cliente-form-container');
    if (formContainer) {
        formContainer.classList.add('hidden');
    }
    const form = document.getElementById('form-nuevo-cliente-insertado');
    if (form) {
        form.reset();
    }
}
/**
 * FODEXA - Módulo de Ventas
 * Sistema POS completo para gestión de ventas
 */

// ============================
// VARIABLES GLOBALES
// ============================

// Importar utilidades de cálculo de costos
let carrito = [];
let productos = [];
let categorias = [];

// Cargar productos y categorías desde ProductosManager al iniciar ventas
function cargarProductosDesdeManager() {
    productos = window.ProductosManager ? window.ProductosManager.getAll() : [];
    categorias = window.CategoriasManager ? window.CategoriasManager.getAll() : [];
}

// Al cargar la vista de ventas, cargar productos y categorías actualizados
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vista-ventas')) {
        cargarProductosDesdeManager();
        renderizarProductos();
        renderizarCategorias();
    }
});
let clienteSeleccionado = null;
let direccionEntregaSeleccionada = null; // Nueva variable para la dirección de entrega
let ventaActual = null;

// Variables para IndexedDB
let db = null;
const DB_NAME = 'FodexaClientesDB';
const DB_VERSION = 1;
const STORE_NAME = 'clientes';

// ============================
// FUNCIONES PRINCIPALES DE MODAL (Declaradas temprano para disponibilidad inmediata)
// ============================
function mostrarModalNuevoCliente() {

// Asegurar que la función esté disponible globalmente después de cargar todo el script
window.mostrarModalNuevoCliente = mostrarModalNuevoCliente;
    console.log('📝 Abriendo modal de nuevo cliente');
    
    try {
        // Limpiar formulario antes de mostrar
        if (typeof limpiarFormularioNuevoCliente === 'function') {
            limpiarFormularioNuevoCliente();
        }
        
        // Abrir modal
        showModal('modal-nuevo-cliente');
        
        // Enfocar en el primer campo después de un pequeño delay
        setTimeout(() => {
            const primerCampo = document.getElementById('nuevo-cliente-nombre');
            if (primerCampo) {
                primerCampo.focus();
            }
        }, 100);
        
        console.log('✅ Modal de nuevo cliente abierto');
        
    } catch (error) {
        console.error('❌ Error al abrir modal de nuevo cliente:', error);
        showNotification('Error al abrir formulario de cliente', 'error');
    }
}

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener('DOMContentLoaded', function() {
    initializeVentas();
});

async function initializeVentas() {
    // Verificar autenticación
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = '../../login.html';
        return;
    }
    
    // Inicializar IndexedDB primero
    try {
        await initIndexedDB();
        console.log('✅ Base de datos IndexedDB inicializada');
    } catch (error) {
        console.error('❌ Error al inicializar IndexedDB:', error);
        showNotification('Error al inicializar base de datos local', 'error');
    }
    
    // Cargar datos iniciales
    cargarDatosIniciales();
    
    // Configurar eventos
    setupEventListeners();
    
    // Cargar productos y categorías
    cargarProductos();
    cargarCategorias();
    
    // Inicializar carrito
    actualizarCarritoUI();
    
    // Inicializar interfaz de cliente
    setTimeout(() => {
        inicializarInterfazCliente();
        console.log('✅ Interfaz de cliente inicializada');
    }, 200);
}

function cargarDatosIniciales() {
    // Crear productos demo si no existen
    if (!getStoredData('productos')) {
        crearProductosDemo();
        console.log('✅ Productos demo creados');
    }
    
    // Crear categorías demo si no existen
    if (!getStoredData('categorias')) {
        crearCategoriasDemo();
        console.log('✅ Categorías demo creadas');
    }
    
    // Crear clientes demo si no existen
    const clientesExistentes = getStoredData('clientes');
    if (!clientesExistentes || clientesExistentes.length === 0) {
        crearClientesDemo();
        console.log('✅ Clientes demo creados');
    }
    
    // Verificar estado de la base de datos
    setTimeout(() => {
        verificarBaseDatosClientes();
    }, 100);
}

function crearProductosDemo() {
    const productosDemo = [
        {
            id: 1,
            nombre: 'Hamburguesa Clásica',
            precio: 15000,
            categoria: 'Comidas',
            stock: 50,
            codigo: 'HAM001',
            descripcion: 'Hamburguesa con carne, lechuga, tomate y queso'
        },
        {
            id: 2,
            nombre: 'Pizza Margarita',
            precio: 25000,
            categoria: 'Comidas',
            stock: 30,
            codigo: 'PIZ001',
            descripcion: 'Pizza con salsa de tomate, mozzarella y albahaca'
        },
        {
            id: 3,
            nombre: 'Coca Cola',
            precio: 3000,
            categoria: 'Bebidas',
            stock: 100,
            codigo: 'BEB001',
            descripcion: 'Bebida gaseosa 350ml'
        },
        {
            id: 4,
            nombre: 'Papas Fritas',
            precio: 8000,
            categoria: 'Acompañamientos',
            stock: 75,
            codigo: 'ACP001',
            descripcion: 'Papas fritas crujientes'
        },
        {
            id: 5,
            nombre: 'Ensalada César',
            precio: 12000,
            categoria: 'Ensaladas',
            stock: 25,
            codigo: 'ENS001',
            descripcion: 'Ensalada con lechuga, pollo, crutones y aderezo césar'
        }
    ];
    
    setStoredData('productos', productosDemo);
}

function crearCategoriasDemo() {
    const categoriasDemo = [
        { id: 1, nombre: 'Comidas', color: '#ef4444' },
        { id: 2, nombre: 'Bebidas', color: '#3b82f6' },
        { id: 3, nombre: 'Acompañamientos', color: '#f59e0b' },
        { id: 4, nombre: 'Ensaladas', color: '#10b981' },
        { id: 5, nombre: 'Postres', color: '#8b5cf6' }
    ];
    
    setStoredData('categorias', categoriasDemo);
}

function crearClientesDemo() {
    const clientesDemo = [
        {
            id: 1,
            nombre: 'María González Pérez',
            telefono: '+57 300 123 4567',
            whatsapp: '+57 300 123 4567',
            email: 'maria.gonzalez@email.com',
            direccion: 'Carrera 80 #45-23, Apto 501, Laureles',
            ciudad: 'Medellín',
            documento: '43123456',
            tipo: 'vip',
            descuento: 10,
            activo: true,
            fecha_registro: '2024-01-15T10:30:00Z',
            total_pedidos: 45,
            total_gastado: 850000,
            requiere_domicilio: true,
            notas: 'Cliente frecuente, prefiere pizza sin cebolla'
        },
        {
            id: 2,
            nombre: 'Carlos Rodríguez Martín',
            telefono: '+57 301 987 6543',
            whatsapp: '+57 301 987 6543',
            email: 'carlos.rodriguez@email.com',
            direccion: 'Calle 70 #11-42, Barrio Chapinero',
            ciudad: 'Bogotá',
            documento: '52987654',
            tipo: 'regular',
            descuento: 0,
            activo: true,
            fecha_registro: '2024-02-20T14:15:00Z',
            total_pedidos: 23,
            total_gastado: 456000,
            requiere_domicilio: false,
            notas: 'Siempre pide para recoger en tienda'
        },
        {
            id: 3,
            nombre: 'Ana Sofía Vargas',
            telefono: '+57 312 456 7890',
            whatsapp: '+57 312 456 7890',
            email: 'ana.vargas@email.com',
            direccion: 'Avenida 68 #25-15, Normandía',
            ciudad: 'Medellín',
            documento: '39456789',
            tipo: 'nuevo',
            descuento: 0,
            activo: true,
            fecha_registro: '2024-07-01T09:30:00Z',
            total_pedidos: 3,
            total_gastado: 67000,
            requiere_domicilio: true,
            notas: 'Cliente nueva, le gustan las ensaladas'
        },
        {
            id: 4,
            nombre: 'Luis Fernando Castro',
            telefono: '+57 315 789 0123',
            whatsapp: '+57 315 789 0123',
            email: 'luis.castro@email.com',
            direccion: 'Carrera 15 #85-30, Zona Rosa',
            ciudad: 'Bogotá',
            documento: '71789012',
            tipo: 'frecuente',
            descuento: 5,
            activo: true,
            fecha_registro: '2024-03-10T16:45:00Z',
            total_pedidos: 18,
            total_gastado: 320000,
            requiere_domicilio: false,
            notas: 'Ejecutivo, siempre ordena al mediodía'
        },
        {
            id: 5,
            nombre: 'Patricia Morales Díaz',
            telefono: '+57 320 654 3210',
            whatsapp: '+57 320 654 3210',
            email: 'patricia.morales@email.com',
            direccion: 'Calle 45 #23-67, El Poblado',
            ciudad: 'Medellín',
            documento: '28654321',
            tipo: 'vip',
            descuento: 15,
            activo: true,
            fecha_registro: '2023-11-05T11:20:00Z',
            total_pedidos: 67,
            total_gastado: 1200000,
            requiere_domicilio: true,
            notas: 'Cliente VIP desde hace 2 años, excelente pagadora'
        }
    ];
    
    setStoredData('clientes', clientesDemo);
}

// ============================
// CONFIGURACIÓN DE EVENTOS
// ============================
function setupEventListeners() {
    // Formulario de finalizar venta
    const formFinalizarVenta = document.getElementById('form-finalizar-venta');
    if (formFinalizarVenta) {
        formFinalizarVenta.addEventListener('submit', procesarVenta);
    }
    
    // Método de pago
    const metodoPago = document.getElementById('metodo-pago');
    if (metodoPago) {
        metodoPago.addEventListener('change', onMetodoPagoChange);
    }
    
    // Búsqueda de productos (debounce)
    const searchInput = document.getElementById('search-productos');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => buscarProductos(e.target.value), 300);
        });
    }
    
    // Formulario de nuevo cliente
    const formNuevoCliente = document.getElementById('form-nuevo-cliente');
    if (formNuevoCliente && !formNuevoCliente.hasAttribute('data-listener-attached')) {
        // Marcar que ya tiene listener para evitar duplicados
        formNuevoCliente.setAttribute('data-listener-attached', 'true');
        
        formNuevoCliente.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Prevenir múltiples envíos simultáneos
            if (formNuevoCliente.hasAttribute('data-submitting')) {
                console.log('⚠️ Formulario ya está siendo procesado, ignorando envío duplicado');
                return;
            }
            
            // Marcar como enviando
            formNuevoCliente.setAttribute('data-submitting', 'true');
            
            // Crear FormData del formulario
            const formData = new FormData(formNuevoCliente);
            
            // Debug: Mostrar todos los datos del formulario
            console.log('📝 Datos del formulario modal:');
            for (let [key, value] of formData.entries()) {
                console.log(`  ${key}: ${value}`);
            }
            
            // Llamar función de guardado
            guardarNuevoCliente(formData).finally(() => {
                // Quitar marca de enviando después del procesamiento
                formNuevoCliente.removeAttribute('data-submitting');
            });
        });
    }
    
    // Búsqueda de cliente en carrito (debounce)
    const searchClienteInput = document.getElementById('search-cliente');
    if (searchClienteInput) {
        let searchTimeout;
        searchClienteInput.addEventListener('input', function(e) {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => buscarClienteCarrito(e.target.value), 300);
        });
        
        // Limpiar resultados al perder el foco después de un tiempo
        searchClienteInput.addEventListener('blur', function() {
            setTimeout(() => {
                const resultsContainer = document.getElementById('search-cliente-results');
                if (resultsContainer && !resultsContainer.matches(':hover')) {
                    resultsContainer.classList.add('hidden');
                }
            }, 200);
        });
    }
    
    // Configurar validación de formulario de cliente
    setupClienteFormValidation();
}

// ============================
// GESTIÓN DE PRODUCTOS
// ============================
function cargarProductos() {
    cargarProductosDesdeManager();
    renderizarProductos();
}

function cargarCategorias() {
    categorias = window.CategoriasManager ? window.CategoriasManager.getAll() : (getStoredData('categorias') || []);
    renderizarCategorias();
}

function renderizarProductos(productosFiltrados = productos) {
    const productosGrid = document.getElementById('productos-grid');
    if (!productosGrid) return;
    
    if (productosFiltrados.length === 0) {
        productosGrid.innerHTML = `
            <div class="no-productos">
                <i class="fas fa-box-open"></i>
                <p>No se encontraron productos</p>
            </div>
        `;
        return;
    }
    
    productosGrid.innerHTML = productosFiltrados.map(producto => `
        <div class="producto-card" onclick="agregarAlCarrito(${producto.id})">
            <div class="producto-imagen">
                <i class="fas fa-utensils"></i>
            </div>
            <h4 class="producto-nombre">${producto.nombre}</h4>
            <p class="producto-codigo">Código: <b>${producto.codigo || '-'}</b></p>
            <p class="producto-precio">${formatCurrency(producto.precio)}</p>
            <p class="producto-stock ${producto.stock <= 5 ? 'stock-bajo' : ''} ${producto.stock === 0 ? 'stock-agotado' : ''}">
                Stock: ${producto.stock}
            </p>
            <button class="btn-agregar" ${producto.stock === 0 ? 'disabled' : ''}>
                ${producto.stock === 0 ? 'Agotado' : 'Agregar'}
            </button>
        </div>
    `).join('');
}

function renderizarCategorias() {
    const categoriasContainer = document.getElementById('categorias-container');
    if (!categoriasContainer) return;
    
    const categoriasHTML = categorias.map(categoria => `
        <button class="categoria-btn" data-categoria="${categoria.nombre}" onclick="filtrarCategoria('${categoria.nombre}')">
            ${categoria.nombre}
        </button>
    `).join('');
    
    categoriasContainer.innerHTML = `
        <button class="categoria-btn active" data-categoria="todas" onclick="filtrarCategoria('todas')">
            Todas
        </button>
        ${categoriasHTML}
    `;
}

function buscarProductos(termino) {
    if (!termino.trim()) {
        renderizarProductos();
        return;
    }
    const t = termino.toLowerCase();
    const productosFiltrados = productos.filter(producto =>
        (producto.nombre && producto.nombre.toLowerCase().includes(t)) ||
        (producto.codigo && producto.codigo.toLowerCase().includes(t)) ||
        (producto.descripcion && producto.descripcion.toLowerCase().includes(t))
    );
    renderizarProductos(productosFiltrados);
}

function filtrarCategoria(categoria) {
    // Actualizar botones activos
    document.querySelectorAll('.categoria-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // Filtrar productos
    if (categoria === 'todas') {
        renderizarProductos();
    } else {
        const productosFiltrados = productos.filter(producto => 
            producto.categoria === categoria
        );
        renderizarProductos(productosFiltrados);
    }
}

// ============================
// GESTIÓN DEL CARRITO
// ============================
function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    if (!producto || producto.stock === 0) {
        showNotification('Producto no disponible', 'warning');
        return;
    }
    // Verificar si el producto ya está en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    if (itemExistente) {
        if (itemExistente.cantidad >= producto.stock) {
            showNotification('Stock insuficiente', 'warning');
            return;
        }
        itemExistente.cantidad++;
    } else {
    carrito.push({
        id: producto.id,
        codigo: producto.codigo,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        stock: producto.stock,
        insumos: producto.insumos || [] // Para cálculo de costos
    });
    }
    actualizarCarritoUI();
    showNotification(`${producto.nombre} agregado al carrito`, 'success', 1500);
}

function modificarCantidad(productoId, operacion) {
    const item = carrito.find(item => item.id === productoId);
    if (!item) return;
    
    if (operacion === 'aumentar') {
        if (item.cantidad >= item.stock) {
            showNotification('Stock insuficiente', 'warning');
            return;
        }
        item.cantidad++;
    } else if (operacion === 'disminuir') {
        item.cantidad--;
        if (item.cantidad <= 0) {
            eliminarDelCarrito(productoId);
            return;
        }
    }
    
    actualizarCarritoUI();
}

function eliminarDelCarrito(productoId) {
    carrito = carrito.filter(item => item.id !== productoId);
    actualizarCarritoUI();
}

function limpiarCarrito() {
    if (carrito.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres limpiar el carrito?')) {
        carrito = [];
        
        // Limpiar también el cliente seleccionado
        if (clienteSeleccionado) {
            if (confirm('¿También quieres quitar el cliente de la venta?')) {
                quitarClienteCompleto();
            }
        }
        
        actualizarCarritoUI();
        showNotification('Carrito limpiado', 'info');
    }
}

function actualizarCarritoUI() {
    const carritoItems = document.getElementById('carrito-items');
    const btnFinalizar = document.getElementById('btn-finalizar');
    
    if (!carritoItems) return;
    

    if (carrito.length === 0) {
        carritoItems.innerHTML = `
            <div class="carrito-vacio">
                <i class="fas fa-shopping-cart"></i>
                <p>Agrega productos para comenzar la venta</p>
            </div>
        `;
        if (btnFinalizar) btnFinalizar.disabled = true;
    } else {
        carritoItems.innerHTML = carrito.map(item => {
            // Calcular costo de producción y margen para cada producto
            const costo = calcularCostoProduccion(item.insumos);
            const { ganancia, margen } = calcularMargenGanancia(item.precio, costo);
            return `
            <div class="carrito-item">
                <div class="item-info">
                    <div class="item-nombre">${item.nombre}</div>
                    <div class="item-precio">${formatCurrency(item.precio)}</div>
                    <div class="item-costo" style="font-size:12px;color:#888;">Costo: ${formatCurrency(costo)}</div>
                    <div class="item-ganancia" style="font-size:12px;color:#10b981;">Ganancia: ${formatCurrency(ganancia)} (${margen}% margen)</div>
                </div>
                <div class="item-cantidad">
                    <button class="cantidad-btn" onclick="modificarCantidad(${item.id}, 'disminuir')">-</button>
                    <span class="cantidad-numero">${item.cantidad}</span>
                    <button class="cantidad-btn" onclick="modificarCantidad(${item.id}, 'aumentar')">+</button>
                </div>
                <button class="btn-eliminar" onclick="eliminarDelCarrito(${item.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            `;
        }).join('');
        if (btnFinalizar) btnFinalizar.disabled = false;
    }
    
    actualizarResumen();
}

function actualizarResumen() {
    try {
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        
        // Verificar si hay cliente seleccionado con descuento
        let descuentoCliente = 0;
        let montoDescuento = 0;
        
        if (clienteSeleccionado && clienteSeleccionado.descuento) {
            descuentoCliente = clienteSeleccionado.descuento;
            montoDescuento = subtotal * (descuentoCliente / 100);
        }
        
        const subtotalConDescuento = subtotal - montoDescuento;
        const impuestos = subtotalConDescuento * 0.19; // 19% IVA
        const total = subtotalConDescuento + impuestos;
        
        // Actualizar elementos en la UI
        const subtotalElement = document.getElementById('subtotal-amount');
        const taxElement = document.getElementById('tax-amount');
        const totalElement = document.getElementById('total-amount');
        
        if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
        if (taxElement) taxElement.textContent = formatCurrency(impuestos);
        if (totalElement) totalElement.textContent = formatCurrency(total);
        
        // Mostrar/actualizar descuento si aplica
        if (montoDescuento > 0) {
            mostrarInfoDescuento(clienteSeleccionado);
            const descuentoElement = document.getElementById('descuento-amount');
            if (descuentoElement) {
                descuentoElement.textContent = `-${formatCurrency(montoDescuento)}`;
                descuentoElement.style.color = '#10b981';
            }
        } else {
            // Remover elemento de descuento si no aplica
            const descuentoElement = document.getElementById('descuento-cliente');
            if (descuentoElement) {
                descuentoElement.remove();
            }
        }
        
        // Guardar totales para uso en finalizar venta
        window.totalesVenta = {
            subtotal,
            descuento: montoDescuento,
            subtotalConDescuento,
            impuestos,
            total,
            clienteId: clienteSeleccionado ? clienteSeleccionado.id : null
        };
        
        // Actualizar validación del botón de finalizar venta
        if (typeof actualizarValidacionFinalizarVenta === 'function') {
            actualizarValidacionFinalizarVenta();
        }
        
    } catch (error) {
        console.error('Error actualizando resumen:', error);
        // Fallback: cálculo básico sin descuentos
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        const impuestos = subtotal * 0.19;
        const total = subtotal + impuestos;
        
        const subtotalElement = document.getElementById('subtotal-amount');
        const taxElement = document.getElementById('tax-amount');
        const totalElement = document.getElementById('total-amount');
        
        if (subtotalElement) subtotalElement.textContent = formatCurrency(subtotal);
        if (taxElement) taxElement.textContent = formatCurrency(impuestos);
        if (totalElement) totalElement.textContent = formatCurrency(total);
    }
}

// ============================
// FINALIZAR VENTA
// ============================
function finalizarVenta() {
    if (carrito.length === 0) {
        showNotification('Agrega productos al carrito', 'warning');
        return;
    }
    
    // Validar dirección si el cliente tiene múltiples direcciones
    if (clienteSeleccionado) {
        // Usar función de validación específica
        if (!validarDireccionEntrega()) {
            return; // La función ya muestra el error
        }
        
        console.log('✅ Validación de dirección aprobada:', direccionEntregaSeleccionada);
    }
    
    // Usar totales calculados con descuentos si están disponibles
    const totalesCalculados = window.totalesVenta;
    
    let subtotal, impuestos, total, descuento = 0;
    
    if (totalesCalculados) {
        // Usar totales con descuentos ya calculados
        subtotal = totalesCalculados.subtotal;
        descuento = totalesCalculados.descuento;
        impuestos = totalesCalculados.impuestos;
        total = totalesCalculados.total;
    } else {
        // Cálculo básico sin descuentos
        subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        impuestos = subtotal * 0.19;
        total = subtotal + impuestos;
    }
    
    // Debug: verificar cliente antes de crear ventaActual
    console.log('🔍 DEBUG finalizarVenta:');
    console.log('- clienteSeleccionado:', clienteSeleccionado);
    console.log('- direccionEntregaSeleccionada:', direccionEntregaSeleccionada);
    
    // Crear objeto de venta con información completa del cliente
    ventaActual = {
        items: [...carrito],
        subtotal: subtotal,
        descuento: descuento,
        impuestos: impuestos,
        total: total,
        clienteId: clienteSeleccionado ? clienteSeleccionado.id : null,
        clienteInfo: clienteSeleccionado ? {
            nombre: clienteSeleccionado.nombre,
            telefono: clienteSeleccionado.telefono || clienteSeleccionado.whatsapp,
            documento: clienteSeleccionado.documento,
            direccionEntrega: direccionEntregaSeleccionada,
            tipo: clienteSeleccionado.tipo,
            descuentoAplicado: clienteSeleccionado.descuento || 0
        } : null,
        direccionEntrega: direccionEntregaSeleccionada,
        fecha: new Date().toISOString()
    };
    
    console.log('✅ VentaActual creada:', {
        clienteId: ventaActual.clienteId,
        clienteInfo: ventaActual.clienteInfo,
        direccionEntrega: ventaActual.direccionEntrega
    });
    
    // Mostrar resumen en el modal
    mostrarResumenVenta();
    
    // Abrir modal
    showModal('modal-finalizar-venta');
}

function mostrarResumenVenta() {
    const resumenContainer = document.getElementById('resumen-venta');
    if (!resumenContainer || !ventaActual) return;
    
    // Construir HTML del resumen con información del cliente y descuentos
    let clienteHTML = '';
    
    // Validar y corregir información del cliente antes de mostrar
    validarYCorregirClienteEnVenta();
    
    if (ventaActual.clienteInfo) {
        let direccionHTML = '';
        if (ventaActual.direccionEntrega) {
            direccionHTML = `
                <div class="direccion-entrega-info">
                    <i class="fas fa-map-marker-alt"></i>
                    <strong>Dirección de entrega:</strong> ${ventaActual.direccionEntrega}
                </div>
            `;
        }
        
        clienteHTML = `
            <div class="cliente-info-resumen">
                <h4><i class="fas fa-user"></i> Cliente: ${ventaActual.clienteInfo.nombre}</h4>
                ${ventaActual.clienteInfo.telefono ? `<p><i class="fas fa-phone"></i> ${ventaActual.clienteInfo.telefono}</p>` : ''}
                ${direccionHTML}
                ${ventaActual.clienteInfo.tipo === 'vip' ? '<span class="badge-vip"><i class="fas fa-crown"></i> VIP</span>' : ''}
                ${ventaActual.clienteInfo.descuentoAplicado > 0 ? `<span class="descuento-info">Descuento ${ventaActual.clienteInfo.descuentoAplicado}% aplicado</span>` : ''}
            </div>
        `;
    }
    
    resumenContainer.innerHTML = `
        ${clienteHTML}
        <div class="factura-items">
            ${ventaActual.items.map(item => {
                const costo = calcularCostoProduccion(item.insumos);
                const { ganancia, margen } = calcularMargenGanancia(item.precio, costo);
                return `
                <div class="factura-item">
                    <div class="item-detalle">
                        <div class="item-nombre-factura">${item.nombre} <span style='color:#888;font-size:12px;'>(Código: ${item.codigo || '-'})</span></div>
                        <div class="item-cantidad-precio">${item.cantidad} x ${formatCurrency(item.precio)}</div>
                        <div class="item-costo" style="font-size:12px;color:#888;">Costo: ${formatCurrency(costo)}</div>
                        <div class="item-ganancia" style="font-size:12px;color:#10b981;">Ganancia: ${formatCurrency(ganancia)} (${margen}% margen)</div>
                    </div>
                    <div class="item-total">${formatCurrency(item.precio * item.cantidad)}</div>
                </div>
                `;
            }).join('')}
        </div>
        <div class="factura-total">
            <div class="total-linea">
                <span>Subtotal:</span>
                <span>${formatCurrency(ventaActual.subtotal)}</span>
            </div>
            ${ventaActual.descuento > 0 ? `
                <div class="total-linea descuento">
                    <span>Descuento (${ventaActual.clienteInfo?.descuentoAplicado || 0}%):</span>
                    <span style="color: #10b981;">-${formatCurrency(ventaActual.descuento)}</span>
                </div>
            ` : ''}
            <div class="total-linea">
                <span>IVA (19%):</span>
                <span>${formatCurrency(ventaActual.impuestos)}</span>
            </div>
            <div class="total-linea total-final">
                <span>Total:</span>
                <span>${formatCurrency(ventaActual.total)}</span>
            </div>
        </div>
    `;
}

function onMetodoPagoChange() {
    const metodoPago = document.getElementById('metodo-pago').value;
    const montoRecibidoGroup = document.getElementById('monto-recibido-group');
    
    if (metodoPago === 'efectivo') {
        montoRecibidoGroup.style.display = 'block';
        document.getElementById('monto-recibido').required = true;
    } else {
        montoRecibidoGroup.style.display = 'none';
        document.getElementById('monto-recibido').required = false;
        document.getElementById('cambio-info').style.display = 'none';
    }
}

function calcularCambio() {
    const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
    const cambioInfo = document.getElementById('cambio-info');
    const cambioAmount = document.getElementById('cambio-amount');
    
    if (montoRecibido > 0 && ventaActual) {
        const cambio = montoRecibido - ventaActual.total;
        cambioAmount.textContent = formatCurrency(cambio);
        cambioInfo.style.display = 'block';
        
        if (cambio < 0) {
            cambioInfo.style.color = '#ef4444';
        } else {
            cambioInfo.style.color = '#10b981';
        }
    } else {
        cambioInfo.style.display = 'none';
    }
}

async function procesarVenta(e) {
    e.preventDefault();
    
    if (!ventaActual) {
        showNotification('Error en los datos de venta', 'error');
        return;
    }
    
    const metodoPago = document.getElementById('metodo-pago').value;
    const montoRecibido = parseFloat(document.getElementById('monto-recibido').value) || 0;
    
    // Usar cliente seleccionado del carrito si existe
    const clienteId = clienteSeleccionado ? clienteSeleccionado.id : null;
    
    // Validaciones
    if (!metodoPago) {
        showNotification('Selecciona un método de pago', 'warning');
        return;
    }
    
    if (metodoPago === 'efectivo' && montoRecibido < ventaActual.total) {
        showNotification('El monto recibido es insuficiente', 'warning');
        return;
    }
    
    showLoading('Procesando venta...');
    
    try {
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Crear venta completa
        const venta = {
            id: generateId(),
            ...ventaActual,
            metodoPago: metodoPago,
            clienteId: clienteId || null,
            montoRecibido: metodoPago === 'efectivo' ? montoRecibido : ventaActual.total,
            cambio: metodoPago === 'efectivo' ? montoRecibido - ventaActual.total : 0,
            usuario: getCurrentUser().username,
            fechaProcesamiento: new Date().toISOString()
        };
        
        // Guardar venta
        const ventas = getStoredData('ventas') || [];
        ventas.push(venta);
        setStoredData('ventas', ventas);
        
        // Actualizar stock de productos
        actualizarStockProductos();
        
        // Limpiar carrito y cliente completamente
        carrito = [];
        ventaActual = null;
        
        // Limpiar cliente y datos asociados
        if (clienteSeleccionado) {
            quitarClienteCompleto();
        }
        
        // Limpiar datos de sesión
        limpiarClienteVentaActual();
        
        hideLoading();
        
        // Mostrar resultado exitoso
        const mensajeExito = clienteId ? 
            `¡Venta procesada exitosamente para ${ventaActual.clienteInfo?.nombre || 'cliente'}!` : 
            '¡Venta procesada exitosamente!';
        showNotification(mensajeExito, 'success');
        
        // Cerrar modal y actualizar UI
        closeModal('modal-finalizar-venta');
        actualizarCarritoUI();
        cargarProductos(); // Recargar para actualizar stock
        
        // Limpiar formulario
        document.getElementById('form-finalizar-venta').reset();
        document.getElementById('monto-recibido-group').style.display = 'none';
        document.getElementById('cambio-info').style.display = 'none';
        
        // Preguntar si quiere imprimir factura
        if (confirm('¿Deseas generar la factura de esta venta?')) {
            generarFactura(venta);
        }
        
    } catch (error) {
        hideLoading();
        showNotification('Error al procesar la venta', 'error');
        console.error('Error procesando venta:', error);
    }
}

function actualizarStockProductos() {
    // Actualizar stock en ProductosManager y en memoria
    carrito.forEach(item => {
        if (window.ProductosManager && window.ProductosManager.updateStock) {
            window.ProductosManager.updateStock(item.id, (item.stock - item.cantidad));
        }
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock -= item.cantidad;
            // Si el producto tiene insumos, descontar insumos
            if (Array.isArray(producto.insumos)) {
                producto.insumos.forEach(insumo => {
                    // Buscar insumo en inventario
                    const insumoProd = productos.find(p => p.id === insumo.id);
                    if (insumoProd) {
                        // Descontar la cantidad total utilizada (cantidad vendida * cantidad por unidad)
                        const cantidadDescontar = item.cantidad * (parseFloat(insumo.cantidad) || 0);
                        insumoProd.stock = (insumoProd.stock || 0) - cantidadDescontar;
                        if (window.ProductosManager && window.ProductosManager.updateStock) {
                            window.ProductosManager.updateStock(insumoProd.id, insumoProd.stock);
                        }
                    }
                });
            }
        }
    });
    setStoredData('productos', productos);
}

// ============================
// GENERACIÓN DE FACTURAS
// ============================
function generarFactura(venta) {
    try {
        showLoading('Generando factura...');
        
        // Simular generación de factura
        setTimeout(() => {
            hideLoading();
            
            // Crear contenido de la factura
            const facturaContent = crearContenidoFactura(venta);
            
            // Abrir ventana de impresión
            const printWindow = window.open('', '_blank');
            printWindow.document.write(facturaContent);
            printWindow.document.close();
            
            // Esperar un momento y luego imprimir
            setTimeout(() => {
                printWindow.print();
                printWindow.close();
            }, 500);
            
            showNotification('Factura generada exitosamente', 'success');
        }, 1000);
        
    } catch (error) {
        hideLoading();
        showNotification('Error al generar la factura', 'error');
        console.error('Error generando factura:', error);
    }
}

function crearContenidoFactura(venta) {
    const cliente = venta.clienteId ? 
        getStoredData('clientes')?.find(c => c.id == venta.clienteId) : null;
    
    const fechaVenta = new Date(venta.fechaProcesamiento).toLocaleString('es-CO');
    
    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Factura FODEXA - ${venta.id}</title>
            <style>
                body { 
                    font-family: 'Arial', sans-serif; 
                    margin: 20px; 
                    color: #333; 
                    line-height: 1.4;
                }
                .header { 
                    text-align: center; 
                    border-bottom: 2px solid #667eea; 
                    padding-bottom: 20px; 
                    margin-bottom: 30px; 
                }
                .logo { 
                    color: #667eea; 
                    font-size: 28px; 
                    font-weight: bold; 
                    margin: 0; 
                }
                .info-section { 
                    display: flex; 
                    justify-content: space-between; 
                    margin-bottom: 30px; 
                }
                .info-box { 
                    background: #f8f9ff; 
                    padding: 15px; 
                    border-radius: 8px; 
                    width: 45%; 
                }
                .info-title { 
                    font-weight: bold; 
                    color: #667eea; 
                    margin-bottom: 10px; 
                }
                .items-table { 
                    width: 100%; 
                    border-collapse: collapse; 
                    margin-bottom: 30px; 
                }
                .items-table th, .items-table td { 
    try {
        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 1500));
        // Crear venta completa
        const venta = {
            id: generateId(),
            ...ventaActual,
            metodoPago: metodoPago,
            clienteId: clienteId || null,
            montoRecibido: metodoPago === 'efectivo' ? montoRecibido : ventaActual.total,
            cambio: metodoPago === 'efectivo' ? montoRecibido - ventaActual.total : 0,
            usuario: getCurrentUser().username,
            fechaProcesamiento: new Date().toISOString(),
            productosVendidos: carrito.map(item => ({
                id: item.id,
                codigo: item.codigo,
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: item.precio,
                clienteId: clienteId || null,
                fechaHora: new Date().toISOString()
            }))
        };
        // Guardar venta
        const ventas = getStoredData('ventas') || [];
        ventas.push(venta);
        setStoredData('ventas', ventas);
        // Guardar historial de productos vendidos (opcional: en un archivo/historial separado)
        let historial = getStoredData('productos_vendidos') || [];
        historial = historial.concat(venta.productosVendidos);
        setStoredData('productos_vendidos', historial);
        // Actualizar stock de productos
        actualizarStockProductos();
        // Limpiar carrito y cliente completamente
        carrito = [];
        ventaActual = null;
        // Limpiar cliente y datos asociados
        if (clienteSeleccionado) {
            quitarClienteCompleto();
        }
        // Limpiar datos de sesión
        limpiarClienteVentaActual();
        hideLoading();
        // Mostrar resultado exitoso
        var mensajeExito = '¡Venta procesada exitosamente!';
        if (clienteId) {
            var nombreCliente = (venta.clienteInfo && venta.clienteInfo.nombre) ? venta.clienteInfo.nombre : 'cliente';
            mensajeExito = '¡Venta procesada exitosamente para ' + nombreCliente + '!';
        }
        showNotification(mensajeExito, 'success');
        // Cerrar modal y actualizar UI
        closeModal('modal-finalizar-venta');
        actualizarCarritoUI();
        cargarProductos(); // Recargar para actualizar stock
        // Limpiar formulario
        document.getElementById('form-finalizar-venta').reset();
        document.getElementById('monto-recibido-group').style.display = 'none';
        document.getElementById('cambio-info').style.display = 'none';
        // Preguntar si quiere imprimir factura
        if (confirm('¿Deseas generar la factura de esta venta?')) {
            generarFactura(venta);
        }
    } catch (error) {
        hideLoading();
        showNotification('Error al procesar la venta', 'error');
        console.error('Error procesando venta:', error);
    }
            </div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Producto</th>
                        <th>Código</th>
                        <th>Cantidad</th>
                        <th>Precio Unit.</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${venta.items.map(item => `
                        <tr>
                            <td>${item.nombre}</td>
                            <td>${item.codigo || '-'}</td>
                            <td>${item.cantidad}</td>
                            <td>${formatCurrency(item.precio)}</td>
                            <td>${formatCurrency(item.precio * item.cantidad)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <div class="total-section">
                <div class="total-line">Subtotal: ${formatCurrency(venta.subtotal)}</div>
                <div class="total-line">IVA (19%): ${formatCurrency(venta.impuestos)}</div>
                <div class="total-line total-final">Total: ${formatCurrency(venta.total)}</div>
            </div>
            
            <div class="footer">
                <p>¡Gracias por su compra!</p>
                <p>FODEXA - Sistema de Gestión Gastronómica</p>
            </div>
        </body>
        </html>
    `;
}

// ============================
// PASO 1: BUSCADOR DE CLIENTES FUNCIONAL
// ============================

/**
 * Busca clientes en tiempo real basado en el término de búsqueda
 * Permite búsquedas por nombre, apellido o número de celular
 */
async function buscarClienteCarritoWrapper(termino) {
// Alias global para compatibilidad con eventos y legacy
window.buscarClienteCarrito = buscarClienteCarritoWrapper;
    console.log('🔍 Búsqueda de cliente iniciada:', termino);
    
    // Limpiar resultados si el término está vacío
    if (!termino || termino.trim().length < 2) {
        ocultarResultadosBusquedaCliente();
        return;
    }
    
    try {
        // Obtener clientes desde múltiples fuentes
        const clientes = await obtenerClientesParaBusqueda();
        
        // Filtrar clientes basado en el término de búsqueda
        const clientesFiltrados = filtrarClientesPorTermino(clientes, termino.trim());
        
        // Mostrar resultados
        mostrarResultadosBusquedaCliente(clientesFiltrados, termino);
        
        console.log(`✅ Búsqueda completada: ${clientesFiltrados.length} resultados`);
        
    } catch (error) {
        console.error('❌ Error en búsqueda de clientes:', error);
        mostrarErrorBusquedaCliente();
    }
}

/**
 * Obtiene todos los clientes disponibles para búsqueda
 * Combina datos de localStorage e IndexedDB
 */
async function obtenerClientesParaBusqueda() {
    const clientesFromStorage = getStoredData('clientes') || [];
    
    try {
        // Intentar obtener también de IndexedDB si está disponible
        const clientesFromDB = await obtenerTodosLosClientes();
        
        // Combinar y deduplicar clientes por ID
        const clientesCombinados = combinarClientesSinDuplicados(clientesFromStorage, clientesFromDB);
        
        // ✅ ORDENAR ALFABÉTICAMENTE POR NOMBRE
        const clientesOrdenados = clientesCombinados.sort((a, b) => {
            const nombreA = (a.nombre || '').toLowerCase().trim();
            const nombreB = (b.nombre || '').toLowerCase().trim();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });
        
        console.log(`📊 Clientes disponibles para búsqueda: ${clientesOrdenados.length} (ordenados alfabéticamente)`);
        return clientesOrdenados;
        
    } catch (error) {
        console.warn('⚠️ IndexedDB no disponible, usando localStorage:', error);
        
        // ✅ ORDENAR TAMBIÉN EL FALLBACK
        const clientesOrdenados = clientesFromStorage.sort((a, b) => {
            const nombreA = (a.nombre || '').toLowerCase().trim();
            const nombreB = (b.nombre || '').toLowerCase().trim();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });
        
        return clientesOrdenados;
    }
}

/**
 * Combina clientes de diferentes fuentes eliminando duplicados
 */
function combinarClientesSinDuplicados(clientesStorage, clientesDB) {
    const clientesMap = new Map();
    
    // Agregar clientes de localStorage
    clientesStorage.forEach(cliente => {
        clientesMap.set(cliente.id, cliente);
    });
    
    // Agregar clientes de IndexedDB (sobrescribir si hay duplicados)
    clientesDB.forEach(cliente => {
        clientesMap.set(cliente.id, cliente);
    });
    
    return Array.from(clientesMap.values());
}

/**
 * Filtra clientes basado en el término de búsqueda
 * Busca en: nombre, apellido, teléfono, whatsapp, documento
 */
function filtrarClientesPorTermino(clientes, termino) {
    const terminoLower = termino.toLowerCase();
    
    return clientes.filter(cliente => {
        // Buscar en nombre completo
        const nombreCompleto = `${cliente.nombre || ''}`.toLowerCase();
        if (nombreCompleto.includes(terminoLower)) return true;
        
        // Buscar en teléfono
        const telefono = (cliente.telefono || '').replace(/\D/g, '');
        const whatsapp = (cliente.whatsapp || '').replace(/\D/g, '');
        const terminoNumerico = termino.replace(/\D/g, '');
        
        if (terminoNumerico && (telefono.includes(terminoNumerico) || whatsapp.includes(terminoNumerico))) {
            return true;
        }
        
        // Buscar en documento
        const documento = (cliente.documento || '').toLowerCase();
        if (documento.includes(terminoLower)) return true;
        
        // Buscar en email
        const email = (cliente.email || '').toLowerCase();
        if (email.includes(terminoLower)) return true;
        
        return false;
    }).slice(0, 8); // Limitar a 8 resultados para mejor performance
}

/**
 * Muestra los resultados de búsqueda en el dropdown
 */
function mostrarResultadosBusquedaCliente(clientes, termino) {
    const resultsContainer = document.getElementById('search-cliente-results');
    if (!resultsContainer) return;
    
    // Limpiar resultados anteriores
    resultsContainer.innerHTML = '';
    
    if (clientes.length === 0) {
        mostrarMensajeSinResultados(resultsContainer, termino);
        return;
    }
    
    // Crear elementos de resultado
    clientes.forEach(cliente => {
        const resultItem = crearElementoResultadoCliente(cliente, termino);
        resultsContainer.appendChild(resultItem);
    });
    
    // Mostrar el contenedor de resultados
    resultsContainer.classList.remove('hidden');
    
    console.log(`📋 Mostrando ${clientes.length} resultados`);
}

/**
 * Crea el elemento HTML para un resultado de búsqueda
 */
function crearElementoResultadoCliente(cliente, termino) {
    const item = document.createElement('div');
    item.className = 'cliente-result-item';
    item.setAttribute('data-cliente-id', cliente.id);
    
    // Resaltar término de búsqueda
    const nombreResaltado = resaltarTerminoBusqueda(cliente.nombre || 'Sin nombre', termino);
    const telefonoMostrar = cliente.telefono || cliente.whatsapp || 'Sin teléfono';
    const telefonoResaltado = resaltarTerminoBusqueda(telefonoMostrar, termino);
    
    item.innerHTML = `
        <div class="cliente-result-info">
            <div class="cliente-result-nombre">
                ${nombreResaltado}
                ${cliente.tipo === 'vip' ? '<span class="badge-vip"><i class="fas fa-crown"></i> VIP</span>' : ''}
            </div>
            <div class="cliente-result-detalles">
                <div class="cliente-detalle-linea">
                    <i class="fas fa-phone"></i>
                    <span>${telefonoResaltado}</span>
                </div>
                ${cliente.email ? `
                    <div class="cliente-detalle-linea">
                        <i class="fas fa-envelope"></i>
                        <span>${resaltarTerminoBusqueda(cliente.email, termino)}</span>
                    </div>
                ` : ''}
                ${cliente.direccion ? `
                    <div class="cliente-detalle-linea">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${truncarTexto(cliente.direccion, 30)}</span>
                    </div>
                ` : ''}
            </div>
        </div>
        <button class="cliente-result-action" onclick="seleccionarClienteDesdeBusqueda(${cliente.id})">
            <i class="fas fa-check"></i>
            Seleccionar
        </button>
    `;
    
    // Agregar evento de click al elemento completo
    item.addEventListener('click', (e) => {
        if (!e.target.closest('.cliente-result-action')) {
            seleccionarClienteDesdeBusqueda(cliente.id);
        }
    });
    
    return item;
}

/**
 * Resalta el término de búsqueda en el texto
 */
function resaltarTerminoBusqueda(texto, termino) {
    if (!termino || termino.length < 2) return texto;
    
    const regex = new RegExp(`(${termino})`, 'gi');
    return texto.replace(regex, '<mark class="highlight-search">$1</mark>');
}

/**
 * Trunca texto a una longitud específica
 */
function truncarTexto(texto, maxLength) {
    if (texto.length <= maxLength) return texto;
    return texto.substring(0, maxLength) + '...';
}

/**
 * Muestra mensaje cuando no hay resultados
 */
function mostrarMensajeSinResultados(container, termino) {
    container.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">
                <i class="fas fa-search"></i>
            </div>
            <div class="no-results-content">
                <p class="no-results-title">No se encontraron clientes</p>
                <p class="no-results-description">
                    No hay clientes que coincidan con "<strong>${termino}</strong>"
                </p>
                <button class="btn-crear-cliente-busqueda" onclick="crearClienteDesdeTerminoBusqueda('${termino}')">
                    <i class="fas fa-user-plus"></i>
                    Crear nuevo cliente
                </button>
            </div>
        </div>
    `;
    
    container.classList.remove('hidden');
}

/**
 * Muestra mensaje de error en la búsqueda
 */
function mostrarErrorBusquedaCliente() {
    const resultsContainer = document.getElementById('search-cliente-results');
    if (!resultsContainer) return;
    
    resultsContainer.innerHTML = `
        <div class="error-results">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <div class="error-content">
                <p class="error-title">Error en la búsqueda</p>
                <p class="error-description">
                    No se pudo completar la búsqueda. Intenta nuevamente.
                </p>
                <button class="btn-reintentar-busqueda" onclick="buscarClienteCarritoWrapper(document.getElementById('search-cliente').value)">
                    <i class="fas fa-redo"></i>
                    Reintentar
                </button>
            </div>
        </div>
    `;
    
    resultsContainer.classList.remove('hidden');
}

/**
 * Oculta los resultados de búsqueda
 */
function ocultarResultadosBusquedaCliente() {
    const resultsContainer = document.getElementById('search-cliente-results');
    if (resultsContainer) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
    }
}

/**
 * FUNCIÓN PRINCIPAL: Selecciona un cliente desde los resultados de búsqueda
 * Esta función conecta el Paso 1 con el Paso 2
 */
async function seleccionarClienteDesdeBusqueda(clienteId) {
    console.log(`🎯 Seleccionando cliente ID: ${clienteId}`);
    
    try {
        showLoading('Cargando datos del cliente...');
        
        // Obtener datos completos del cliente
        const cliente = await obtenerClienteCompletoPorId(clienteId);
        
        if (!cliente) {
            hideLoading();
            showNotification('Cliente no encontrado', 'error');
            return;
        }
        
        // Guardar cliente seleccionado globalmente
        clienteSeleccionado = cliente;
        direccionEntregaSeleccionada = null;

        // Limpiar búsqueda y ocultar resultados
        limpiarBusquedaCliente();

        // Ocultar buscador y mostrar bloque de cliente seleccionado
        const selector = document.getElementById('cliente-selector');
        const seleccionado = document.getElementById('cliente-seleccionado');
        if (selector && seleccionado) {
            selector.classList.add('hidden');
            seleccionado.classList.remove('hidden');
            // Actualizar todos los campos minimalistas
            const nombreDisplay = document.getElementById('cliente-nombre-display');
            const docDisplay = document.getElementById('cliente-documento-display');
            const whatsappDisplay = document.getElementById('cliente-whatsapp-display');
            const celularDisplay = document.getElementById('cliente-celular-display');
            const direccionDropdown = document.getElementById('cliente-direccion-dropdown');
            if (nombreDisplay) nombreDisplay.textContent = cliente.nombre || '-';
            if (docDisplay) docDisplay.textContent = cliente.documento || '-';
            if (whatsappDisplay) whatsappDisplay.textContent = cliente.whatsapp || '-';
            if (celularDisplay) celularDisplay.textContent = cliente.celular || '-';
            // Unificar todas las posibles direcciones
            let direcciones = [];
            if (Array.isArray(cliente.direcciones) && cliente.direcciones.length > 0) {
                direcciones = cliente.direcciones.slice();
            }
            if (cliente.direccion && (!direcciones.includes(cliente.direccion))) {
                direcciones.push(cliente.direccion);
            }
            if (cliente.direccionDos && (!direcciones.includes(cliente.direccionDos))) {
                direcciones.push(cliente.direccionDos);
            }
            // Filtrar vacíos y duplicados
            direcciones = direcciones.filter((d, i, arr) => d && d.trim() !== '' && arr.indexOf(d) === i);
            // Crear o actualizar el dropdown de direcciones (solo el selector, sin texto extra)
            if (direccionDropdown) {
                // Mantener el icono existente
                direccionDropdown.innerHTML = direccionDropdown.innerHTML.split('</i>')[0] + '</i>';
                const select = document.createElement('select');
                select.className = 'direccion-select-minimal';
                select.style.marginLeft = '4px';
                select.onchange = function() {
                    // No actualizar ningún texto arriba
                };
                direcciones.forEach(dir => {
                    const option = document.createElement('option');
                    option.value = dir;
                    option.textContent = dir;
                    select.appendChild(option);
                });
                direccionDropdown.appendChild(select);
            }
        }

        // Poblar selector de direcciones
        const selectDireccion = document.getElementById('direccion-entrega-select');
        const preview = document.getElementById('direccion-preview');
        const previewText = document.getElementById('direccion-preview-text');
        let direcciones = [];
        if (cliente.direcciones && Array.isArray(cliente.direcciones) && cliente.direcciones.length > 0) {
            direcciones = cliente.direcciones;
        } else {
            if (cliente.direccion) direcciones.push(cliente.direccion);
            if (cliente.direccionDos) direcciones.push(cliente.direccionDos);
        }
        // Limpiar selector
        if (selectDireccion) {
            selectDireccion.innerHTML = '<option value="">Seleccionar dirección...</option>';
            direcciones.forEach((dir, idx) => {
                if (dir && dir.trim() !== '') {
                    const opt = document.createElement('option');
                    opt.value = idx;
                    opt.textContent = dir;
                    selectDireccion.appendChild(opt);
                }
            });
            selectDireccion.classList.remove('hidden');
            selectDireccion.disabled = false;
            selectDireccion.style.display = '';
        }
        if (preview) preview.style.display = '';
        if (previewText) previewText.textContent = 'Selecciona una dirección para la entrega';

        // Si solo hay una dirección, seleccionarla automáticamente
        if (direcciones.length === 1) {
            seleccionarDireccionEntrega('0');
        } else {
            // Mostrar selector y ocultar preview de dirección elegida
            if (selectDireccion) selectDireccion.style.display = '';
            if (preview) preview.style.display = '';
            document.getElementById('direccion-preview-elegida')?.classList.add('hidden');
        }

        hideLoading();
        showNotification(`Cliente ${cliente.nombre} seleccionado`, 'success');

    } catch (error) {
        hideLoading();
        console.error('❌ Error al seleccionar cliente:', error);
        showNotification('Error al seleccionar cliente', 'error');
    }
}

// Selección de dirección de entrega
window.seleccionarDireccionEntrega = function(idx) {
    const selectDireccion = document.getElementById('direccion-entrega-select');
    const preview = document.getElementById('direccion-preview');
    const previewText = document.getElementById('direccion-preview-text');
    let direcciones = [];
    if (clienteSeleccionado) {
        if (clienteSeleccionado.direcciones && Array.isArray(clienteSeleccionado.direcciones) && clienteSeleccionado.direcciones.length > 0) {
            direcciones = clienteSeleccionado.direcciones;
        } else {
            if (clienteSeleccionado.direccion) direcciones.push(clienteSeleccionado.direccion);
            if (clienteSeleccionado.direccionDos) direcciones.push(clienteSeleccionado.direccionDos);
        }
    }
    if (idx === '' || !direcciones[idx]) {
        direccionEntregaSeleccionada = null;
        if (previewText) previewText.textContent = 'Selecciona una dirección para la entrega';
        return;
    }
    direccionEntregaSeleccionada = direcciones[idx];
    // Ocultar selector y mostrar dirección elegida
    if (selectDireccion) selectDireccion.style.display = 'none';
    if (preview) preview.style.display = 'none';
    let block = document.getElementById('direccion-preview-elegida');
    if (!block) {
        block = document.createElement('div');
        block.id = 'direccion-preview-elegida';
        block.className = 'direccion-preview-elegida';
        selectDireccion.parentNode.appendChild(block);
    }
    block.innerHTML = `
        <i class='fas fa-map-marker-alt'></i>
        <span>${direccionEntregaSeleccionada}</span>
        <button type='button' class='btn-cambiar-direccion' onclick='cambiarDireccionEntrega()'>Cambiar dirección</button>
    `;
    block.classList.remove('hidden');
}

window.cambiarDireccionEntrega = function() {
    // Mostrar selector y ocultar bloque de dirección elegida
    const selectDireccion = document.getElementById('direccion-entrega-select');
    const preview = document.getElementById('direccion-preview');
    const block = document.getElementById('direccion-preview-elegida');
    if (selectDireccion) selectDireccion.style.display = '';
    if (preview) preview.style.display = '';
    if (block) block.classList.add('hidden');
    direccionEntregaSeleccionada = null;
    if (selectDireccion) selectDireccion.value = '';
}

/**
 * Obtiene datos completos de un cliente por ID
 */
async function obtenerClienteCompletoPorId(clienteId) {
    // Buscar en localStorage
    const clientesStorage = getStoredData('clientes') || [];
    let cliente = clientesStorage.find(c => c.id == clienteId);
    
    if (cliente) {
        console.log('📦 Cliente encontrado en localStorage');
        return cliente;
    }
    
    // Buscar en IndexedDB si no se encuentra en localStorage
    try {
        cliente = await obtenerClientePorId(clienteId);
        if (cliente) {
            console.log('🗄️ Cliente encontrado en IndexedDB');
            return cliente;
        }
    } catch (error) {
        console.warn('⚠️ Error accediendo IndexedDB:', error);
    }
    
    console.warn(`⚠️ Cliente con ID ${clienteId} no encontrado`);
    return null;
}

/**
 * Limpia el campo de búsqueda y oculta resultados
 */
function limpiarBusquedaCliente() {
    const searchInput = document.getElementById('search-cliente');
    if (searchInput) {
        searchInput.value = '';
    }
    
    ocultarResultadosBusquedaCliente();
}

/**
 * Crea un nuevo cliente usando el término de búsqueda como base
 */
function crearClienteDesdeTerminoBusqueda(termino) {
    console.log('👤 Creando cliente desde término de búsqueda:', termino);
    
    // Pre-llenar el modal de nuevo cliente con el término de búsqueda
    const nombreField = document.getElementById('nuevo-cliente-nombre');
    const telefonoField = document.getElementById('nuevo-cliente-whatsapp');
    
    // Determinar si el término parece ser un teléfono o un nombre
    const esNumero = /^\d+$/.test(termino.replace(/\D/g, ''));
    
    if (esNumero && termino.replace(/\D/g, '').length >= 7) {
        // Si parece un teléfono, ponerlo en el campo de teléfono
        if (telefonoField) telefonoField.value = termino;
    } else {
        // Si no, ponerlo como nombre
        if (nombreField) nombreField.value = termino;
    }
    
    // Abrir modal de nuevo cliente
    mostrarModalNuevoCliente();
    
    // Limpiar búsqueda
    limpiarBusquedaCliente();
}

/**
 * Event listeners para cerrar búsqueda al hacer click fuera
 */
function configurarEventListenersBusquedaCliente() {
    // Cerrar resultados al hacer click fuera
    document.addEventListener('click', (e) => {
        const searchContainer = document.querySelector('.search-cliente-container');
        const resultsContainer = document.getElementById('search-cliente-results');
        
        if (searchContainer && !searchContainer.contains(e.target)) {
            ocultarResultadosBusquedaCliente();
        }
    });
    
    // Navegación con teclado en resultados
    const searchInput = document.getElementById('search-cliente');
    if (searchInput) {
        searchInput.addEventListener('keydown', manejarTecladoBusquedaCliente);
    }
}

/**
 * Maneja la navegación con teclado en la búsqueda
 */
function manejarTecladoBusquedaCliente(e) {
    const resultsContainer = document.getElementById('search-cliente-results');
    if (!resultsContainer || resultsContainer.classList.contains('hidden')) return;
    
    const items = resultsContainer.querySelectorAll('.cliente-result-item');
    if (items.length === 0) return;
    
    let currentIndex = Array.from(items).findIndex(item => item.classList.contains('keyboard-selected'));
    
    switch (e.key) {
        case 'ArrowDown':
            e.preventDefault();
            currentIndex = (currentIndex + 1) % items.length;
            actualizarSeleccionTeclado(items, currentIndex);
            break;
            
        case 'ArrowUp':
            e.preventDefault();
            currentIndex = currentIndex <= 0 ? items.length - 1 : currentIndex - 1;
            actualizarSeleccionTeclado(items, currentIndex);
            break;
            
        case 'Enter':
            e.preventDefault();
            if (currentIndex >= 0 && items[currentIndex]) {
                const clienteId = items[currentIndex].getAttribute('data-cliente-id');
                seleccionarClienteDesdeBusqueda(parseInt(clienteId));
            }
            break;
            
        case 'Escape':
            ocultarResultadosBusquedaCliente();
            break;
    }
}

/**
 * Actualiza la selección visual para navegación con teclado
 */
function actualizarSeleccionTeclado(items, selectedIndex) {
    items.forEach((item, index) => {
        if (index === selectedIndex) {
            item.classList.add('keyboard-selected');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('keyboard-selected');
        }
    });
}

/**
 * Inicializa los event listeners de búsqueda cuando se carga la página
 */
document.addEventListener('DOMContentLoaded', () => {
    configurarEventListenersBusquedaCliente();
});

// ============================
// FIN PASO 1: BUSCADOR DE CLIENTES FUNCIONAL
// ============================

// ============================
// FUNCIONES AUXILIARES PARA CLIENTES
// ============================
function cerrarBuscadorCliente() {
    const resultsContainer = document.getElementById('search-cliente-results');
    if (resultsContainer) {
        resultsContainer.classList.add('hidden');
        resultsContainer.innerHTML = '';
    }
}

function integrarClienteAVenta(cliente) {
    console.log('🔗 Integrando cliente a la venta:', cliente.nombre);
    // Esta función se puede expandir para manejar descuentos, etc.
}

function aplicarDescuentosCliente(cliente) {
    console.log('💰 Aplicando descuentos de cliente:', cliente.descuento || 0);
    // Esta función se puede expandir para aplicar descuentos específicos
}

function mostrarInfoDescuento(cliente) {
    if (!cliente || !cliente.descuento || cliente.descuento <= 0) return;
    
    // Buscar si ya existe el elemento de descuento
    let descuentoElement = document.getElementById('descuento-cliente');
    
    if (!descuentoElement) {
        // Crear elemento de descuento
        const resumenContainer = document.querySelector('.resumen-carrito');
        if (resumenContainer) {
            const subtotalElement = resumenContainer.querySelector('.resumen-linea');
            if (subtotalElement) {
                descuentoElement = document.createElement('div');
                descuentoElement.className = 'resumen-linea descuento-linea';
                descuentoElement.id = 'descuento-cliente';
                descuentoElement.innerHTML = `
                    <span>Descuento ${cliente.tipo === 'vip' ? 'VIP' : ''} (${cliente.descuento}%):</span>
                    <span id="descuento-amount" style="color: #10b981;">-$0</span>
                `;
                
                // Insertar después del subtotal
                subtotalElement.parentNode.insertBefore(descuentoElement, subtotalElement.nextSibling);
            }
        }
    }
}

// ============================
// VALIDACIONES Y VERIFICACIONES
// ============================
function setupClienteFormValidation() {
    console.log('🔧 Configurando validación del formulario de cliente');
    
    try {
        const form = document.getElementById('form-nuevo-cliente');
        if (!form) {
            console.warn('⚠️ Formulario de cliente no encontrado');
            return;
        }
        
        // Configurar validación en tiempo real para campos requeridos
        const nombreField = document.getElementById('nuevo-cliente-nombre');
        const whatsappField = document.getElementById('nuevo-cliente-whatsapp');
        
        if (nombreField) {
            nombreField.addEventListener('blur', () => {
                validateRequiredField(nombreField, 'El nombre es obligatorio');
            });
            
            nombreField.addEventListener('input', () => {
                clearFieldError(nombreField);
            });
        }
        
        if (whatsappField) {
            whatsappField.addEventListener('blur', () => {
                validateRequiredField(whatsappField, 'El número de WhatsApp es obligatorio');
            });
            
            whatsappField.addEventListener('input', () => {
                clearFieldError(whatsappField);
                // Formatear número de teléfono
                formatPhoneNumber(whatsappField);
            });
        }
        
        // Configurar validación del formulario al enviar
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            
            if (validateClienteForm()) {
                // Crear FormData del formulario
                const formData = new FormData(form);
                
                // Llamar función de guardado
                guardarNuevoCliente(formData);
            }
        });
        
        console.log('✅ Validación del formulario configurada');
        
    } catch (error) {
        console.error('❌ Error al configurar validación:', error);
    }
}

function validateRequiredField(field, errorMessage) {
    const value = field.value.trim();
    if (!value) {
        showFieldError(field, errorMessage);
        return false;
    }
    clearFieldError(field);
    return true;
}

function validateClienteForm() {
    let isValid = true;
    
    const nombreField = document.getElementById('nuevo-cliente-nombre');
    const whatsappField = document.getElementById('nuevo-cliente-whatsapp');
    
    if (!validateRequiredField(nombreField, 'El nombre es obligatorio')) {
        isValid = false;
    }
    
    if (!validateRequiredField(whatsappField, 'El número de WhatsApp es obligatorio')) {
        isValid = false;
    }
    
    return isValid;
}

function showFieldError(field, message) {
    clearFieldError(field);
    
    field.classList.add('error');
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.classList.remove('error');
    
    const errorDiv = field.parentNode.querySelector('.error-message');
    if (errorDiv) {
        errorDiv.remove();
    }
}

function formatPhoneNumber(field) {
    let value = field.value.replace(/\D/g, '');
    
    // Formatear número colombiano
    if (value.length >= 10) {
        value = value.substring(0, 10);
        value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    field.value = value;
}

async function verificarBaseDatosClientes() {
    console.log('🔍 Verificando estado de la base de datos de clientes');
    
    try {
        if (!db) {
            console.warn('⚠️ Base de datos IndexedDB no está inicializada');
            return;
        }
        
        const clientes = await obtenerTodosLosClientes();
        console.log(`📊 Clientes encontrados en IndexedDB: ${clientes.length}`);
        
        if (clientes.length > 0) {
            console.log('👥 Muestra de clientes:', clientes.slice(0, 3).map(c => ({
                id: c.id,
                nombre: c.nombre,
                apellido: c.apellido,
                telefono: c.telefonoWhatsapp
            })));
            
            const searchInput = document.getElementById('search-cliente');
            if (searchInput) {
                searchInput.placeholder = `Buscar cliente... (${clientes.length} registrados)`;
            }
        } else {
            console.log('ℹ️ Base de datos de clientes vacía');
            const searchInput = document.getElementById('search-cliente');
            if (searchInput) {
                searchInput.placeholder = 'Buscar cliente... (No hay clientes registrados)';
            }
        }
        
        return clientes;
        
    } catch (error) {
        console.error('❌ Error al verificar base de datos de clientes:', error);
        return [];
    }
}

async function contarClientesEnIndexedDB() {
    try {
        const clientes = await obtenerTodosLosClientes();
        return clientes.length;
    } catch (error) {
        console.error('❌ Error al contar clientes:', error);
        return 0;
    }
}

// ============================
// FUNCIONES DE INDEXEDDB PARA CLIENTES
// ============================

/**
 * Inicializa IndexedDB para clientes
 */
async function initIndexedDB() {
    console.log('🗄️ Inicializando IndexedDB...');
    
    return new Promise((resolve, reject) => {
        // Verificar soporte para IndexedDB
        if (!window.indexedDB) {
            console.warn('⚠️ IndexedDB no es compatible con este navegador');
            resolve(null);
            return;
        }
        
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = function(event) {
            console.error('❌ Error al abrir IndexedDB:', event.target.error);
            reject(event.target.error);
        };
        
        request.onsuccess = function(event) {
            db = event.target.result;
            console.log('✅ IndexedDB inicializada exitosamente');
            resolve(db);
        };
        
        request.onupgradeneeded = function(event) {
            console.log('🔧 Configurando estructura de IndexedDB...');
            
            db = event.target.result;
            
            // Crear object store para clientes si no existe
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                
                // Crear índices para búsquedas eficientes
                store.createIndex('nombre', 'nombre', { unique: false });
                store.createIndex('telefonoWhatsapp', 'telefonoWhatsapp', { unique: false });
                store.createIndex('documentoIdentidad', 'documentoIdentidad', { unique: false });
                
                console.log('✅ Object store de clientes creado con índices');
            }
        };
    });
}

/**
 * Guarda un cliente en IndexedDB
 */
async function guardarClienteEnDB(clienteData) {
    console.log('💾 Guardando cliente en IndexedDB:', clienteData.nombre);
    
    if (!db) {
        console.warn('⚠️ IndexedDB no está inicializada');
        return null;
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        
        // Crear cliente completo con todos los campos
        const clienteCompleto = {
            nombre: clienteData.nombre || '',
            telefono: clienteData.telefonoWhatsapp || '', // Campo legacy
            whatsapp: clienteData.telefonoWhatsapp || '',
            telefonoWhatsapp: clienteData.telefonoWhatsapp || '',
            telefonoLlamada: clienteData.telefonoLlamada || '',
            documento: clienteData.documentoIdentidad || '', // Campo legacy
            documentoIdentidad: clienteData.documentoIdentidad || '',
            cedula: clienteData.documentoIdentidad || '', // Campo para la interfaz
            email: clienteData.email || '',
            fechaNacimiento: clienteData.fechaNacimiento || '',
            notas: clienteData.notas || '',
            direccion: clienteData.direccion || '', // Dirección completa
            direccionDos: clienteData.direccionDos || '', // Dirección dos
            // Campos adicionales estándar del sistema
            ciudad: 'Medellín', // Default
            tipo: 'nuevo',
            descuento: 0,
            activo: true,
            total_pedidos: 0,
            total_gastado: 0,
            requiere_domicilio: true,
            fecha_registro: new Date().toISOString(),
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
        console.log('📝 Cliente completo a guardar:', clienteCompleto);
        
        const request = store.add(clienteCompleto);
        
        request.onsuccess = function(event) {
            const clienteGuardado = {
                ...clienteCompleto,
                id: event.target.result
            };
            
            console.log('✅ Cliente guardado exitosamente con ID:', clienteGuardado.id);
            resolve(clienteGuardado);
        };
        
        request.onerror = function(event) {
            console.error('❌ Error al guardar cliente en IndexedDB:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene todos los clientes de IndexedDB
 */
async function obtenerTodosLosClientes() {
    if (!db) {
        console.warn('⚠️ IndexedDB no está inicializada');
        return [];
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();
        
        request.onsuccess = function(event) {
            const clientes = event.target.result || [];
            
            // ✅ ORDENAR ALFABÉTICAMENTE POR NOMBRE
            clientes.sort((a, b) => {
                const nombreA = (a.nombre || '').toLowerCase().trim();
                const nombreB = (b.nombre || '').toLowerCase().trim();
                return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
            });
            
            console.log(`📊 Obtenidos ${clientes.length} clientes de IndexedDB (ordenados alfabéticamente)`);
            resolve(clientes);
        };
        
        request.onerror = function(event) {
            console.error('❌ Error al obtener clientes:', event.target.error);
            reject(event.target.error);
        };
    });
}

/**
 * Obtiene un cliente por ID
 */
async function obtenerClientePorId(clienteId) {
    if (!db) {
        console.warn('⚠️ IndexedDB no está inicializada, buscando en localStorage...');
        const clientesLocalStorage = getStoredData('clientes') || [];
        return clientesLocalStorage.find(cliente => cliente.id == clienteId);
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.get(Number(clienteId));
        
        request.onsuccess = function(event) {
            const cliente = event.target.result;
            if (cliente) {
                console.log('✅ Cliente encontrado en IndexedDB:', cliente.nombre);
                resolve(cliente);
            } else {
                // Buscar en localStorage como respaldo
                const clientesLocalStorage = getStoredData('clientes') || [];
                const clienteLS = clientesLocalStorage.find(c => c.id == clienteId);
                resolve(clienteLS || null);
            }
        };
        
        request.onerror = function(event) {
            console.error('❌ Error al obtener cliente por ID:', event.target.error);
            // Buscar en localStorage como respaldo
            const clientesLocalStorage = getStoredData('clientes') || [];
            const clienteLS = clientesLocalStorage.find(c => c.id == clienteId);
            resolve(clienteLS || null);
        };
    });
}

/**
 * Busca clientes en IndexedDB
 */
async function buscarClientesEnDB(termino) {
    if (!db) {
        return [];
    }
    
    return new Promise((resolve, reject) => {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        
        // Obtener todos los clientes y filtrar en memoria
        const request = store.getAll();
        
        request.onsuccess = function(event) {
            const todosLosClientes = event.target.result || [];
            const terminoLower = termino.toLowerCase();
            
            const clientesFiltrados = todosLosClientes.filter(cliente => {
                return (
                    cliente.nombre?.toLowerCase().includes(terminoLower) ||
                    cliente.telefonoWhatsapp?.includes(termino) ||
                    cliente.documentoIdentidad?.includes(termino) ||
                    (cliente.direcciones && cliente.direcciones.some(dir => 
                        dir.toLowerCase().includes(terminoLower)
                    ))
                );
            });
            
            resolve(clientesFiltrados);
        };
        
        request.onerror = function(event) {
            console.error('❌ Error al buscar en IndexedDB:', event.target.error);
            resolve([]);
        };
    });
}

/**
 * Muestra información de la base de datos de clientes
 */
async function mostrarBaseDatosClientes() {
    console.log('📊 Mostrando información de base de datos de clientes');
    
    try {
        let mensaje = '📊 ESTADO DE LA BASE DE DATOS DE CLIENTES\n\n';
        
        // Verificar IndexedDB
        if (db) {
            const clientesDB = await obtenerTodosLosClientes();
            mensaje += `🗄️ IndexedDB: ${clientesDB.length} clientes\n`;
            
            if (clientesDB.length > 0) {
                mensaje += '\n📋 Últimos clientes en IndexedDB:\n';
                clientesDB.slice(-5).forEach((cliente, index) => {
                    const direcciones = cliente.direcciones ? cliente.direcciones.length : 0;
                    mensaje += `${index + 1}. ${cliente.nombre} (${direcciones} direcciones)\n`;
                });
            }
        } else {
            mensaje += '🗄️ IndexedDB: No inicializada\n';
        }
        
        // Verificar localStorage
        const clientesLS = getStoredData('clientes') || [];
        mensaje += `💾 localStorage: ${clientesLS.length} clientes\n`;
        
        if (clientesLS.length > 0) {
            mensaje += '\n📋 Últimos clientes en localStorage:\n';
            clientesLS.slice(-5).forEach((cliente, index) => {
                const direcciones = cliente.direcciones ? cliente.direcciones.length : 
                                  (cliente.direccion ? 1 : 0);
                mensaje += `${index + 1}. ${cliente.nombre} (${direcciones} direcciones)\n`;
            });
        }
        
        mensaje += '\n✅ Consulta completada';
        
        // Mostrar en consola y notificación
        console.log(mensaje);
        alert(mensaje);
        
        showNotification(`Base de datos: ${clientesDB?.length || 0} en IndexedDB, ${clientesLS.length} en localStorage`, 'info');
        
    } catch (error) {
        console.error('❌ Error al mostrar información de base de datos:', error);
        showNotification('Error al consultar base de datos', 'error');
    }
}

// ============================
// FUNCIONES DE MODAL DE DIRECCIONES Y PROCESAMIENTO DE CLIENTES
// ============================

function mostrarModalSeleccionDireccion(cliente) {
    console.log('🏠 Mostrando modal de selección de dirección para:', cliente.nombre);
    
    const modal = document.getElementById('modal-direcciones');
    if (!modal) {
        console.error('❌ Modal de direcciones no encontrado');
        showNotification('Error al mostrar opciones de dirección', 'error');
        return;
    }
    
    // Actualizar contenido del modal
    const direccionesList = document.getElementById('direcciones-list');
    if (direccionesList && cliente.direcciones) {
        direccionesList.innerHTML = cliente.direcciones.map((direccion, index) => `
            <div class="direccion-opcion" onclick="seleccionarDireccionEspecifica(${cliente.id}, ${index})">
                <div class="direccion-texto">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${direccion}</span>
                </div>
                <button class="btn-seleccionar-direccion">
                    <i class="fas fa-check"></i>
                    Seleccionar
                </button>
            </div>
        `).join('');
    }
    
    // Mostrar el modal
    showModal('modal-direcciones');
}

async function seleccionarDireccionEspecifica(clienteId, direccionIndex) {
    console.log('🎯 Seleccionando dirección específica:', direccionIndex, 'para cliente:', clienteId);
    
    try {
        const cliente = await obtenerClientePorId(clienteId);
        if (!cliente || !cliente.direcciones || !cliente.direcciones[direccionIndex]) {
            showNotification('Error al seleccionar dirección', 'error');
            return;
        }
        
        // Agregar información de la dirección seleccionada al cliente
        cliente.direccionSeleccionada = cliente.direcciones[direccionIndex];
        cliente.direccionIndex = direccionIndex;
        
        // Cerrar modal
        closeModal('modal-direcciones');
        
        // Procesar selección del cliente con la dirección específica
        procesarSeleccionCliente(cliente);
        
    } catch (error) {
        console.error('❌ Error al seleccionar dirección específica:', error);
        showNotification('Error al seleccionar dirección', 'error');
    }
}

function procesarSeleccionCliente(cliente) {
    console.log('🔄 Procesando selección de cliente:', cliente.nombre);
    
    try {
        // Establecer cliente seleccionado globalmente
        clienteSeleccionado = cliente;
        window.clienteSeleccionado = cliente;
        
        // Mostrar cliente en la UI
        if (mostrarClienteSeleccionado(cliente)) {
            // Integrar cliente a la venta actual
            integrarClienteAVenta(cliente);
            
            // Actualizar resumen con información del cliente
            if (typeof actualizarResumenConCliente === 'function') {
                actualizarResumenConCliente(cliente);
            }
            
            // Aplicar descuentos si los tiene (para futura implementación)
            if (cliente.descuento) {
                aplicarDescuentosCliente(cliente);
            }
            
            // Cerrar buscador
            cerrarBuscadorCliente();
            
            showNotification(`Cliente ${cliente.nombre} seleccionado exitosamente`, 'success');
            console.log('✅ Cliente procesado exitosamente:', {
                id: cliente.id,
                nombre: cliente.nombre,
                telefono: cliente.telefono || cliente.whatsapp,

               
            });
            
        } else {
            throw new Error('Error al mostrar cliente en la UI');
        }
        
    } catch (error) {
        console.error('❌ Error procesando selección de cliente:', error);
        showNotification('Error al seleccionar cliente', 'error');
        
        // Limpiar selección en caso de error
        clienteSeleccionado = null;
        window.clienteSeleccionado = null;
    }
}

function mostrarClienteSeleccionado(cliente) {
    // Mostrar toda la info relevante de forma compacta y visible
    try {
        const clienteSeleccionadoDiv = document.getElementById('cliente-seleccionado');
        if (!clienteSeleccionadoDiv) return false;
        // Compactar y simplificar la tarjeta
        let direccion = '-';
        if (cliente.direcciones && cliente.direcciones.length > 0) {
            direccion = cliente.direcciones[0];
        } else if (cliente.direccion) {
            direccion = cliente.direccion;
        }
        clienteSeleccionadoDiv.innerHTML = `
            <div class="cliente-card-minimalista compacta-fodexa">
                <div class="avatar-fodexa"><i class="fas fa-user"></i></div>
                <div class="datos-fodexa">
                    <div class="nombre-fodexa">${cliente.nombre || '-'}</div>
                    <div class="info-fodexa">
                        <span>${cliente.documento ? 'Doc: ' + cliente.documento : ''}</span>
                        <span>${cliente.whatsapp ? ' | WhatsApp: ' + cliente.whatsapp : ''}</span>
                        <span>${cliente.celular ? ' | Celular: ' + cliente.celular : ''}</span>
                    </div>
                    <div class="direccion-fodexa">${direccion ? '📍 ' + direccion : ''}</div>
                </div>
                <button class="btn-cambiar-cliente" onclick="cambiarCliente()" title="Cambiar cliente"><i class="fas fa-exchange-alt"></i></button>
            </div>
        `;
        // Ocultar buscador y mostrar tarjeta
        const clienteSelector = document.getElementById('cliente-selector');
        if (clienteSelector) clienteSelector.classList.add('hidden');
        clienteSeleccionadoDiv.classList.remove('hidden');
        // Configurar selector de direcciones
        configurarSelectorDirecciones(cliente);
        return true;
    } catch (error) {
        console.error('❌ Error al mostrar cliente seleccionado:', error);
        return false;
    }
}

function quitarClienteCompleto() {
    console.log('🗑️ Quitando cliente completo');
    
    // Limpiar variables globales
    clienteSeleccionado = null;
    direccionEntregaSeleccionada = null;
    
    // Resetear UI del cliente
    const clienteSelector = document.getElementById('cliente-selector');
    const clienteSeleccionadoDiv = document.getElementById('cliente-seleccionado');
    const searchCliente = document.getElementById('search-cliente');
    
    if (clienteSelector) clienteSelector.classList.remove('hidden');
    if (clienteSeleccionadoDiv) clienteSeleccionadoDiv.classList.add('hidden');
    if (searchCliente) searchCliente.value = '';
    
    // Limpiar dirección de entrega
    limpiarDireccionEntrega();
    
    // Limpiar resultados de búsqueda
    cerrarBuscadorCliente();
    
    // Actualizar resumen
    actualizarResumen();
}

function limpiarClienteVentaActual() {
    console.log('🧹 Limpiando datos de cliente de venta actual');
    
    clienteSeleccionado = null;
    direccionEntregaSeleccionada = null;
    
    // Resetear UI
    const clienteSelector = document.getElementById('cliente-selector');
    const clienteSeleccionadoDiv = document.getElementById('cliente-seleccionado');
    
    if (clienteSelector) clienteSelector.classList.remove('hidden');
    if (clienteSeleccionadoDiv) clienteSeleccionadoDiv.classList.add('hidden');
    
    // Limpiar campos
    const searchCliente = document.getElementById('search-cliente');
    if (searchCliente) searchCliente.value = '';
    
    // Limpiar dirección de entrega
    limpiarDireccionEntrega();
    
    cerrarBuscadorCliente();
}

function inicializarInterfazCliente() {
    console.log('🎨 Inicializando interfaz de cliente');
    
    try {
        // Asegurar que el cliente esté limpio al inicio
        const clienteSelector = document.getElementById('cliente-selector');
        const clienteSeleccionadoDiv = document.getElementById('cliente-seleccionado');
        
        if (clienteSelector) clienteSelector.classList.remove('hidden');
        if (clienteSeleccionadoDiv) clienteSeleccionadoDiv.classList.add('hidden');
        
        // Limpiar cualquier selección previa
        clienteSeleccionado = null;
        
        // Configurar eventos específicos del cliente si no están configurados
        const searchClienteInput = document.getElementById('search-cliente');
        if (searchClienteInput && !searchClienteInput.hasAttribute('data-listeners-set')) {
            searchClienteInput.setAttribute('data-listeners-set', 'true');
            
            let searchTimeout;
            searchClienteInput.addEventListener('input', function(e) {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    if (typeof buscarClienteCarrito === 'function') {
                        buscarClienteCarrito(e.target.value);
                    }
                }, 300);
            });
        }
        
        console.log('✅ Interfaz de cliente inicializada');
        
    } catch (error) {
        console.error('❌ Error al inicializar interfaz de cliente:', error);
    }
}

function mostrarTooltipCliente(event) {
    const tooltip = document.getElementById('cliente-tooltip');
    if (!tooltip || !window.clienteSeleccionado) return;

    // Actualizar contenido del tooltip
    const tooltipNombre = document.getElementById('tooltip-nombre');
    const tooltipTelefono = document.getElementById('tooltip-telefono');
    const tooltipDocumento = document.getElementById('tooltip-documento');
    const tooltipDireccion = document.getElementById('tooltip-direccion');

    const c = window.clienteSeleccionado;
    if (tooltipNombre) tooltipNombre.textContent = c.nombre || '-';
    if (tooltipTelefono) tooltipTelefono.textContent = c.telefono || c.whatsapp || 'N/A';
    if (tooltipDocumento) tooltipDocumento.textContent = c.documento || 'N/A';
    // Mostrar la dirección seleccionada si existe, si no la principal
    let dir = c.direccionSeleccionada || (Array.isArray(c.direcciones) && c.direcciones.length > 0 ? c.direcciones[0] : (c.direccion || 'N/A'));
    if (tooltipDireccion) tooltipDireccion.textContent = dir || 'N/A';

    // Posicionar tooltip
    const rect = event.target.getBoundingClientRect();
    tooltip.style.top = (rect.top + window.scrollY - tooltip.offsetHeight - 10) + 'px';
    tooltip.style.left = (rect.left + window.scrollX + rect.width/2 - tooltip.offsetWidth/2) + 'px';

    // Mostrar tooltip
    tooltip.classList.remove('hidden');
}

function ocultarTooltipCliente() {
    const tooltip = document.getElementById('cliente-tooltip');
    if (tooltip) {
        tooltip.classList.add('hidden');
    }
}

function cerrarFormularioNuevoCliente() {
    // Oculta el modal correctamente
    closeModal('modal-nuevo-cliente');
    // Limpia el formulario principal
    const form = document.getElementById('form-nuevo-cliente');
    if (form) {
        form.reset();
    }
}

/**
 * Limpia el formulario de nuevo cliente (versión global)
 */
function limpiarFormularioNuevoCliente() {
    // Intenta limpiar el formulario principal
    const form = document.getElementById('form-nuevo-cliente');
    if (form) {
        form.reset();
    }
    // También limpia posibles formularios insertados
    const formInsertado = document.getElementById('form-nuevo-cliente-insertado');
    if (formInsertado) {
        formInsertado.reset();
    }
    // Limpia mensajes de error
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    const fieldsWithError = document.querySelectorAll('.error');
    fieldsWithError.forEach(field => field.classList.remove('error'));
}

/**
 * Limpia el formulario de cliente desde el botón limpiar
 */
function limpiarFormularioCliente() {
    console.log('🧹 Limpiando formulario de cliente');
    
    try {
        const form = document.getElementById('form-nuevo-cliente');
        if (form) {
            // Confirmar acción si hay datos
            const formData = new FormData(form);
            let tieneDatos = false;
            
            for (let [key, value] of formData.entries()) {
                if (value && value.trim() !== '') {
                    tieneDatos = true;
                    break;
                }
            }
            
            if (tieneDatos) {
                if (confirm('¿Estás seguro de que deseas limpiar todos los campos?')) {
                    form.reset();
                    // Enfocar en el primer campo
                    const primerCampo = document.getElementById('nuevo-cliente-nombre');
                    if (primerCampo) {
                        primerCampo.focus();
                    }
                    showNotification('Formulario limpiado', 'info');
                }
            } else {
                form.reset();
                const primerCampo = document.getElementById('nuevo-cliente-nombre');
                if (primerCampo) {
                    primerCampo.focus();
                }
            }
        }
    } catch (error) {
        console.error('❌ Error al limpiar formulario:', error);
        showNotification('Error al limpiar formulario', 'error');
    }
}

/**
 * Navega a la base de datos de clientes desde ventas
 */
function navegarBaseDatosClientesDesdeVentas() {
    // Abre la gestión de clientes en una nueva pestaña
    const urlClientes = '../../src/pages/demo-gestion-clientes-integrado.html';
    window.open(urlClientes, '_blank');
}

/**
 * Vuelve al dashboard principal
 */
function volverDashboard() {
    // Confirma si hay una venta en progreso antes de navegar
    if (typeof carrito !== 'undefined' && carrito.length > 0 || typeof clienteSeleccionado !== 'undefined' && clienteSeleccionado) {
        if (!confirm('Hay una venta en progreso. ¿Deseas abandonarla y volver al dashboard?')) {
            return;
        }
    }
    window.location.href = '../../index.html';
}

// Función para actualizar el resumen de venta con información del cliente
function actualizarResumenConCliente(cliente) {
    try {
        console.log('Actualizando resumen con cliente:', cliente);
        
        // Actualizar nombre del cliente en el resumen
        const elementoNombreCliente = document.getElementById('cliente-nombre') || 
                                     document.querySelector('.cliente-info .nombre') ||
                                     document.querySelector('#resumen-cliente-nombre');
        
        if (elementoNombreCliente) {
            elementoNombreCliente.textContent = cliente.nombre || 'Cliente seleccionado';
        }
        
        // Actualizar teléfono si existe el elemento
        const elementoTelefono = document.getElementById('cliente-telefono') || 
                                document.querySelector('.cliente-info .telefono') ||
                                document.querySelector('#resumen-cliente-telefono');
        
        if (elementoTelefono) {
            elementoTelefono.textContent = cliente.telefono || '';
        }
        
        // Actualizar dirección principal si existe el elemento
        const elementoDireccion = document.getElementById('cliente-direccion') || 
                                 document.querySelector('.cliente-info .direccion') ||
                                 document.querySelector('#resumen-cliente-direccion');
        
        if (elementoDireccion && cliente.direcciones && cliente.direcciones.length > 0) {
            elementoDireccion.textContent = cliente.direcciones[0].direccion || '';
        }
        
        // Mostrar sección de cliente si estaba oculta
        const seccionCliente = document.querySelector('.cliente-seleccionado') || 
                              document.querySelector('.resumen-cliente') ||
                              document.getElementById('seccion-cliente');
        
        if (seccionCliente) {
            seccionCliente.style.display = 'block';
            seccionCliente.classList.add('activo');
        }
        
        // Actualizar información en el ticket/resumen de venta
        actualizarTicketConCliente(cliente);
        
        console.log('Resumen actualizado exitosamente con cliente');
        
    } catch (error) {
        console.error('Error al actualizar resumen con cliente:', error);
        mostrarMensaje('Error al actualizar información del cliente', 'error');
    }
}

// Función auxiliar para actualizar el ticket con información del cliente
function actualizarTicketConCliente(cliente) {
    try {
        // Buscar elemento del ticket donde mostrar info del cliente
        const ticketCliente = document.querySelector('.ticket-cliente') || 
                             document.querySelector('#ticket-info-cliente') ||
                             document.querySelector('.factura-cliente');
        
        if (ticketCliente) {
            ticketCliente.innerHTML = `
                <div class="cliente-ticket-info">
                    <strong>Cliente:</strong> ${cliente.nombre}
                    ${cliente.telefono ? `<br><strong>Tel:</strong> ${cliente.telefono}` : ''}
                    ${cliente.direcciones && cliente.direcciones.length > 0 ? 
                      `<br><strong>Dir:</strong> ${cliente.direcciones[0].direccion}` : ''}
                </div>
            `;
        }
        
        // Si hay un selector de direcciones, actualizar opciones
        const selectorDirecciones = document.getElementById('selector-direcciones') ||
                                   document.querySelector('.direcciones-cliente');
        
        if (selectorDirecciones && cliente.direcciones) {
            actualizarSelectorDirecciones(cliente.direcciones);
        }
        
    } catch (error) {
        console.error('Error al actualizar ticket con cliente:', error);
    }
}

// Función para actualizar selector de direcciones
function actualizarSelectorDirecciones(direcciones) {
    try {
        const selector = document.getElementById('selector-direcciones') ||
                        document.querySelector('select[name="direccion"]') ||
                        document.querySelector('.selector-direcciones select');
        
        if (!selector || !direcciones) return;
        
        // Limpiar opciones existentes
        selector.innerHTML = '<option value="">Seleccionar dirección...</option>';
        
        // Agregar direcciones del cliente
        direcciones.forEach((direccion, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = direccion.direccion;
            if (direccion.principal) {
                option.selected = true;
            }
            selector.appendChild(option);
        });
        
        // Mostrar selector si estaba oculto
        const contenedorSelector = selector.closest('.direcciones-container') ||
                                  selector.closest('.grupo-direcciones');
        
        if (contenedorSelector) {
            contenedorSelector.style.display = 'block';
        }
        
    } catch (error) {
        console.error('Error al actualizar selector de direcciones:', error);
    }
}

// ============================
// FUNCIÓN VALIDAR CLIENTE DUPLICADO
// ============================

/**
 * Valida si ya existe un cliente con el mismo nombre y teléfono
 */
async function validarClienteDuplicado(nombre, telefono) {
    try {
        console.log('🔍 Validando duplicado para:', nombre, telefono);
        
        if (!nombre || !telefono) {
            return false;
        }
        
        // Normalizar datos para comparación
        const nombreNormalizado = nombre.toLowerCase().trim();
        const telefonoNormalizado = telefono.replace(/\D/g, ''); // Solo números
        
        // Verificar en localStorage
        const clientesStorage = getStoredData('clientes') || [];
        const duplicadoStorage = clientesStorage.some(cliente => {
            const clienteNombre = (cliente.nombre || '').toLowerCase().trim();
            const clienteTelefono = (cliente.telefonoWhatsapp || cliente.telefono || '').replace(/\D/g, '');
            
            return clienteNombre === nombreNormalizado && clienteTelefono === telefonoNormalizado;
        });
        
        if (duplicadoStorage) {
            console.log('❌ Duplicado encontrado en localStorage');
            return true;
        }
        
        // Verificar en IndexedDB si está disponible
        if (db) {
            try {
                const clientesDB = await obtenerTodosLosClientes();
                const duplicadoDB = clientesDB.some(cliente => {
                    const clienteNombre = (cliente.nombre || '').toLowerCase().trim();
                    const clienteTelefono = (cliente.telefonoWhatsapp || cliente.telefono || '').replace(/\D/g, '');
                    
                    return clienteNombre === nombreNormalizado && clienteTelefono === telefonoNormalizado;
                });
                
                if (duplicadoDB) {
                    console.log('❌ Duplicado encontrado en IndexedDB');
                    return true;
                }
            } catch (error) {
                console.warn('⚠️ Error al verificar duplicados en IndexedDB:', error);
            }
        }
        
        console.log('✅ No se encontraron duplicados');
        return false;
        
    } catch (error) {
        console.error('❌ Error al validar duplicado:', error);
        return false;
    }
}

/**
 * Guarda un nuevo cliente con validación de duplicados
 */
async function guardarNuevoCliente(formData) {
    console.log('💾 Iniciando guardado de nuevo cliente:', formData);
    
    // Prevenir ejecuciones múltiples simultáneas
    if (guardarNuevoCliente.isProcessing) {
        console.log('⚠️ Ya hay un proceso de guardado en curso, ignorando llamada duplicada');
        return false;
    }
    
    // Marcar como procesando
    guardarNuevoCliente.isProcessing = true;
    
    try {
        // Convertir FormData a objeto si es necesario
        let clienteFormData = {};
        if (formData instanceof FormData) {
            for (let [key, value] of formData.entries()) {
                clienteFormData[key] = value;
            }
        } else {
            clienteFormData = formData;
        }
        
        console.log('📋 Datos extraídos del formulario:', clienteFormData);
        
        // Extraer nombre y teléfono para validación
        const nombre = clienteFormData.nombre || clienteFormData['nuevo-cliente-nombre'];
        const telefono = clienteFormData.whatsapp || clienteFormData['nuevo-cliente-whatsapp'];
        
        // Eliminada validación de nombre y teléfono obligatorios para permitir cerrar el formulario sin datos
        
        // Validar duplicados antes de guardar
        const esDuplicado = await validarClienteDuplicado(nombre, telefono);
        if (esDuplicado) {
            showNotification('Ya existe un cliente con este nombre y teléfono', 'warning');
            return false;
        }
        
        // Preparar datos del cliente con mapeo completo
        const clienteData = {
            nombre: nombre,
            telefonoWhatsapp: telefono,
            telefonoLlamada: clienteFormData['nuevo-cliente-telefono'] || clienteFormData.telefono || '',
            documentoIdentidad: clienteFormData['nuevo-cliente-documento'] || clienteFormData.documento || '',
            email: clienteFormData['nuevo-cliente-email'] || clienteFormData.email || '',
            fechaNacimiento: clienteFormData['nuevo-cliente-fecha-nacimiento'] || clienteFormData.fechaNacimiento || '',
            notas: clienteFormData['nuevo-cliente-notas'] || clienteFormData.notas || '',
            direccion: clienteFormData['nuevo-cliente-direccion'] || clienteFormData.direccion || '',
            direccionDos: clienteFormData['nuevo-cliente-direccion-dos'] || clienteFormData.direccionDos || '',
            // Campos adicionales para compatibilidad
            telefono: telefono, // Campo legacy
            whatsapp: telefono, // Campo legacy
            documento: clienteFormData['nuevo-cliente-documento'] || clienteFormData.documento || '', // Campo legacy
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };
        
        console.log('📝 Datos del cliente preparados:', clienteData);
        
        // Intentar guardar en IndexedDB primero
        let clienteGuardado = null;
        try {
            if (db) {
                clienteGuardado = await guardarClienteEnDB(clienteData);
                console.log('✅ Cliente guardado en IndexedDB con ID:', clienteGuardado.id);
            }
        } catch (error) {
            console.warn('⚠️ Error al guardar en IndexedDB:', error);
        }
        
        // Solo guardar en localStorage si NO se guardó en IndexedDB
        if (!clienteGuardado) {
            try {
                const clientesStorage = getStoredData('clientes') || [];
                
                // Asignar ID para localStorage
                const maxId = clientesStorage.length > 0 ? 
                    Math.max(...clientesStorage.map(c => c.id || 0)) : 0;
                clienteData.id = maxId + 1;
                clienteGuardado = clienteData;
                
                // Agregar a localStorage
                clientesStorage.push(clienteGuardado);
                
                // ✅ ORDENAR ALFABÉTICAMENTE
                clientesStorage.sort((a, b) => {
                    const nombreA = (a.nombre || '').toLowerCase().trim();
                    const nombreB = (b.nombre || '').toLowerCase().trim();
                    return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
                });
                
                setStoredData('clientes', clientesStorage);
                console.log('✅ Cliente guardado en localStorage como respaldo');
                
            } catch (error) {
                console.error('❌ Error al guardar en localStorage:', error);
                showNotification('Error al guardar cliente', 'error');
                return false;
            }
        } else {
            console.log('ℹ️ Cliente ya guardado en IndexedDB, omitiendo localStorage para evitar duplicados');
        }
        
        // Limpiar formulario
        limpiarFormularioNuevoCliente();
        
        // Cerrar modal si existe
        const modal = document.getElementById('modal-nuevo-cliente');
        if (modal) {
            closeModal('modal-nuevo-cliente');
        }
        
        // Mostrar notificación de éxito SOLO UNA VEZ
        showNotification(`Cliente ${clienteGuardado.nombre} guardado exitosamente`, 'success');
        
        // Seleccionar automáticamente el cliente recién creado
        if (clienteGuardado) {
            await procesarSeleccionCliente(clienteGuardado);
        }
        
        console.log('✅ Cliente guardado exitosamente:', clienteGuardado);
        return true;
        
    } catch (error) {
        console.error('❌ Error al guardar nuevo cliente:', error);
        showNotification('Error al guardar cliente', 'error');
        return false;
    } finally {
        // Liberar el proceso
        guardarNuevoCliente.isProcessing = false;
    }
}


