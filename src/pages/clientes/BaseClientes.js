/**
 * BaseClientes - Vista de Base de Datos de Clientes
 * Sistema FODEXA POS - Gestión completa de clientes
 */

import clientesService from '../../services/clientesService.js';

class BaseClientes {
    constructor() {
        this.clientes = [];
        this.clientesFiltrados = [];
        this.terminoBusqueda = '';
        this.clienteSeleccionadoParaEliminar = null;
        this.init();
    }

    async init() {
        console.log('🗄️ Inicializando vista de Base de Datos de Clientes');
        
        try {
            this.crearInterfaz();
            this.configurarEventos();
            await this.cargarClientes();
        } catch (error) {
            console.error('❌ Error al inicializar BaseClientes:', error);
            this.mostrarError('Error al inicializar la vista de clientes');
        }
    }

    crearInterfaz() {
        const container = document.getElementById('app') || document.body;
        
        container.innerHTML = `
            <div class="base-clientes-container">
                <!-- Header Principal -->
                <div class="header-principal">
                    <div class="header-contenido">
                        <button id="btn-volver" class="btn-volver" title="Volver">
                            <i class="fas fa-arrow-left"></i>
                        </button>
                        <div class="titulo-seccion">
                            <h1>
                                <i class="fas fa-database"></i>
                                Base de Datos de Clientes
                            </h1>
                            <p class="subtitulo">Gestiona todos los clientes registrados en el sistema</p>
                        </div>
                    </div>
                    <div class="header-acciones">
                        <button id="btn-nuevo-cliente" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Nuevo Cliente
                        </button>
                        <button id="btn-refrescar" class="btn btn-secondary" title="Refrescar datos">
                            <i class="fas fa-sync-alt"></i>
                        </button>
                    </div>
                </div>

                <!-- Barra de Búsqueda -->
                <div class="busqueda-seccion">
                    <div class="busqueda-container">
                        <div class="busqueda-input-wrapper">
                            <i class="fas fa-search busqueda-icon"></i>
                            <input 
                                type="text" 
                                id="busqueda-clientes" 
                                class="busqueda-input" 
                                placeholder="Buscar por nombre o teléfono..."
                                autocomplete="off"
                            >
                            <button id="btn-limpiar-busqueda" class="btn-limpiar-busqueda hidden" title="Limpiar búsqueda">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    </div>
                    <div class="busqueda-info">
                        <span id="conteo-clientes">0 clientes</span>
                    </div>
                </div>

                <!-- Tabla de Clientes -->
                <div class="tabla-seccion">
                    <div id="loading-clientes" class="loading-container hidden">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner fa-spin"></i>
                        </div>
                        <p>Cargando clientes...</p>
                    </div>

                    <div id="tabla-wrapper" class="tabla-wrapper">
                        <table class="clientes-tabla">
                            <thead>
                                <tr>
                                    <th>Nombre</th>
                                    <th>Teléfono</th>
                                    <th>Documento</th>
                                    <th>Direccion Principal</th>
                                    <th>Email</th>
                                    <th>Fecha Registro</th>
                                    <th class="acciones-header">Acciones</th>
                                </tr>
                            </thead>
                            <tbody id="clientes-tbody">
                                <!-- Los clientes se cargarán aquí -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Estado Vacío -->
                    <div id="estado-vacio" class="estado-vacio hidden">
                        <div class="estado-icono">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3>No hay clientes registrados</h3>
                        <p>Comienza agregando tu primer cliente al sistema</p>
                        <button id="btn-agregar-primer-cliente" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Agregar Primer Cliente
                        </button>
                    </div>

                    <!-- Sin Resultados -->
                    <div id="sin-resultados" class="estado-vacio hidden">
                        <div class="estado-icono">
                            <i class="fas fa-search"></i>
                        </div>
                        <h3>Sin resultados</h3>
                        <p>No se encontraron clientes que coincidan con "<span id="termino-busqueda"></span>"</p>
                        <button id="btn-limpiar-filtros" class="btn btn-secondary">
                            <i class="fas fa-times"></i>
                            Limpiar Búsqueda
                        </button>
                    </div>
                </div>

                <!-- Modal de Confirmación para Eliminar -->
                <div id="modal-confirmar-eliminar" class="modal hidden">
                    <div class="modal-overlay"></div>
                    <div class="modal-content modal-small">
                        <div class="modal-header">
                            <h3>
                                <i class="fas fa-exclamation-triangle text-warning"></i>
                                Confirmar Eliminación
                            </h3>
                            <button class="modal-close" onclick="baseClientes.cerrarModalEliminar()">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <p id="mensaje-confirmacion">¿Estás seguro de que deseas eliminar este cliente?</p>
                            <p class="texto-advertencia">
                                <i class="fas fa-info-circle"></i>
                                Esta acción no se puede deshacer
                            </p>
                        </div>
                        <div class="modal-footer">
                            <button id="btn-cancelar-eliminar" class="btn btn-secondary">
                                <i class="fas fa-times"></i>
                                Cancelar
                            </button>
                            <button id="btn-confirmar-eliminar" class="btn btn-danger">
                                <i class="fas fa-trash"></i>
                                Eliminar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    configurarEventos() {
        // Botón volver
        document.getElementById('btn-volver')?.addEventListener('click', () => {
            this.volverAtras();
        });

        // Nuevo cliente
        document.getElementById('btn-nuevo-cliente')?.addEventListener('click', () => {
            this.abrirFormularioNuevoCliente();
        });

        // Refrescar
        document.getElementById('btn-refrescar')?.addEventListener('click', () => {
            this.cargarClientes();
        });

        // Búsqueda en tiempo real
        const busquedaInput = document.getElementById('busqueda-clientes');
        if (busquedaInput) {
            let timeoutBusqueda;
            busquedaInput.addEventListener('input', (e) => {
                clearTimeout(timeoutBusqueda);
                timeoutBusqueda = setTimeout(() => {
                    this.procesarBusqueda(e.target.value);
                }, 300);
            });
        }

        // Limpiar búsqueda
        document.getElementById('btn-limpiar-busqueda')?.addEventListener('click', () => {
            this.limpiarBusqueda();
        });

        // Botones de estado vacío
        document.getElementById('btn-agregar-primer-cliente')?.addEventListener('click', () => {
            this.abrirFormularioNuevoCliente();
        });

        document.getElementById('btn-limpiar-filtros')?.addEventListener('click', () => {
            this.limpiarBusqueda();
        });

        // Modal de eliminación
        document.getElementById('btn-cancelar-eliminar')?.addEventListener('click', () => {
            this.cerrarModalEliminar();
        });

        document.getElementById('btn-confirmar-eliminar')?.addEventListener('click', () => {
            this.confirmarEliminacion();
        });

        // Cerrar modal al hacer clic en overlay
        document.querySelector('.modal-overlay')?.addEventListener('click', () => {
            this.cerrarModalEliminar();
        });
    }

    async cargarClientes() {
        try {
            this.mostrarLoading(true);
            console.log('📊 Cargando clientes desde la base de datos...');
            
            // Inicializar servicio si no está listo
            if (!clientesService.isInitialized) {
                await clientesService.init();
            }
            
            // Obtener clientes
            this.clientes = await clientesService.obtenerTodosLosClientes();
            this.clientesFiltrados = [...this.clientes];
            
            console.log(`✅ Cargados ${this.clientes.length} clientes`);
            
            this.renderizarTabla();
            this.actualizarConteo();
            
        } catch (error) {
            console.error('❌ Error al cargar clientes:', error);
            this.mostrarError('Error al cargar los datos de clientes');
        } finally {
            this.mostrarLoading(false);
        }
    }

    async procesarBusqueda(termino) {
        try {
            this.terminoBusqueda = termino.trim();
            console.log('🔍 Procesando búsqueda:', this.terminoBusqueda);
            
            if (this.terminoBusqueda === '') {
                this.clientesFiltrados = [...this.clientes];
            } else {
                this.clientesFiltrados = await clientesService.buscarClientes(this.terminoBusqueda);
            }
            
            this.renderizarTabla();
            this.actualizarConteo();
            this.toggleBotonLimpiar();
            
        } catch (error) {
            console.error('❌ Error en búsqueda:', error);
            this.clientesFiltrados = [...this.clientes];
            this.renderizarTabla();
        }
    }

    renderizarTabla() {
        const tbody = document.getElementById('clientes-tbody');
        const tablaWrapper = document.getElementById('tabla-wrapper');
        const estadoVacio = document.getElementById('estado-vacio');
        const sinResultados = document.getElementById('sin-resultados');

        if (!tbody) return;

        // Limpiar tabla
        tbody.innerHTML = '';

        // Determinar qué mostrar
        if (this.clientes.length === 0) {
            // No hay clientes en absoluto
            tablaWrapper.classList.add('hidden');
            estadoVacio.classList.remove('hidden');
            sinResultados.classList.add('hidden');
            return;
        }

        if (this.clientesFiltrados.length === 0 && this.terminoBusqueda) {
            // Hay clientes pero no coinciden con la búsqueda
            tablaWrapper.classList.add('hidden');
            estadoVacio.classList.add('hidden');
            sinResultados.classList.remove('hidden');
            document.getElementById('termino-busqueda').textContent = this.terminoBusqueda;
            return;
        }

        // Mostrar tabla con clientes
        tablaWrapper.classList.remove('hidden');
        estadoVacio.classList.add('hidden');
        sinResultados.classList.add('hidden');

        // Renderizar filas de clientes
        this.clientesFiltrados.forEach(cliente => {
            const fila = this.crearFilaCliente(cliente);
            tbody.appendChild(fila);
        });
    }

    crearFilaCliente(cliente) {
        const fila = document.createElement('tr');
        fila.className = 'fila-cliente';
        fila.setAttribute('data-cliente-id', cliente.id);

        // Preparar datos
        const nombre = cliente.nombre || 'Sin nombre';
        const telefono = cliente.telefonoWhatsapp || cliente.telefono || cliente.whatsapp || '-';
        const documento = cliente.documentoIdentidad || cliente.documento || '-';
        const email = cliente.email || '-';
        
        // Dirección principal (primera dirección o dirección única)
        let direccionPrincipal = '-';
        if (cliente.direcciones && cliente.direcciones.length > 0) {
            direccionPrincipal = cliente.direcciones[0];
            if (cliente.direcciones.length > 1) {
                direccionPrincipal += ` (+${cliente.direcciones.length - 1} más)`;
            }
        } else if (cliente.direccion) {
            direccionPrincipal = cliente.direccion;
        }

        // Fecha de registro
        const fechaRegistro = cliente.fechaCreacion ? 
            new Date(cliente.fechaCreacion).toLocaleDateString('es-CO') : '-';

        fila.innerHTML = `
            <td class="celda-nombre">
                <div class="cliente-info">
                    <span class="nombre-principal">${nombre}</span>
                </div>
            </td>
            <td class="celda-telefono">
                <span class="telefono">${telefono}</span>
            </td>
            <td class="celda-documento">
                <span class="documento">${documento}</span>
            </td>
            <td class="celda-direccion">
                <span class="direccion" title="${direccionPrincipal}">${direccionPrincipal}</span>
            </td>
            <td class="celda-email">
                <span class="email">${email}</span>
            </td>
            <td class="celda-fecha">
                <span class="fecha">${fechaRegistro}</span>
            </td>
            <td class="celda-acciones">
                <div class="acciones-grupo">
                    <button class="btn-accion btn-editar" 
                            onclick="baseClientes.editarCliente(${cliente.id})" 
                            title="Editar cliente">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-accion btn-eliminar" 
                            onclick="baseClientes.eliminarCliente(${cliente.id})" 
                            title="Eliminar cliente">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return fila;
    }

    async eliminarCliente(clienteId) {
        try {
            const cliente = this.clientes.find(c => c.id == clienteId);
            if (!cliente) {
                this.mostrarNotificacion('Cliente no encontrado', 'error');
                return;
            }

            this.clienteSeleccionadoParaEliminar = cliente;
            this.mostrarModalEliminar(cliente);

        } catch (error) {
            console.error('❌ Error al preparar eliminación:', error);
            this.mostrarNotificacion('Error al eliminar cliente', 'error');
        }
    }

    mostrarModalEliminar(cliente) {
        const modal = document.getElementById('modal-confirmar-eliminar');
        const mensaje = document.getElementById('mensaje-confirmacion');

        if (mensaje) {
            const nombreCompleto = cliente.nombre;
            mensaje.textContent = `¿Estás seguro de que deseas eliminar a ${nombreCompleto}?`;
        }

        modal?.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    cerrarModalEliminar() {
        const modal = document.getElementById('modal-confirmar-eliminar');
        modal?.classList.add('hidden');
        document.body.style.overflow = 'auto';
        this.clienteSeleccionadoParaEliminar = null;
    }

    async confirmarEliminacion() {
        if (!this.clienteSeleccionadoParaEliminar) return;

        try {
            console.log('🗑️ Eliminando cliente:', this.clienteSeleccionadoParaEliminar.nombre);
            
            await clientesService.eliminarCliente(this.clienteSeleccionadoParaEliminar.id);
            
            // Actualizar listas locales
            this.clientes = this.clientes.filter(c => c.id != this.clienteSeleccionadoParaEliminar.id);
            this.clientesFiltrados = this.clientesFiltrados.filter(c => c.id != this.clienteSeleccionadoParaEliminar.id);
            
            // Actualizar vista
            this.renderizarTabla();
            this.actualizarConteo();
            
            this.mostrarNotificacion('Cliente eliminado exitosamente', 'success');
            this.cerrarModalEliminar();

        } catch (error) {
            console.error('❌ Error al eliminar cliente:', error);
            this.mostrarNotificacion('Error al eliminar el cliente', 'error');
        }
    }

    editarCliente(clienteId) {
        console.log('✏️ Editando cliente ID:', clienteId);
        // TODO: Implementar funcionalidad de edición
        this.mostrarNotificacion('Funcionalidad de edición en desarrollo', 'info');
    }

    limpiarBusqueda() {
        const busquedaInput = document.getElementById('busqueda-clientes');
        if (busquedaInput) {
            busquedaInput.value = '';
        }
        
        this.terminoBusqueda = '';
        this.clientesFiltrados = [...this.clientes];
        this.renderizarTabla();
        this.actualizarConteo();
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

    actualizarConteo() {
        const conteoElement = document.getElementById('conteo-clientes');
        if (conteoElement) {
            const total = this.clientesFiltrados.length;
            const texto = total === 1 ? 'cliente' : 'clientes';
            
            if (this.terminoBusqueda) {
                conteoElement.textContent = `${total} ${texto} encontrados`;
            } else {
                conteoElement.textContent = `${total} ${texto}`;
            }
        }
    }

    mostrarLoading(mostrar) {
        const loading = document.getElementById('loading-clientes');
        if (loading) {
            if (mostrar) {
                loading.classList.remove('hidden');
            } else {
                loading.classList.add('hidden');
            }
        }
    }

    abrirFormularioNuevoCliente() {
        console.log('➕ Abriendo formulario de nuevo cliente');
        // TODO: Implementar modal de nuevo cliente
        this.mostrarNotificacion('Formulario de nuevo cliente en desarrollo', 'info');
    }

    volverAtras() {
        console.log('🔙 Volviendo atrás desde BaseClientes');
        
        // Determinar a dónde volver basado en el origen
        const origen = sessionStorage.getItem('base_clientes_origen') || 'dashboard';
        
        if (origen === 'ventas') {
            window.location.href = '../../modulos/ventas/ventas.html';
        } else {
            window.location.href = '../../index.html';
        }
    }

    mostrarError(mensaje) {
        console.error('❌', mensaje);
        this.mostrarNotificacion(mensaje, 'error');
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
}

// Crear instancia global
const baseClientes = new BaseClientes();

// Exportar para uso en módulos
export default BaseClientes;

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.baseClientes = baseClientes;
}

// ===== FUNCIONES AUXILIARES PARA DEBUGGING =====

/**
 * Función global para debugging de clientes
 */
window.debugBaseClientes = async function() {
    console.log('🔍 === DEBUG BASE CLIENTES ===');
    
    try {
        const estadisticas = await clientesService.verificarEstado();
        
        console.log('📊 Estadísticas completas:', estadisticas);
        console.log('🗄️ Estado del servicio:', {
            inicializado: clientesService.isInitialized,
            tieneDB: !!clientesService.db
        });
        
        if (window.baseClientes) {
            console.log('🎯 Estado de la vista:', {
                totalClientes: window.baseClientes.clientes.length,
                filtrados: window.baseClientes.clientesFiltrados.length,
                terminoBusqueda: window.baseClientes.terminoBusqueda
            });
        }
        
        return estadisticas;
        
    } catch (error) {
        console.error('❌ Error en debug:', error);
        return null;
    }
};
