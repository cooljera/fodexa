/**
 * Gestión de Clientes - Sistema FODEXA POS
 * Interfaz moderna para visualizar y gestionar la base de datos de clientes
 */

import FilaCliente from '../components/clientes/FilaCliente.js';
import clientesService from '../services/clientesService.js';

class GestionClientes {
    constructor() {
        this.clientes = [];
        this.clientesFiltrados = [];
        this.terminoBusqueda = '';
        this.init();
    }

    init() {
        this.crearInterfaz();
        this.configurarEventos();
        this.cargarClientes();
    }

    crearInterfaz() {
        const container = document.getElementById('app') || document.body;
        
        const interfazHTML = `
            <div class="gestion-clientes-container">
                <!-- Header de la página -->
                <div class="header-section">
                    <div class="header-content">
                        <h1 class="titulo-principal">
                            <i class="fas fa-users"></i>
                            Gestión de Clientes
                        </h1>
                        <p class="subtitulo">Administra tu base de datos de clientes de forma eficiente</p>
                    </div>
                    <div class="header-actions">
                        <button id="btn-nuevo-cliente" class="btn btn-primary btn-nuevo-cliente">
                            <i class="fas fa-plus"></i>
                            <span>Nuevo Cliente</span>
                        </button>
                    </div>
                </div>

                <!-- Barra de búsqueda y filtros -->
                <div class="search-section">
                    <div class="search-container">
                        <div class="search-input-wrapper">
                            <i class="fas fa-search search-icon"></i>
                            <input 
                                type="text" 
                                id="search-clientes" 
                                class="search-input"
                                placeholder="Buscar por nombre, apellido o teléfono..."
                                autocomplete="off"
                            >
                            <button id="btn-limpiar-busqueda" class="btn-limpiar-busqueda hidden">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="search-stats">
                            <span id="search-stats-text">0 clientes encontrados</span>
                        </div>
                    </div>
                </div>

                <!-- Tabla de clientes -->
                <div class="table-section">
                    <div class="table-container">
                        <div class="table-header">
                            <div class="table-title">
                                <h2>Base de Datos de Clientes</h2>
                                <div class="table-actions">
                                    <button id="btn-refrescar" class="btn btn-secondary btn-icon" title="Refrescar datos">
                                        <i class="fas fa-sync-alt"></i>
                                    </button>
                                    <button id="btn-exportar" class="btn btn-secondary btn-icon" title="Exportar datos">
                                        <i class="fas fa-download"></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Tabla responsiva -->
                        <div class="table-wrapper">
                            <table class="clientes-table" id="clientes-table">
                                <thead>
                                    <tr>
                                        <th class="th-nombre">
                                            <button class="sort-btn" data-sort="nombre">
                                                Nombre
                                                <i class="fas fa-sort sort-icon"></i>
                                            </button>
                                        </th>
                                        <th class="th-apellido">
                                            <button class="sort-btn" data-sort="apellido">
                                                Apellido
                                                <i class="fas fa-sort sort-icon"></i>
                                            </button>
                                        </th>
                                        <th class="th-telefono">
                                            <button class="sort-btn" data-sort="telefono">
                                                Teléfono Principal
                                                <i class="fas fa-sort sort-icon"></i>
                                            </button>
                                        </th>
                                        <th class="th-direccion">Dirección Principal</th>
                                        <th class="th-acciones">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody id="clientes-tbody">
                                    <!-- Las filas se cargan dinámicamente -->
                                </tbody>
                            </table>

                            <!-- Estado vacío -->
                            <div id="empty-state" class="empty-state hidden">
                                <div class="empty-content">
                                    <i class="fas fa-user-plus empty-icon"></i>
                                    <h3>No hay clientes registrados</h3>
                                    <p>Comienza agregando tu primer cliente al sistema</p>
                                    <button class="btn btn-primary btn-empty-action">
                                        <i class="fas fa-plus"></i>
                                        Agregar Primer Cliente
                                    </button>
                                </div>
                            </div>

                            <!-- Estado de búsqueda sin resultados -->
                            <div id="no-results-state" class="empty-state hidden">
                                <div class="empty-content">
                                    <i class="fas fa-search empty-icon"></i>
                                    <h3>Sin resultados</h3>
                                    <p id="no-results-message">No se encontraron clientes</p>
                                    <button id="btn-limpiar-filtros" class="btn btn-secondary btn-empty-action">
                                        <i class="fas fa-times"></i>
                                        Limpiar Filtros
                                    </button>
                                </div>
                            </div>

                            <!-- Loading state -->
                            <div id="loading-state" class="loading-state hidden">
                                <div class="loading-content">
                                    <div class="loading-spinner"></div>
                                    <p>Cargando clientes...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Paginación (para futuras implementaciones) -->
                <div class="pagination-section hidden">
                    <div class="pagination-container">
                        <div class="pagination-info">
                            <span>Mostrando 1-10 de 25 clientes</span>
                        </div>
                        <div class="pagination-controls">
                            <button class="btn btn-pagination" disabled>
                                <i class="fas fa-chevron-left"></i>
                            </button>
                            <button class="btn btn-pagination active">1</button>
                            <button class="btn btn-pagination">2</button>
                            <button class="btn btn-pagination">3</button>
                            <button class="btn btn-pagination">
                                <i class="fas fa-chevron-right"></i>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Modal de confirmación para eliminar -->
                <div id="modal-confirmar-eliminar" class="modal hidden">
                    <div class="modal-overlay"></div>
                    <div class="modal-content modal-small">
                        <div class="modal-header">
                            <h3>Confirmar Eliminación</h3>
                            <button class="modal-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="confirm-icon">
                                <i class="fas fa-exclamation-triangle"></i>
                            </div>
                            <p id="confirm-message">¿Estás seguro de que deseas eliminar este cliente?</p>
                            <p class="confirm-warning">Esta acción no se puede deshacer.</p>
                        </div>
                        <div class="modal-footer">
                            <button id="btn-cancelar-eliminar" class="btn btn-secondary">
                                Cancelar
                            </button>
                            <button id="btn-confirmar-eliminar" class="btn btn-danger">
                                <i class="fas fa-trash"></i>
                                Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = interfazHTML;
    }

    configurarEventos() {
        // Botón nuevo cliente
        document.getElementById('btn-nuevo-cliente')?.addEventListener('click', () => {
            this.abrirModalNuevoCliente();
        });

        // Búsqueda en tiempo real
        const searchInput = document.getElementById('search-clientes');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.procesarBusqueda(e.target.value);
            });
        }

        // Limpiar búsqueda
        document.getElementById('btn-limpiar-busqueda')?.addEventListener('click', () => {
            this.limpiarBusqueda();
        });

        // Refrescar datos
        document.getElementById('btn-refrescar')?.addEventListener('click', () => {
            this.refrescarDatos();
        });

        // Exportar datos
        document.getElementById('btn-exportar')?.addEventListener('click', () => {
            this.exportarDatos();
        });

        // Botones de ordenamiento
        document.querySelectorAll('.sort-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const campo = e.currentTarget.dataset.sort;
                this.ordenarPor(campo);
            });
        });

        // Modal de confirmación
        this.configurarModalConfirmacion();

        // Botones de estado vacío
        document.querySelector('.btn-empty-action')?.addEventListener('click', () => {
            this.abrirModalNuevoCliente();
        });

        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            this.limpiarBusqueda();
        });
    }

    configurarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmar-eliminar');
        const btnCancelar = document.getElementById('btn-cancelar-eliminar');
        const btnConfirmar = document.getElementById('btn-confirmar-eliminar');
        const btnCerrar = modal?.querySelector('.modal-close');

        [btnCancelar, btnCerrar].forEach(btn => {
            btn?.addEventListener('click', () => {
                this.cerrarModalConfirmacion();
            });
        });

        // Cerrar modal al hacer clic en overlay
        modal?.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.cerrarModalConfirmacion();
        });
    }

    // ===== MÉTODOS DE DATOS =====
    
    async cargarClientes() {
        try {
            this.mostrarLoading(true);
            console.log('🔄 Cargando clientes desde la base de datos...');
            
            // Inicializar servicio si no está listo
            if (!clientesService.isInitialized) {
                await clientesService.init();
            }
            
            // Obtener clientes de la base de datos
            this.clientes = await clientesService.obtenerTodosLosClientes();
            this.clientesFiltrados = [...this.clientes];
            
            console.log(`✅ Cargados ${this.clientes.length} clientes`);
            
            this.renderizarTabla();
            this.actualizarEstadisticas();
            
        } catch (error) {
            console.error('❌ Error al cargar clientes:', error);
            this.mostrarErrorCarga();
        } finally {
            this.mostrarLoading(false);
        }
    }

    async buscarClientes() {
        try {
            const termino = this.terminoBusqueda.trim();
            console.log('🔍 Buscando clientes:', termino);
            
            if (termino === '') {
                this.clientesFiltrados = [...this.clientes];
            } else {
                this.clientesFiltrados = await clientesService.buscarClientes(termino);
            }
            
            this.renderizarTabla();
            this.actualizarEstadisticas();
            
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            this.clientesFiltrados = [...this.clientes];
            this.renderizarTabla();
        }
    }

    mostrarErrorCarga() {
        const tbody = document.querySelector('.clientes-tabla tbody');
        if (tbody) {
            tbody.innerHTML = `
                <tr class="fila-error">
                    <td colspan="6" class="celda-error">
                        <div class="error-container">
                            <i class="fas fa-exclamation-triangle error-icon"></i>
                            <h3>Error al cargar clientes</h3>
                            <p>No se pudieron cargar los datos de la base de datos.</p>
                            <button onclick="window.gestionClientes.cargarClientes()" class="btn btn-primary btn-sm">
                                <i class="fas fa-retry"></i>
                                Reintentar
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }
    }

    obtenerClientesEjemplo() {
        // Datos de ejemplo para mostrar la interfaz
        return [
            {
                id: 1,
                nombre: 'Juan Carlos',
                apellido: 'Rodríguez',
                telefono: '300 123 4567',
                direccion: 'Calle 50 #25-30, Bogotá',
                email: 'juan.rodriguez@email.com',
                fechaRegistro: '2024-01-15'
            },
            {
                id: 2,
                nombre: 'María Elena',
                apellido: 'García',
                telefono: '310 987 6543',
                direccion: 'Carrera 15 #80-45, Medellín',
                email: 'maria.garcia@email.com',
                fechaRegistro: '2024-02-20'
            },
            {
                id: 3,
                nombre: 'Carlos Alberto',
                apellido: 'Martínez',
                telefono: '320 456 7890',
                direccion: 'Avenida 19 #120-15, Cali',
                email: 'carlos.martinez@email.com',
                fechaRegistro: '2024-03-10'
            }
        ];
    }

    // ===== MÉTODOS DE BÚSQUEDA Y FILTRADO =====

    async procesarBusqueda(termino) {
        this.terminoBusqueda = termino.toLowerCase().trim();
        await this.buscarClientes();
        this.toggleBotonLimpiar();
    }

    limpiarBusqueda() {
        const searchInput = document.getElementById('search-clientes');
        if (searchInput) {
            searchInput.value = '';
        }
        this.terminoBusqueda = '';
        this.clientesFiltrados = [...this.clientes];
        this.renderizarTabla();
        this.actualizarEstadisticas();
        this.toggleBotonLimpiar();
    }

    toggleBotonLimpiar() {
        const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
        if (btnLimpiar) {
            if (this.terminoBusqueda) {
                btnLimpiar.classList.remove('hidden');
            } else {
                btnLimpiar.classList.add('hidden');
            }
        }
    }

    // ===== MÉTODOS DE RENDERIZADO =====

    renderizarTabla() {
        const tbody = document.getElementById('clientes-tbody');
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');
        const tableWrapper = document.querySelector('.table-wrapper table');

        if (!tbody) return;

        // Limpiar tabla
        tbody.innerHTML = '';

        // Verificar estados
        if (this.clientes.length === 0) {
            // No hay clientes en la base de datos
            this.mostrarEstadoVacio();
            return;
        }

        if (this.clientesFiltrados.length === 0) {
            // Hay clientes pero ninguno coincide con la búsqueda
            this.mostrarEstadoSinResultados();
            return;
        }

        // Mostrar tabla con datos
        tableWrapper?.classList.remove('hidden');
        emptyState?.classList.add('hidden');
        noResultsState?.classList.add('hidden');

        // Renderizar filas
        this.clientesFiltrados.forEach((cliente, index) => {
            const filaCliente = new FilaCliente(cliente, index, {
                onEditar: (id) => this.editarCliente(id),
                onEliminar: (id) => this.eliminarCliente(id)
            });
            tbody.appendChild(filaCliente.render());
        });
    }

    mostrarEstadoVacio() {
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');
        const tableWrapper = document.querySelector('.table-wrapper table');

        tableWrapper?.classList.add('hidden');
        noResultsState?.classList.add('hidden');
        emptyState?.classList.remove('hidden');
    }

    mostrarEstadoSinResultados() {
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');
        const tableWrapper = document.querySelector('.table-wrapper table');
        const messageElement = document.getElementById('no-results-message');

        tableWrapper?.classList.add('hidden');
        emptyState?.classList.add('hidden');
        noResultsState?.classList.remove('hidden');

        if (messageElement) {
            messageElement.textContent = `No se encontraron clientes que coincidan con "${this.terminoBusqueda}"`;
        }
    }

    mostrarLoading(mostrar) {
        const loadingState = document.getElementById('loading-state');
        const tableWrapper = document.querySelector('.table-wrapper table');
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');

        if (mostrar) {
            loadingState?.classList.remove('hidden');
            tableWrapper?.classList.add('hidden');
            emptyState?.classList.add('hidden');
            noResultsState?.classList.add('hidden');
        } else {
            loadingState?.classList.add('hidden');
        }
    }

    actualizarEstadisticas() {
        const statsElement = document.getElementById('search-stats-text');
        if (statsElement) {
            const total = this.clientesFiltrados.length;
            const totalOriginal = this.clientes.length;
            
            if (this.terminoBusqueda) {
                statsElement.textContent = `${total} de ${totalOriginal} clientes encontrados`;
            } else {
                statsElement.textContent = `${total} clientes registrados`;
            }
        }
    }

    // ===== MÉTODOS DE ACCIONES =====

    abrirModalNuevoCliente() {
        console.log('🆕 Abriendo modal de nuevo cliente');
        // Aquí se conectará con el modal existente
    }

    editarCliente(clienteId) {
        console.log('✏️ Editando cliente ID:', clienteId);
        // Aquí se implementará la edición
    }

    eliminarCliente(clienteId) {
        const cliente = this.clientes.find(c => c.id == clienteId);
        if (!cliente) return;

        // Mostrar modal de confirmación
        this.mostrarModalConfirmacion(cliente);
    }

    mostrarModalConfirmacion(cliente) {
        const modal = document.getElementById('modal-confirmar-eliminar');
        const message = document.getElementById('confirm-message');
        const btnConfirmar = document.getElementById('btn-confirmar-eliminar');

        if (message) {
            const nombreCompleto = cliente.nombre || 'Cliente sin nombre';
            message.textContent = `¿Estás seguro de que deseas eliminar a ${nombreCompleto}?`;
        }

        // Configurar evento de confirmación
        btnConfirmar.onclick = () => {
            this.confirmarEliminacion(cliente.id);
        };

        // Mostrar modal
        modal?.classList.remove('hidden');
    }

    cerrarModalConfirmacion() {
        const modal = document.getElementById('modal-confirmar-eliminar');
        modal?.classList.add('hidden');
    }

    async confirmarEliminacion(clienteId) {
        try {
            console.log('🗑️ Eliminando cliente ID:', clienteId);
            
            // Eliminar de la base de datos
            await clientesService.eliminarCliente(clienteId);
            
            // Actualizar listas locales
            this.clientes = this.clientes.filter(c => c.id != clienteId);
            this.clientesFiltrados = this.clientesFiltrados.filter(c => c.id != clienteId);
            
            // Rerenderizar interfaz
            this.renderizarTabla();
            this.actualizarEstadisticas();
            
            // Cerrar modal
            this.cerrarModalConfirmacion();
            
            // Mostrar notificación de éxito
            this.mostrarNotificacion('Cliente eliminado exitosamente', 'success');
            
        } catch (error) {
            console.error('❌ Error al eliminar cliente:', error);
            this.mostrarNotificacion('Error al eliminar el cliente', 'error');
            this.cerrarModalConfirmacion();
        }
    }

    mostrarNotificacion(mensaje, tipo = 'info') {
        // Sistema simple de notificaciones
        const notificacion = document.createElement('div');
        notificacion.className = `notificacion notificacion-${tipo}`;
        notificacion.innerHTML = `
            <i class="fas fa-${tipo === 'success' ? 'check-circle' : tipo === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${mensaje}</span>
        `;
        
        document.body.appendChild(notificacion);
        
        // Auto-remover después de 3 segundos
        setTimeout(() => {
            notificacion?.remove();
        }, 3000);
    }

    async refrescarDatos() {
        console.log('🔄 Refrescando datos de clientes');
        await this.cargarClientes();
    }

    exportarDatos() {
        console.log('📥 Exportando datos de clientes');
        // Implementar exportación a CSV/Excel
    }

    ordenarPor(campo) {
        console.log('📊 Ordenando por:', campo);
        // Implementar ordenamiento de tabla
    }
}

// Exportar para uso en otros módulos
export default GestionClientes;

// Auto-inicializar si se carga directamente
if (typeof window !== 'undefined') {
    window.GestionClientes = GestionClientes;
}
