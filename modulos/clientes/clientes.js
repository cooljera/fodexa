/**
 * FODEXA - Módulo de Gestión de Clientes
 * Sistema completo para manejo de base de datos de clientes
 */

// ============================
// VARIABLES GLOBALES
// ============================
let clientesData = [];
let clientesFiltrados = [];
let clienteActual = null;
let vistaActual = 'tarjetas'; // 'tarjetas' o 'lista'
let paginaActual = 1;
let clientesPorPagina = 12;
let criterioOrden = { campo: 'nombre', direccion: 'asc' };

// ============================
// INICIALIZACIÓN
// ============================
document.addEventListener('DOMContentLoaded', function() {
    console.log('Inicializando módulo de clientes...');
    
    // Verificar autenticación
    if (!checkAuthentication()) {
        window.location.href = '../../login.html';
        return;
    }
    
    // Inicializar componentes
    initializeEventListeners();
    cargarClientes();
    actualizarEstadisticas();
    
    console.log('Módulo de clientes inicializado correctamente');
});

// ============================
// EVENT LISTENERS
// ============================
function initializeEventListeners() {
    // Navegación
    document.getElementById('back-btn').addEventListener('click', () => {
        window.location.href = '../../index.html';
    });
    
    document.getElementById('logout-btn').addEventListener('click', () => {
        localStorage.removeItem('fodexa_user');
        window.location.href = '../../login.html';
    });
    
    // Botones principales
    document.getElementById('nuevo-cliente-btn').addEventListener('click', abrirModalNuevoCliente);
    document.getElementById('export-btn').addEventListener('click', exportarClientes);
    document.getElementById('importar-btn').addEventListener('click', importarClientes);
    
    // Búsqueda y filtros
    document.getElementById('buscar-cliente').addEventListener('input', handleSearch);
    document.getElementById('filtro-tipo').addEventListener('change', aplicarFiltros);
    document.getElementById('filtro-estado').addEventListener('change', aplicarFiltros);
    document.getElementById('limpiar-filtros').addEventListener('click', limpiarFiltros);
    
    // Vistas
    document.getElementById('vista-tarjetas').addEventListener('click', () => cambiarVista('tarjetas'));
    document.getElementById('vista-lista').addEventListener('click', () => cambiarVista('lista'));
    
    // Modal cliente
    document.getElementById('modal-close').addEventListener('click', cerrarModalCliente);
    document.getElementById('modal-cancelar').addEventListener('click', cerrarModalCliente);
    document.getElementById('form-cliente').addEventListener('submit', guardarCliente);
    
    // Modal detalles
    document.getElementById('detalles-close').addEventListener('click', cerrarModalDetalles);
    document.getElementById('editar-cliente-btn').addEventListener('click', editarClienteDesdeDetalles);
    
    // Modal confirmación
    document.getElementById('confirmar-close').addEventListener('click', cerrarModalConfirmar);
    document.getElementById('confirmar-cancelar').addEventListener('click', cerrarModalConfirmar);
    
    // Cerrar modales con Escape
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            cerrarTodosLosModales();
        }
    });
    
    // Ordenamiento en tabla
    document.addEventListener('click', function(e) {
        if (e.target.closest('[data-sort]')) {
            const campo = e.target.closest('[data-sort]').dataset.sort;
            ordenarPor(campo);
        }
    });
}

// ============================
// GESTIÓN DE CLIENTES
// ============================
async function cargarClientes() {
    try {
        clientesData = await window.obtenerClientesSupabase();
        clientesFiltrados = [...clientesData];
        renderizarClientes();
        actualizarPaginacion();
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showToast('Error al cargar los clientes', 'error');
    }
}

function renderizarClientes() {
    const inicio = (paginaActual - 1) * clientesPorPagina;
    const fin = inicio + clientesPorPagina;
    const clientesPagina = clientesFiltrados.slice(inicio, fin);
    
    if (vistaActual === 'tarjetas') {
        renderizarTarjetas(clientesPagina);
    } else {
        renderizarTabla(clientesPagina);
    }
    
    actualizarInfoPaginacion();
}

function renderizarTarjetas(clientes) {
    const container = document.getElementById('clientes-grid');
    
    if (clientes.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-users"></i>
                <h3>No hay clientes registrados</h3>
                <p>Comienza agregando tu primer cliente</p>
                <button class="btn btn-primary" onclick="abrirModalNuevoCliente()">
                    <i class="fas fa-user-plus"></i>
                    Agregar Cliente
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clientes.map(cliente => `
        <div class="cliente-card" data-id="${cliente.id}">
            <div class="cliente-header">
                <div class="cliente-avatar">
                    ${cliente.nombre.charAt(0).toUpperCase()}
                </div>
                <div class="cliente-actions">
                    <button class="btn btn-sm btn-primary" onclick="verDetallesCliente('${cliente.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editarCliente('${cliente.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCliente('${cliente.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
            
            <div class="cliente-info">
                <h4>${cliente.nombre}</h4>
                <p class="tag tag-${cliente.tipo}">${cliente.tipo.toUpperCase()}</p>
            </div>
            
            <div class="cliente-details">
                <div class="cliente-detail">
                    <i class="fas fa-phone"></i>
                    <span>${cliente.telefono}</span>
                </div>
                ${cliente.email ? `
                    <div class="cliente-detail">
                        <i class="fas fa-envelope"></i>
                        <span>${cliente.email}</span>
                    </div>
                ` : ''}
                ${cliente.direccion ? `
                    <div class="cliente-detail">
                        <i class="fas fa-map-marker-alt"></i>
                        <span>${cliente.direccion}</span>
                    </div>
                ` : ''}
            </div>
            
            <div class="cliente-stats">
                <div class="cliente-stat">
                    <span>${cliente.totalPedidos}</span>
                    <label>Pedidos</label>
                </div>
                <div class="cliente-stat">
                    <span>$${formatNumber(cliente.totalGastado)}</span>
                    <label>Total</label>
                </div>
            </div>
        </div>
    `).join('');
}

function renderizarTabla(clientes) {
    const tbody = document.getElementById('clientes-tbody');
    
    if (clientes.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="10" style="text-align: center; padding: 2rem;">
                    <div class="empty-state">
                        <i class="fas fa-users"></i>
                        <h3>No hay clientes que mostrar</h3>
                        <p>Intenta ajustar los filtros de búsqueda</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }
    
    tbody.innerHTML = clientes.map(cliente => `
        <tr data-id="${cliente.id}">
            <td>
                <input type="checkbox" class="cliente-select" value="${cliente.id}">
            </td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div class="cliente-avatar" style="width: 32px; height: 32px; font-size: 0.75rem;">
                        ${cliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    <span>${cliente.nombre}</span>
                </div>
            </td>
            <td>${cliente.telefono}</td>
            <td>${cliente.email || '-'}</td>
            <td><span class="tag tag-${cliente.tipo}">${cliente.tipo}</span></td>
            <td>${cliente.totalPedidos}</td>
            <td>$${formatNumber(cliente.totalGastado)}</td>
            <td>${cliente.ultimaVisita ? formatDate(cliente.ultimaVisita) : 'Nunca'}</td>
            <td>
                <span class="tag ${cliente.activo ? 'tag-success' : 'tag-danger'}">
                    ${cliente.activo ? 'Activo' : 'Inactivo'}
                </span>
            </td>
            <td>
                <div style="display: flex; gap: 0.25rem;">
                    <button class="btn btn-sm btn-primary" onclick="verDetallesCliente('${cliente.id}')" title="Ver detalles">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-secondary" onclick="editarCliente('${cliente.id}')" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="eliminarCliente('${cliente.id}')" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// ============================
// BÚSQUEDA Y FILTROS
// ============================
function handleSearch(e) {
    const termino = e.target.value.trim();
    
    if (termino === '') {
        clientesFiltrados = [...clientesData];
    } else {
        clientesFiltrados = ClientesManager.search(termino);
    }
    
    aplicarFiltrosAdicionales();
    paginaActual = 1;
    renderizarClientes();
    actualizarPaginacion();
}

function aplicarFiltros() {
    const tipo = document.getElementById('filtro-tipo').value;
    const estado = document.getElementById('filtro-estado').value;
    
    let resultados = [...clientesData];
    
    // Aplicar búsqueda actual
    const termino = document.getElementById('buscar-cliente').value.trim();
    if (termino) {
        resultados = ClientesManager.search(termino);
    }
    
    // Filtrar por tipo
    if (tipo) {
        resultados = resultados.filter(cliente => cliente.tipo === tipo);
    }
    
    // Filtrar por estado
    if (estado) {
        const esActivo = estado === 'activo';
        resultados = resultados.filter(cliente => cliente.activo === esActivo);
    }
    
    clientesFiltrados = resultados;
    paginaActual = 1;
    renderizarClientes();
    actualizarPaginacion();
}

function aplicarFiltrosAdicionales() {
    const tipo = document.getElementById('filtro-tipo').value;
    const estado = document.getElementById('filtro-estado').value;
    
    if (tipo) {
        clientesFiltrados = clientesFiltrados.filter(cliente => cliente.tipo === tipo);
    }
    
    if (estado) {
        const esActivo = estado === 'activo';
        clientesFiltrados = clientesFiltrados.filter(cliente => cliente.activo === esActivo);
    }
}

function limpiarFiltros() {
    document.getElementById('buscar-cliente').value = '';
    document.getElementById('filtro-tipo').value = '';
    document.getElementById('filtro-estado').value = '';
    
    clientesFiltrados = [...clientesData];
    paginaActual = 1;
    renderizarClientes();
    actualizarPaginacion();
}

// ============================
// ORDENAMIENTO
// ============================
function ordenarPor(campo) {
    if (criterioOrden.campo === campo) {
        criterioOrden.direccion = criterioOrden.direccion === 'asc' ? 'desc' : 'asc';
    } else {
        criterioOrden.campo = campo;
        criterioOrden.direccion = 'asc';
    }
    
    clientesFiltrados.sort((a, b) => {
        let valorA = a[campo];
        let valorB = b[campo];
        
        // Manejar fechas
        if (campo === 'ultimaVisita') {
            valorA = valorA ? new Date(valorA) : new Date(0);
            valorB = valorB ? new Date(valorB) : new Date(0);
        }
        
        // Manejar números
        if (typeof valorA === 'number' && typeof valorB === 'number') {
            return criterioOrden.direccion === 'asc' ? valorA - valorB : valorB - valorA;
        }
        
        // Manejar strings
        const comparacion = String(valorA).localeCompare(String(valorB));
        return criterioOrden.direccion === 'asc' ? comparacion : -comparacion;
    });
    
    renderizarClientes();
    actualizarIconosOrdenamiento();
}

function actualizarIconosOrdenamiento() {
    document.querySelectorAll('[data-sort] i').forEach(icon => {
        icon.className = 'fas fa-sort';
    });
    
    const iconoActivo = document.querySelector(`[data-sort="${criterioOrden.campo}"] i`);
    if (iconoActivo) {
        iconoActivo.className = criterioOrden.direccion === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    }
}

// ============================
// VISTAS
// ============================
function cambiarVista(vista) {
    vistaActual = vista;
    
    document.getElementById('vista-tarjetas').classList.toggle('active', vista === 'tarjetas');
    document.getElementById('vista-lista').classList.toggle('active', vista === 'lista');
    
    document.getElementById('clientes-grid').style.display = vista === 'tarjetas' ? 'grid' : 'none';
    document.getElementById('clientes-table').style.display = vista === 'lista' ? 'block' : 'none';
    
    renderizarClientes();
}

// ============================
// PAGINACIÓN
// ============================
function actualizarPaginacion() {
    const totalPaginas = Math.ceil(clientesFiltrados.length / clientesPorPagina);
    const container = document.getElementById('pagination');
    
    if (totalPaginas <= 1) {
        container.innerHTML = '';
        return;
    }
    
    let html = '';
    
    // Botón anterior
    html += `
        <button ${paginaActual === 1 ? 'disabled' : ''} onclick="cambiarPagina(${paginaActual - 1})">
            <i class="fas fa-chevron-left"></i>
        </button>
    `;
    
    // Páginas
    const inicio = Math.max(1, paginaActual - 2);
    const fin = Math.min(totalPaginas, paginaActual + 2);
    
    if (inicio > 1) {
        html += `<button onclick="cambiarPagina(1)">1</button>`;
        if (inicio > 2) {
            html += `<span>...</span>`;
        }
    }
    
    for (let i = inicio; i <= fin; i++) {
        html += `
            <button class="${i === paginaActual ? 'active' : ''}" onclick="cambiarPagina(${i})">
                ${i}
            </button>
        `;
    }
    
    if (fin < totalPaginas) {
        if (fin < totalPaginas - 1) {
            html += `<span>...</span>`;
        }
        html += `<button onclick="cambiarPagina(${totalPaginas})">${totalPaginas}</button>`;
    }
    
    // Botón siguiente
    html += `
        <button ${paginaActual === totalPaginas ? 'disabled' : ''} onclick="cambiarPagina(${paginaActual + 1})">
            <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = html;
}

function cambiarPagina(pagina) {
    paginaActual = pagina;
    renderizarClientes();
    actualizarPaginacion();
}

function actualizarInfoPaginacion() {
    const inicio = (paginaActual - 1) * clientesPorPagina + 1;
    const fin = Math.min(inicio + clientesPorPagina - 1, clientesFiltrados.length);
    
    document.getElementById('showing-from').textContent = clientesFiltrados.length === 0 ? 0 : inicio;
    document.getElementById('showing-to').textContent = fin;
    document.getElementById('total-items').textContent = clientesFiltrados.length;
}

// ============================
// MODALES
// ============================
function abrirModalNuevoCliente() {
    clienteActual = null;
    document.getElementById('modal-title').textContent = 'Nuevo Cliente';
    document.getElementById('modal-guardar').innerHTML = '<i class="fas fa-save"></i> Guardar Cliente';
    
    // Limpiar formulario
    document.getElementById('form-cliente').reset();
    
    // Valores por defecto
    document.getElementById('cliente-tipo').value = 'nuevo';
    document.getElementById('cliente-ciudad').value = 'Medellín';
    document.getElementById('cliente-notificaciones').checked = true;
    
    document.getElementById('modal-cliente').style.display = 'flex';
}

function editarCliente(id) {
    const cliente = ClientesManager.getById(id);
    if (!cliente) {
        showToast('Cliente no encontrado', 'error');
        return;
    }
    
    clienteActual = cliente;
    document.getElementById('modal-title').textContent = 'Editar Cliente';
    document.getElementById('modal-guardar').innerHTML = '<i class="fas fa-save"></i> Actualizar Cliente';
    
    // Llenar formulario
    document.getElementById('cliente-nombre').value = cliente.nombre;
    document.getElementById('cliente-telefono').value = cliente.telefono;
    document.getElementById('cliente-email').value = cliente.email || '';
    document.getElementById('cliente-documento').value = cliente.documento || '';
    document.getElementById('cliente-fechaNacimiento').value = cliente.fechaNacimiento || '';
    document.getElementById('cliente-direccion').value = cliente.direccion || '';
    document.getElementById('cliente-barrio').value = cliente.barrio || '';
    document.getElementById('cliente-ciudad').value = cliente.ciudad || 'Medellín';
    document.getElementById('cliente-tipo').value = cliente.tipo;
    document.getElementById('cliente-descuento').value = cliente.descuento || 0;
    document.getElementById('cliente-notas').value = cliente.notas || '';
    document.getElementById('cliente-notificaciones').checked = cliente.notificaciones !== false;
    document.getElementById('cliente-marketing').checked = cliente.marketing === true;
    
    document.getElementById('modal-cliente').style.display = 'flex';
}

function editarClienteDesdeDetalles() {
    cerrarModalDetalles();
    editarCliente(clienteActual.id);
}

function cerrarModalCliente() {
    document.getElementById('modal-cliente').style.display = 'none';
    clienteActual = null;
}

async function guardarCliente(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const clienteData = {
        nombre: formData.get('nombre').trim(),
        telefono: formData.get('telefono').trim(),
        email: formData.get('email').trim(),
        documento: formData.get('documento').trim(),
        fechaNacimiento: formData.get('fechaNacimiento'),
        direccion: formData.get('direccion').trim(),
        barrio: formData.get('barrio').trim(),
        ciudad: formData.get('ciudad').trim(),
        tipo: formData.get('tipo'),
        descuento: parseInt(formData.get('descuento')) || 0,
        notas: formData.get('notas').trim(),
        notificaciones: formData.has('notificaciones'),
        marketing: formData.has('marketing')
    };
    try {
        showLoading(true);
        if (clienteActual) {
            // Actualizar cliente existente en Supabase
            await window.actualizarClienteSupabase(clienteActual.id, clienteData);
            showToast('Cliente actualizado correctamente', 'success');
        } else {
            // Crear nuevo cliente en Supabase
            await window.guardarClienteSupabase(clienteData);
            showToast('Cliente creado correctamente', 'success');
        }
        cerrarModalCliente();
        await cargarClientes();
        actualizarEstadisticas();
    } catch (error) {
        console.error('Error guardando cliente:', error);
        showToast(error.message, 'error');
    } finally {
        showLoading(false);
    }
}

// ============================
// DETALLES DEL CLIENTE
// ============================
async function verDetallesCliente(id) {
    const clientes = clientesData.length ? clientesData : await window.obtenerClientesSupabase();
    const cliente = clientes.find(c => c.id == id);
    if (!cliente) {
        showToast('Cliente no encontrado', 'error');
        return;
    }
    clienteActual = cliente;
    // Llenar información del perfil
    document.getElementById('detalles-title').textContent = `Detalles - ${cliente.nombre}`;
    document.getElementById('profile-nombre').textContent = cliente.nombre;
    document.getElementById('profile-tipo').textContent = cliente.tipo.toUpperCase();
    document.getElementById('profile-tipo').className = `tag tag-${cliente.tipo}`;
    document.getElementById('profile-estado').textContent = cliente.activo ? 'Activo' : 'Inactivo';
    document.getElementById('profile-estado').className = `tag ${cliente.activo ? 'tag-success' : 'tag-danger'}`;
    // Información personal
    document.getElementById('profile-telefono').textContent = cliente.telefono;
    document.getElementById('profile-email').textContent = cliente.email || '-';
    document.getElementById('profile-documento').textContent = cliente.documento || '-';
    document.getElementById('profile-fechaNacimiento').textContent = cliente.fechaNacimiento ? formatDate(cliente.fechaNacimiento) : '-';
    // Dirección
    document.getElementById('profile-direccion').textContent = cliente.direccion || '-';
    document.getElementById('profile-barrio').textContent = cliente.barrio || '-';
    document.getElementById('profile-ciudad').textContent = cliente.ciudad || '-';
    // Estadísticas
    document.getElementById('profile-totalPedidos').textContent = cliente.totalPedidos;
    document.getElementById('profile-totalGastado').textContent = `$${formatNumber(cliente.totalGastado)}`;
    document.getElementById('profile-ultimaVisita').textContent = cliente.ultimaVisita ? formatDate(cliente.ultimaVisita) : 'Nunca';
    document.getElementById('profile-descuento').textContent = `${cliente.descuento || 0}%`;
    // Cargar historial de pedidos
    cargarHistorialPedidos(cliente.id);
    document.getElementById('modal-detalles').style.display = 'flex';
}

function cargarHistorialPedidos(clienteId) {
    // Aquí se integraría con el sistema de pedidos
    const container = document.getElementById('historial-pedidos');
    
    // Por ahora, mostrar datos de ejemplo
    const historialEjemplo = [
        {
            id: '001',
            fecha: '2024-01-15',
            total: 25000,
            estado: 'entregado'
        },
        {
            id: '002',
            fecha: '2024-01-10',
            total: 18500,
            estado: 'entregado'
        }
    ];
    
    if (historialEjemplo.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-receipt"></i>
                <p>No hay pedidos registrados para este cliente</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = historialEjemplo.map(pedido => `
        <div class="historial-item">
            <div class="historial-icon">
                <i class="fas fa-receipt"></i>
            </div>
            <div class="historial-info">
                <h5>Pedido #${pedido.id}</h5>
                <p>${formatDate(pedido.fecha)} - Estado: ${pedido.estado}</p>
            </div>
            <div class="historial-amount">
                $${formatNumber(pedido.total)}
            </div>
        </div>
    `).join('');
}

function cerrarModalDetalles() {
    document.getElementById('modal-detalles').style.display = 'none';
    clienteActual = null;
}

// ============================
// ELIMINACIÓN
// ============================
async function eliminarCliente(id) {
    const clientes = clientesData.length ? clientesData : await window.obtenerClientesSupabase();
    const cliente = clientes.find(c => c.id == id);
    if (!cliente) {
        showToast('Cliente no encontrado', 'error');
        return;
    }
    mostrarConfirmacion(
        'Eliminar Cliente',
        `¿Estás seguro de eliminar al cliente "${cliente.nombre}"? Esta acción no se puede deshacer.`,
        async () => {
            try {
                await window.eliminarClienteSupabase(id);
                showToast('Cliente eliminado correctamente', 'success');
                await cargarClientes();
                actualizarEstadisticas();
            } catch (error) {
                console.error('Error eliminando cliente:', error);
                showToast(error.message, 'error');
            }
        }
    );
}

// ============================
// ESTADÍSTICAS
// ============================
function actualizarEstadisticas() {
    // Calcula estadísticas desde clientesData
    const stats = {
        total: clientesData.length,
        porTipo: {
            vip: clientesData.filter(c => c.tipo === 'vip').length,
            nuevo: clientesData.filter(c => c.tipo === 'nuevo').length
        },
        activos: clientesData.filter(c => c.activo !== false).length
    };
    document.getElementById('total-clientes').textContent = stats.total;
    document.getElementById('clientes-vip').textContent = stats.porTipo.vip || 0;
    document.getElementById('clientes-nuevos').textContent = stats.porTipo.nuevo || 0;
    document.getElementById('clientes-activos').textContent = stats.activos;
}

// ============================
// IMPORTAR/EXPORTAR
// ============================
function exportarClientes() {
    try {
        const clientes = ClientesManager.getAll();
        const csv = convertirACSV(clientes);
        descargarArchivo(csv, 'clientes_fodexa.csv', 'text/csv');
        showToast('Clientes exportados correctamente', 'success');
    } catch (error) {
        console.error('Error exportando:', error);
        showToast('Error al exportar clientes', 'error');
    }
}

function importarClientes() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.xls';
    
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        
        showLoading(true);
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = e.target.result;
                // Aquí se procesaría el archivo CSV/Excel
                // Por simplicidad, mostrar mensaje
                showToast('Funcionalidad de importación en desarrollo', 'info');
            } catch (error) {
                console.error('Error importando:', error);
                showToast('Error al importar archivo', 'error');
            } finally {
                showLoading(false);
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

function convertirACSV(clientes) {
    const headers = [
        'Nombre', 'Teléfono', 'Email', 'Documento', 'Tipo', 
        'Dirección', 'Barrio', 'Ciudad', 'Total Pedidos', 
        'Total Gastado', 'Última Visita', 'Activo'
    ];
    
    const rows = clientes.map(cliente => [
        cliente.nombre,
        cliente.telefono,
        cliente.email || '',
        cliente.documento || '',
        cliente.tipo,
        cliente.direccion || '',
        cliente.barrio || '',
        cliente.ciudad || '',
        cliente.totalPedidos,
        cliente.totalGastado,
        cliente.ultimaVisita || '',
        cliente.activo ? 'Sí' : 'No'
    ]);
    
    return [headers, ...rows].map(row => 
        row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
}

// ============================
// UTILIDADES
// ============================
function cerrarTodosLosModales() {
    document.getElementById('modal-cliente').style.display = 'none';
    document.getElementById('modal-detalles').style.display = 'none';
    document.getElementById('modal-confirmar').style.display = 'none';
}

function mostrarConfirmacion(titulo, mensaje, callback) {
    document.getElementById('confirmar-title').textContent = titulo;
    document.getElementById('confirmar-mensaje').textContent = mensaje;
    
    const btnAceptar = document.getElementById('confirmar-aceptar');
    btnAceptar.onclick = function() {
        callback();
        cerrarModalConfirmar();
    };
    
    document.getElementById('modal-confirmar').style.display = 'flex';
}

function cerrarModalConfirmar() {
    document.getElementById('modal-confirmar').style.display = 'none';
}

function showLoading(show) {
    document.getElementById('loading-overlay').style.display = show ? 'flex' : 'none';
}

function formatNumber(number) {
    return new Intl.NumberFormat('es-CO').format(number);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

function descargarArchivo(contenido, nombreArchivo, tipoMime) {
    const blob = new Blob([contenido], { type: tipoMime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = nombreArchivo;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ============================
// FUNCIONES GLOBALES
// ============================
window.verDetallesCliente = verDetallesCliente;
window.editarCliente = editarCliente;
window.eliminarCliente = eliminarCliente;
window.cambiarPagina = cambiarPagina;
window.abrirModalNuevoCliente = abrirModalNuevoCliente;
