/**
 * Gestión de Clientes - Versión Compatible (Sin Módulos ES6)
 * Sistema FODEXA POS
 */

(function() {
    'use strict';
    
    // ===== CLASE FILA CLIENTE (Compatible) =====
    function FilaCliente(cliente, index, callbacks) {
        this.cliente = cliente;
        this.index = index;
        this.callbacks = callbacks || {};
    }

    FilaCliente.prototype.render = function() {
        const tr = document.createElement('tr');
        tr.className = 'cliente-row';
        tr.setAttribute('data-cliente-id', this.cliente.id);
        
        if (this.index % 2 === 0) {
            tr.classList.add('row-even');
        } else {
            tr.classList.add('row-odd');
        }

        tr.innerHTML = `
            <td class="td-nombre">
                <div class="cliente-info">
                    <div class="cliente-avatar">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="cliente-datos">
                        <span class="nombre-principal">${this.escapeHtml(this.cliente.nombre)}</span>
                        <span class="info-adicional">${this.formatearFechaRegistro(this.cliente.fechaRegistro)}</span>
                    </div>
                </div>
            </td>
            <td class="td-apellido">
                <span class="apellido-text">${this.escapeHtml(this.cliente.apellido)}</span>
            </td>
            <td class="td-telefono">
                <div class="telefono-container">
                    <i class="fas fa-phone telefono-icon"></i>
                    <a href="tel:${this.cliente.telefono}" class="telefono-link">
                        ${this.formatearTelefono(this.cliente.telefono)}
                    </a>
                    <button class="btn-copiar-telefono" title="Copiar teléfono" onclick="window.copiarTelefono('${this.cliente.telefono}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>
            <td class="td-direccion">
                <div class="direccion-container">
                    <i class="fas fa-map-marker-alt direccion-icon"></i>
                    <span class="direccion-text" title="${this.escapeHtml(this.cliente.direccion)}">
                        ${this.truncarTexto(this.cliente.direccion, 40)}
                    </span>
                    ${this.cliente.direccion.length > 40 ? '<button class="btn-ver-mas" title="Ver dirección completa"><i class="fas fa-eye"></i></button>' : ''}
                </div>
            </td>
            <td class="td-acciones">
                <div class="acciones-container">
                    <button class="btn btn-action btn-editar" 
                            title="Editar cliente"
                            data-cliente-id="${this.cliente.id}">
                        <i class="fas fa-edit"></i>
                        <span class="btn-text">Editar</span>
                    </button>
                    
                    <button class="btn btn-action btn-eliminar" 
                            title="Eliminar cliente"
                            data-cliente-id="${this.cliente.id}">
                        <i class="fas fa-trash"></i>
                        <span class="btn-text">Eliminar</span>
                    </button>
                    
                    <div class="dropdown-acciones">
                        <button class="btn btn-action btn-mas-acciones" title="Más acciones">
                            <i class="fas fa-ellipsis-v"></i>
                        </button>
                        <div class="dropdown-menu">
                            <button class="dropdown-item">
                                <i class="fas fa-eye"></i>
                                Ver Detalles
                            </button>
                            <button class="dropdown-item">
                                <i class="fas fa-history"></i>
                                Historial de Compras
                            </button>
                            <button class="dropdown-item">
                                <i class="fab fa-whatsapp"></i>
                                Enviar WhatsApp
                            </button>
                            <hr class="dropdown-divider">
                            <button class="dropdown-item text-danger">
                                <i class="fas fa-ban"></i>
                                Desactivar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        `;

        this.configurarEventosFila(tr);
        return tr;
    };

    FilaCliente.prototype.configurarEventosFila = function(tr) {
        const self = this;
        
        tr.addEventListener('click', function(e) {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                self.verDetallesCliente();
            }
        });

        const btnEditar = tr.querySelector('.btn-editar');
        if (btnEditar) {
            btnEditar.addEventListener('click', function(e) {
                e.stopPropagation();
                if (self.callbacks.onEditar) {
                    self.callbacks.onEditar(self.cliente.id);
                }
            });
        }

        const btnEliminar = tr.querySelector('.btn-eliminar');
        if (btnEliminar) {
            btnEliminar.addEventListener('click', function(e) {
                e.stopPropagation();
                if (self.callbacks.onEliminar) {
                    self.callbacks.onEliminar(self.cliente.id);
                }
            });
        }

        this.configurarDropdown(tr);
        this.configurarHoverEffects(tr);
    };

    FilaCliente.prototype.configurarDropdown = function(tr) {
        const btnDropdown = tr.querySelector('.btn-mas-acciones');
        const dropdownMenu = tr.querySelector('.dropdown-menu');
        
        if (btnDropdown && dropdownMenu) {
            btnDropdown.addEventListener('click', function(e) {
                e.stopPropagation();
                
                document.querySelectorAll('.dropdown-menu.show').forEach(function(menu) {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                    }
                });
                
                dropdownMenu.classList.toggle('show');
            });

            document.addEventListener('click', function(e) {
                if (!tr.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });
        }
    };

    FilaCliente.prototype.configurarHoverEffects = function(tr) {
        tr.addEventListener('mouseenter', function() {
            tr.classList.add('row-hover');
        });

        tr.addEventListener('mouseleave', function() {
            tr.classList.remove('row-hover');
        });
    };

    FilaCliente.prototype.escapeHtml = function(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    };

    FilaCliente.prototype.truncarTexto = function(texto, longitud) {
        if (texto.length <= longitud) {
            return texto;
        }
        return texto.substring(0, longitud) + '...';
    };

    FilaCliente.prototype.formatearTelefono = function(telefono) {
        const limpio = telefono.replace(/\D/g, '');
        if (limpio.length === 10) {
            return limpio.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        }
        return telefono;
    };

    FilaCliente.prototype.formatearFechaRegistro = function(fecha) {
        try {
            const fechaObj = new Date(fecha);
            const ahora = new Date();
            const diferencia = ahora - fechaObj;
            const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

            if (dias === 0) {
                return 'Registrado hoy';
            } else if (dias === 1) {
                return 'Registrado ayer';
            } else if (dias < 30) {
                return 'Registrado hace ' + dias + ' días';
            } else if (dias < 365) {
                const meses = Math.floor(dias / 30);
                return 'Registrado hace ' + meses + ' mes' + (meses > 1 ? 'es' : '');
            } else {
                return fechaObj.toLocaleDateString('es-CO');
            }
        } catch (error) {
            return 'Fecha no válida';
        }
    };

    FilaCliente.prototype.verDetallesCliente = function() {
        console.log('👁️ Viendo detalles del cliente:', this.cliente.nombre);
        window.showNotification('Ver detalles de ' + this.cliente.nombre, 'info');
    };

    // ===== CLASE GESTIÓN CLIENTES (Compatible) =====
    function GestionClientes() {
        this.clientes = [];
        this.clientesFiltrados = [];
        this.terminoBusqueda = '';
        this.init();
    }

    GestionClientes.prototype.init = function() {
        this.crearInterfaz();
        this.configurarEventos();
        this.cargarClientes();
    };

    GestionClientes.prototype.crearInterfaz = function() {
        const container = document.getElementById('app') || document.body;
        
        const interfazHTML = `
            <div class="gestion-clientes-container">
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
                                </tbody>
                            </table>

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

                            <div id="loading-state" class="loading-state hidden">
                                <div class="loading-content">
                                    <div class="loading-spinner"></div>
                                    <p>Cargando clientes...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

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
    };

    GestionClientes.prototype.configurarEventos = function() {
        const self = this;

        // Botón nuevo cliente
        const btnNuevoCliente = document.getElementById('btn-nuevo-cliente');
        if (btnNuevoCliente) {
            btnNuevoCliente.addEventListener('click', function() {
                self.abrirModalNuevoCliente();
            });
        }

        // Búsqueda en tiempo real
        const searchInput = document.getElementById('search-clientes');
        if (searchInput) {
            searchInput.addEventListener('input', function(e) {
                self.buscarClientes(e.target.value);
            });
        }

        // Limpiar búsqueda
        const btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');
        if (btnLimpiarBusqueda) {
            btnLimpiarBusqueda.addEventListener('click', function() {
                self.limpiarBusqueda();
            });
        }

        // Refrescar datos
        const btnRefrescar = document.getElementById('btn-refrescar');
        if (btnRefrescar) {
            btnRefrescar.addEventListener('click', function() {
                self.refrescarDatos();
            });
        }

        // Exportar datos
        const btnExportar = document.getElementById('btn-exportar');
        if (btnExportar) {
            btnExportar.addEventListener('click', function() {
                self.exportarDatos();
            });
        }

        // Botones de ordenamiento
        document.querySelectorAll('.sort-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                const campo = e.currentTarget.dataset.sort;
                self.ordenarPor(campo);
            });
        });

        this.configurarModalConfirmacion();

        // Botones de estado vacío
        const btnEmptyAction = document.querySelector('.btn-empty-action');
        if (btnEmptyAction) {
            btnEmptyAction.addEventListener('click', function() {
                self.abrirModalNuevoCliente();
            });
        }

        const btnLimpiarFiltros = document.getElementById('btn-limpiar-filtros');
        if (btnLimpiarFiltros) {
            btnLimpiarFiltros.addEventListener('click', function() {
                self.limpiarBusqueda();
            });
        }
    };

    GestionClientes.prototype.configurarModalConfirmacion = function() {
        const self = this;
        const modal = document.getElementById('modal-confirmar-eliminar');
        const btnCancelar = document.getElementById('btn-cancelar-eliminar');
        const btnCerrar = modal ? modal.querySelector('.modal-close') : null;

        if (btnCancelar) {
            btnCancelar.addEventListener('click', function() {
                self.cerrarModalConfirmacion();
            });
        }

        if (btnCerrar) {
            btnCerrar.addEventListener('click', function() {
                self.cerrarModalConfirmacion();
            });
        }

        if (modal) {
            const overlay = modal.querySelector('.modal-overlay');
            if (overlay) {
                overlay.addEventListener('click', function() {
                    self.cerrarModalConfirmacion();
                });
            }
        }
    };

    GestionClientes.prototype.cargarClientes = function() {
        const self = this;
        this.mostrarLoading(true);
        
        setTimeout(function() {
            self.clientes = self.obtenerClientesEjemplo();
            self.clientesFiltrados = self.clientes.slice();
            self.renderizarTabla();
            self.actualizarEstadisticas();
            self.mostrarLoading(false);
        }, 800);
    };

    GestionClientes.prototype.obtenerClientesEjemplo = function() {
        return [
            {
                id: 1,
                nombre: 'Juan Carlos',
                apellido: 'Rodríguez',
                telefono: '300 123 4567',
                direccion: 'Calle 50 #25-30, Bogotá DC',
                email: 'juan.rodriguez@email.com',
                fechaRegistro: '2024-01-15'
            },
            {
                id: 2,
                nombre: 'María Elena',
                apellido: 'García',
                telefono: '310 987 6543',
                direccion: 'Carrera 15 #80-45, Medellín, Antioquia',
                email: 'maria.garcia@email.com',
                fechaRegistro: '2024-02-20'
            },
            {
                id: 3,
                nombre: 'Carlos Alberto',
                apellido: 'Martínez',
                telefono: '320 456 7890',
                direccion: 'Avenida 19 #120-15, Cali, Valle del Cauca',
                email: 'carlos.martinez@email.com',
                fechaRegistro: '2024-03-10'
            },
            {
                id: 4,
                nombre: 'Ana Sofía',
                apellido: 'López',
                telefono: '315 234 5678',
                direccion: 'Calle 72 #11-45, Barranquilla, Atlántico',
                email: 'ana.lopez@email.com',
                fechaRegistro: '2024-03-25'
            },
            {
                id: 5,
                nombre: 'Diego Alejandro',
                apellido: 'Herrera',
                telefono: '301 345 6789',
                direccion: 'Transversal 45 #67-89, Bucaramanga, Santander',
                email: 'diego.herrera@email.com',
                fechaRegistro: '2024-04-02'
            }
        ];
    };

    GestionClientes.prototype.buscarClientes = function(termino) {
        this.terminoBusqueda = termino.toLowerCase().trim();
        
        if (!this.terminoBusqueda) {
            this.clientesFiltrados = this.clientes.slice();
        } else {
            const self = this;
            this.clientesFiltrados = this.clientes.filter(function(cliente) {
                return (
                    cliente.nombre.toLowerCase().includes(self.terminoBusqueda) ||
                    cliente.apellido.toLowerCase().includes(self.terminoBusqueda) ||
                    cliente.telefono.includes(self.terminoBusqueda) ||
                    cliente.direccion.toLowerCase().includes(self.terminoBusqueda)
                );
            });
        }

        this.renderizarTabla();
        this.actualizarEstadisticas();
        this.toggleBotonLimpiar();
    };

    GestionClientes.prototype.limpiarBusqueda = function() {
        const searchInput = document.getElementById('search-clientes');
        if (searchInput) {
            searchInput.value = '';
        }
        this.terminoBusqueda = '';
        this.clientesFiltrados = this.clientes.slice();
        this.renderizarTabla();
        this.actualizarEstadisticas();
        this.toggleBotonLimpiar();
    };

    GestionClientes.prototype.toggleBotonLimpiar = function() {
        const btnLimpiar = document.getElementById('btn-limpiar-busqueda');
        if (btnLimpiar) {
            if (this.terminoBusqueda) {
                btnLimpiar.classList.remove('hidden');
            } else {
                btnLimpiar.classList.add('hidden');
            }
        }
    };

    GestionClientes.prototype.renderizarTabla = function() {
        const tbody = document.getElementById('clientes-tbody');
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');
        const tableWrapper = document.querySelector('.table-wrapper table');

        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.clientes.length === 0) {
            this.mostrarEstadoVacio();
            return;
        }

        if (this.clientesFiltrados.length === 0) {
            this.mostrarEstadoSinResultados();
            return;
        }

        if (tableWrapper) tableWrapper.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (noResultsState) noResultsState.classList.add('hidden');

        const self = this;
        this.clientesFiltrados.forEach(function(cliente, index) {
            const filaCliente = new FilaCliente(cliente, index, {
                onEditar: function(id) { self.editarCliente(id); },
                onEliminar: function(id) { self.eliminarCliente(id); }
            });
            tbody.appendChild(filaCliente.render());
        });
    };

    GestionClientes.prototype.mostrarEstadoVacio = function() {
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');
        const tableWrapper = document.querySelector('.table-wrapper table');

        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (noResultsState) noResultsState.classList.add('hidden');
        if (emptyState) emptyState.classList.remove('hidden');
    };

    GestionClientes.prototype.mostrarEstadoSinResultados = function() {
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');
        const tableWrapper = document.querySelector('.table-wrapper table');
        const messageElement = document.getElementById('no-results-message');

        if (tableWrapper) tableWrapper.classList.add('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (noResultsState) noResultsState.classList.remove('hidden');

        if (messageElement) {
            messageElement.textContent = 'No se encontraron clientes que coincidan con "' + this.terminoBusqueda + '"';
        }
    };

    GestionClientes.prototype.mostrarLoading = function(mostrar) {
        const loadingState = document.getElementById('loading-state');
        const tableWrapper = document.querySelector('.table-wrapper table');
        const emptyState = document.getElementById('empty-state');
        const noResultsState = document.getElementById('no-results-state');

        if (mostrar) {
            if (loadingState) loadingState.classList.remove('hidden');
            if (tableWrapper) tableWrapper.classList.add('hidden');
            if (emptyState) emptyState.classList.add('hidden');
            if (noResultsState) noResultsState.classList.add('hidden');
        } else {
            if (loadingState) loadingState.classList.add('hidden');
        }
    };

    GestionClientes.prototype.actualizarEstadisticas = function() {
        const statsElement = document.getElementById('search-stats-text');
        if (statsElement) {
            const total = this.clientesFiltrados.length;
            const totalOriginal = this.clientes.length;
            
            if (this.terminoBusqueda) {
                statsElement.textContent = total + ' de ' + totalOriginal + ' clientes encontrados';
            } else {
                statsElement.textContent = total + ' clientes registrados';
            }
        }
    };

    GestionClientes.prototype.abrirModalNuevoCliente = function() {
        console.log('🆕 Abriendo modal de nuevo cliente');
        window.showNotification('Funcionalidad de nuevo cliente - En desarrollo', 'info');
    };

    GestionClientes.prototype.editarCliente = function(clienteId) {
        console.log('✏️ Editando cliente ID:', clienteId);
        const cliente = this.clientes.find(function(c) { return c.id === clienteId; });
        if (cliente) {
            window.showNotification('Editando: ' + cliente.nombre + ' ' + cliente.apellido, 'info');
        }
    };

    GestionClientes.prototype.eliminarCliente = function(clienteId) {
        const self = this;
        const cliente = this.clientes.find(function(c) { return c.id === clienteId; });
        if (!cliente) return;

        this.mostrarModalConfirmacion(cliente);
    };

    GestionClientes.prototype.mostrarModalConfirmacion = function(cliente) {
        const self = this;
        const modal = document.getElementById('modal-confirmar-eliminar');
        const message = document.getElementById('confirm-message');
        const btnConfirmar = document.getElementById('btn-confirmar-eliminar');

        if (message) {
            message.textContent = '¿Estás seguro de que deseas eliminar a ' + cliente.nombre + ' ' + cliente.apellido + '?';
        }

        if (btnConfirmar) {
            btnConfirmar.onclick = function() {
                self.confirmarEliminacion(cliente.id);
            };
        }

        if (modal) {
            modal.classList.remove('hidden');
        }
    };

    GestionClientes.prototype.cerrarModalConfirmacion = function() {
        const modal = document.getElementById('modal-confirmar-eliminar');
        if (modal) {
            modal.classList.add('hidden');
        }
    };

    GestionClientes.prototype.confirmarEliminacion = function(clienteId) {
        console.log('🗑️ Eliminando cliente ID:', clienteId);
        
        const self = this;
        this.clientes = this.clientes.filter(function(c) { return c.id !== clienteId; });
        this.clientesFiltrados = this.clientesFiltrados.filter(function(c) { return c.id !== clienteId; });
        
        this.renderizarTabla();
        this.actualizarEstadisticas();
        this.cerrarModalConfirmacion();
        
        if (window.showNotification) {
            window.showNotification('Cliente eliminado exitosamente', 'success');
        }
    };

    GestionClientes.prototype.refrescarDatos = function() {
        console.log('🔄 Refrescando datos de clientes');
        window.showNotification('Actualizando datos...', 'info');
        this.cargarClientes();
    };

    GestionClientes.prototype.exportarDatos = function() {
        console.log('📥 Exportando datos de clientes');
        window.showNotification('Funcionalidad de exportación - En desarrollo', 'info');
    };

    GestionClientes.prototype.ordenarPor = function(campo) {
        console.log('📊 Ordenando por:', campo);
        window.showNotification('Ordenando por ' + campo, 'info');
    };

    // Inicializar cuando el DOM esté listo
    document.addEventListener('DOMContentLoaded', function() {
        // Crear instancia global
        window.gestionClientes = new GestionClientes();
        
        console.log('✅ Gestión de Clientes cargada (versión compatible)');
        window.showNotification('Sistema cargado exitosamente', 'success');
    });

    // Hacer disponibles globalmente
    window.GestionClientes = GestionClientes;
    window.FilaCliente = FilaCliente;

})();
