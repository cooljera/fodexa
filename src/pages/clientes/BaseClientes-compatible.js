/**
 * BaseClientes - Gestión de Base de Datos de Clientes (Versión compatible sin ES6 modules)
 * Autor: Asistente IA - Optimizado para FODEXA
 * Fecha: 2024
 * 
 * Funcionalidades:
 * - Visualización en tabla responsiva
 * - Búsqueda en tiempo real
 * - Filtros avanzados
 * - Paginación inteligente
 * - Eliminación con confirmación
 * - Navegación inteligente
 * - Integración completa con IndexedDB
 */

// Clase BaseClientes - versión compatible sin ES6 modules
var BaseClientes = (function() {
    'use strict';

    function BaseClientes() {
        console.log('🚀 Inicializando BaseClientes (versión compatible)');
        
        this.clientes = [];
        this.clientesFiltrados = [];
        this.paginaActual = 1;
        this.clientesPorPagina = 10;
        this.filtroActual = '';
        this.origenNavegacion = null;
        this.ordenActual = {
            campo: 'nombre',
            direccion: 'asc'
        };
        
        // Referencias a elementos DOM
        this.elementos = {};
        
        // Configuración
        this.config = {
            busquedaDelay: 300,
            animacionDuracion: 300,
            debug: true
        };

        // Inicializar
        this.init();
    }

    // Inicialización principal
    BaseClientes.prototype.init = function() {
        var self = this;
        
        console.log('🔧 Configurando BaseClientes...');
        
        // Detectar origen de navegación
        this.detectarOrigenNavegacion();
        
        // Crear la interfaz
        this.crearInterfaz();
        
        // Configurar event listeners
        this.configurarEventListeners();
        
        // Cargar datos
        this.cargarClientes().then(function() {
            console.log('✅ BaseClientes configurado completamente');
        }).catch(function(error) {
            console.error('❌ Error en configuración:', error);
            self.mostrarError('Error al cargar los datos de clientes');
        });
    };

    // Detectar origen de navegación
    BaseClientes.prototype.detectarOrigenNavegacion = function() {
        try {
            var origenGuardado = sessionStorage.getItem('origen_navegacion_clientes');
            if (origenGuardado) {
                this.origenNavegacion = origenGuardado;
                console.log('📍 Origen detectado:', this.origenNavegacion);
                
                // Limpiar para próxima navegación
                sessionStorage.removeItem('origen_navegacion_clientes');
            }
        } catch (error) {
            console.warn('⚠️ No se pudo detectar origen de navegación:', error);
        }
    };

    // Crear la interfaz de usuario
    BaseClientes.prototype.crearInterfaz = function() {
        var appContainer = document.getElementById('app');
        if (!appContainer) {
            console.error('❌ No se encontró el contenedor #app');
            return;
        }

        // Agregar la clase container principal
        if (!appContainer.classList.contains('base-clientes-container')) {
            appContainer.className = 'base-clientes-container';
        }

        var interfazHTML = `
            <!-- Header Principal -->
            <div class="header-principal">
                <div class="header-contenido">
                    <button id="btn-volver" class="btn-volver" title="Volver">
                        <i class="fas fa-arrow-left"></i>
                    </button>
                    <div class="titulo-seccion">
                        <h1><i class="fas fa-users"></i> Base de Datos de Clientes</h1>
                        <p class="subtitulo">Gestiona y visualiza todos tus clientes registrados</p>
                    </div>
                </div>
                <div class="header-acciones">
                    <div class="stats-section">
                        <div class="stat-card">
                            <span class="stat-number" id="total-clientes">0</span>
                            <span class="stat-label">Total Clientes</span>
                        </div>
                        <div class="stat-card">
                            <span class="stat-number" id="clientes-activos">0</span>
                            <span class="stat-label">Activos</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sección de Búsqueda -->
            <div class="busqueda-seccion">
                <div class="busqueda-container">
                    <div class="busqueda-input-wrapper">
                        <i class="fas fa-search busqueda-icon"></i>
                        <input 
                            type="text" 
                            id="busqueda-clientes" 
                            class="busqueda-input"
                            placeholder="Buscar por nombre, cédula, teléfono o dirección..."
                            autocomplete="off"
                        >
                        <button id="btn-limpiar-busqueda" class="btn-limpiar-busqueda" title="Limpiar búsqueda">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
                <div class="busqueda-info">
                    <span id="info-resultados">Mostrando todos los clientes</span>
                </div>
            </div>

            <!-- Controles y Filtros -->
            <div class="controles-seccion">
                <div class="filtros-rapidos">
                    <button class="filter-chip active" data-filtro="todos">
                        <i class="fas fa-users"></i> Todos
                    </button>
                    <button class="filter-chip" data-filtro="activos">
                        <i class="fas fa-user-check"></i> Activos
                    </button>
                    <button class="filter-chip" data-filtro="nuevos">
                        <i class="fas fa-user-plus"></i> Nuevos (30 días)
                    </button>
                </div>
                <div class="acciones-principales">
                    <button id="btn-agregar-cliente" class="btn btn-primary">
                        <i class="fas fa-plus"></i> Agregar Cliente
                    </button>
                    <button id="btn-actualizar" class="btn btn-secondary">
                        <i class="fas fa-sync-alt"></i> Actualizar
                    </button>
                    <button id="btn-exportar" class="btn btn-secondary">
                        <i class="fas fa-download"></i> Exportar
                    </button>
                </div>
            </div>

            <!-- Tabla de Clientes -->
            <div class="tabla-seccion">
                <div class="tabla-wrapper">
                    <!-- Indicador de carga -->
                    <div id="loading-indicator" class="loading-container">
                        <div class="loading-spinner">
                            <i class="fas fa-spinner"></i>
                        </div>
                        <div class="loading-text">Cargando clientes...</div>
                    </div>

                    <!-- Tabla principal -->
                    <table id="tabla-clientes" class="clientes-tabla" style="display: none;">
                        <thead>
                            <tr>
                                <th class="sortable" data-campo="nombre">
                                    <i class="fas fa-user"></i> Nombre
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="sortable" data-campo="cedula">
                                    <i class="fas fa-id-card"></i> Cédula
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="sortable" data-campo="telefono">
                                    <i class="fas fa-phone"></i> Teléfono
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="sortable" data-campo="direccion1">
                                    <i class="fas fa-map-marker-alt"></i> Dirección 1
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="direccion2-header">
                                    <i class="fas fa-home"></i> Dirección 2
                                </th>
                                <th class="sortable" data-campo="notas">
                                    <i class="fas fa-sticky-note"></i> Notas
                                    <i class="fas fa-sort sort-icon"></i>
                                </th>
                                <th class="acciones-header">
                                    <i class="fas fa-cogs"></i> Acciones
                                </th>
                            </tr>
                        </thead>
                        <tbody id="tbody-clientes">
                            <!-- Los datos se cargarán aquí -->
                        </tbody>
                    </table>

                    <!-- Estado vacío -->
                    <div id="mensaje-vacio" class="estado-vacio" style="display: none;">
                        <div class="estado-icono">
                            <i class="fas fa-users"></i>
                        </div>
                        <h3>No hay clientes registrados aún</h3>
                        <p>¡Agrega el primer cliente para comenzar!</p>
                        <button id="btn-agregar-primero" class="btn btn-primary">
                            <i class="fas fa-plus"></i> Agregar Primer Cliente
                        </button>
                    </div>
                </div>
            </div>

            <!-- Paginación -->
            <div id="paginacion-section" class="pagination-section">
                <div class="pagination-info">
                    <span id="info-paginacion">Mostrando 0 de 0 clientes</span>
                </div>
                <div class="pagination-controls">
                    <button id="btn-primera-pagina" class="btn-pagination" title="Primera página">
                        <i class="fas fa-angle-double-left"></i>
                    </button>
                    <button id="btn-pagina-anterior" class="btn-pagination" title="Página anterior">
                        <i class="fas fa-angle-left"></i>
                    </button>
                    <div class="pagination-numbers" id="numeros-paginacion">
                        <!-- Los números se generarán dinámicamente -->
                    </div>
                    <button id="btn-pagina-siguiente" class="btn-pagination" title="Página siguiente">
                        <i class="fas fa-angle-right"></i>
                    </button>
                    <button id="btn-ultima-pagina" class="btn-pagination" title="Última página">
                        <i class="fas fa-angle-double-right"></i>
                    </button>
                </div>
            </div>

            <!-- Área de notificaciones -->
            <div id="notificaciones-container" class="notificaciones-container">
                <!-- Las notificaciones aparecerán aquí -->
            </div>

            <!-- Modal de confirmación de eliminación -->
            <div id="modal-confirmar-eliminacion" class="modal" style="display: none;">
                <div class="modal-overlay"></div>
                <div class="modal-content modal-small">
                    <div class="modal-header">
                        <h3><i class="fas fa-exclamation-triangle text-warning"></i> Confirmar Eliminación</h3>
                        <button class="modal-close" id="btn-cerrar-modal">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <p>¿Está seguro de que desea eliminar este cliente?</p>
                        <div class="client-info" id="info-cliente-eliminar">
                            <!-- Información del cliente a eliminar -->
                        </div>
                        <div class="texto-advertencia">
                            <i class="fas fa-exclamation-triangle"></i>
                            Esta acción no se puede deshacer.
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button id="btn-cancelar-eliminacion" class="btn btn-secondary">
                            <i class="fas fa-times"></i> Cancelar
                        </button>
                        <button id="btn-confirmar-eliminacion" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Eliminar Cliente
                        </button>
                    </div>
                </div>
            </div>
        `;

        appContainer.innerHTML = interfazHTML;
        console.log('🎨 Interfaz profesional creada exitosamente');
    };

    // Configurar event listeners
    BaseClientes.prototype.configurarEventListeners = function() {
        var self = this;

        // Botón volver
        var btnVolver = document.getElementById('btn-volver');
        if (btnVolver) {
            btnVolver.addEventListener('click', function() {
                self.manejarVolver();
            });
        }

        // Búsqueda
        var inputBusqueda = document.getElementById('busqueda-clientes');
        if (inputBusqueda) {
            var timeoutBusqueda;
            inputBusqueda.addEventListener('input', function(e) {
                clearTimeout(timeoutBusqueda);
                timeoutBusqueda = setTimeout(function() {
                    self.procesarBusqueda(e.target.value);
                }, self.config.busquedaDelay);
            });
        }

        // Limpiar búsqueda
        var btnLimpiarBusqueda = document.getElementById('btn-limpiar-busqueda');
        if (btnLimpiarBusqueda) {
            btnLimpiarBusqueda.addEventListener('click', function() {
                self.limpiarBusqueda();
            });
        }

        // Botón actualizar
        var btnActualizar = document.getElementById('btn-actualizar');
        if (btnActualizar) {
            btnActualizar.addEventListener('click', function() {
                self.cargarClientes();
            });
        }

        // Filtros rápidos
        var filterChips = document.querySelectorAll('.filter-chip');
        filterChips.forEach(function(chip) {
            chip.addEventListener('click', function() {
                self.aplicarFiltroRapido(this.dataset.filtro);
                
                // Actualizar estado visual
                filterChips.forEach(function(c) { c.classList.remove('active'); });
                this.classList.add('active');
            });
        });

        // Modal de eliminación
        this.configurarModalEliminacion();

        // Paginación
        this.configurarPaginacion();

        // Ordenamiento
        this.configurarOrdenamiento();

        console.log('🔧 Event listeners configurados');
    };

    // Configurar modal de eliminación
    BaseClientes.prototype.configurarModalEliminacion = function() {
        var self = this;
        var modal = document.getElementById('modal-confirmar-eliminacion');
        var btnCerrar = document.getElementById('btn-cerrar-modal');
        var btnCancelar = document.getElementById('btn-cancelar-eliminacion');
        var btnConfirmar = document.getElementById('btn-confirmar-eliminacion');

        function cerrarModal() {
            modal.style.display = 'none';
            self.clienteAEliminar = null;
        }

        if (btnCerrar) btnCerrar.addEventListener('click', cerrarModal);
        if (btnCancelar) btnCancelar.addEventListener('click', cerrarModal);
        
        if (btnConfirmar) {
            btnConfirmar.addEventListener('click', function() {
                if (self.clienteAEliminar) {
                    self.ejecutarEliminacion(self.clienteAEliminar);
                }
                cerrarModal();
            });
        }

        // Cerrar al hacer clic fuera del modal
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                cerrarModal();
            }
        });
    };

    // Configurar paginación
    BaseClientes.prototype.configurarPaginacion = function() {
        var self = this;
        
        var btnPrimera = document.getElementById('btn-primera-pagina');
        var btnAnterior = document.getElementById('btn-pagina-anterior');
        var btnSiguiente = document.getElementById('btn-pagina-siguiente');
        var btnUltima = document.getElementById('btn-ultima-pagina');

        if (btnPrimera) {
            btnPrimera.addEventListener('click', function() {
                self.irAPagina(1);
            });
        }

        if (btnAnterior) {
            btnAnterior.addEventListener('click', function() {
                if (self.paginaActual > 1) {
                    self.irAPagina(self.paginaActual - 1);
                }
            });
        }

        if (btnSiguiente) {
            btnSiguiente.addEventListener('click', function() {
                var totalPaginas = Math.ceil(self.clientesFiltrados.length / self.clientesPorPagina);
                if (self.paginaActual < totalPaginas) {
                    self.irAPagina(self.paginaActual + 1);
                }
            });
        }

        if (btnUltima) {
            btnUltima.addEventListener('click', function() {
                var totalPaginas = Math.ceil(self.clientesFiltrados.length / self.clientesPorPagina);
                self.irAPagina(totalPaginas);
            });
        }
    };

    // Configurar ordenamiento
    BaseClientes.prototype.configurarOrdenamiento = function() {
        var self = this;
        
        var headersSortable = document.querySelectorAll('.sortable');
        headersSortable.forEach(function(header) {
            header.addEventListener('click', function() {
                var campo = this.dataset.campo;
                self.ordenarPor(campo);
                
                // Actualizar indicadores visuales
                headersSortable.forEach(function(h) {
                    var icon = h.querySelector('.sort-icon');
                    if (icon) {
                        icon.className = 'fas fa-sort sort-icon';
                    }
                });
                
                var iconActual = this.querySelector('.sort-icon');
                if (iconActual) {
                    if (self.ordenActual.campo === campo) {
                        iconActual.className = self.ordenActual.direccion === 'asc' ? 
                            'fas fa-sort-up sort-icon' : 'fas fa-sort-down sort-icon';
                    }
                }
            });
        });
    };

    // Función de ordenamiento
    BaseClientes.prototype.ordenarPor = function(campo) {
        var self = this;
        
        // Si es el mismo campo, cambiar dirección
        if (self.ordenActual.campo === campo) {
            self.ordenActual.direccion = self.ordenActual.direccion === 'asc' ? 'desc' : 'asc';
        } else {
            self.ordenActual.campo = campo;
            self.ordenActual.direccion = 'asc';
        }
        
        // Realizar ordenamiento
        self.clientesFiltrados.sort(function(a, b) {
            var valorA, valorB;
            
            switch (campo) {
                case 'nombre':
                    valorA = (a.nombre || '').toLowerCase();
                    valorB = (b.nombre || '').toLowerCase();
                    break;
                case 'cedula':
                    valorA = a.cedula || '';
                    valorB = b.cedula || '';
                    break;
                case 'telefono':
                    valorA = a.telefono || '';
                    valorB = b.telefono || '';
                    break;
                case 'direccion1':
                    var direccionesA = self.obtenerDirecciones(a);
                    var direccionesB = self.obtenerDirecciones(b);
                    valorA = (direccionesA.length > 0 ? direccionesA[0] : '').toLowerCase();
                    valorB = (direccionesB.length > 0 ? direccionesB[0] : '').toLowerCase();
                    break;
                case 'notas':
                    valorA = a.notas || '';
                    valorB = b.notas || '';
                    break;
                default:
                    valorA = '';
                    valorB = '';
            }
            
            var comparacion = 0;
            if (valorA < valorB) {
                comparacion = -1;
            } else if (valorA > valorB) {
                comparacion = 1;
            }
            
            return self.ordenActual.direccion === 'asc' ? comparacion : -comparacion;
        });
        
        // Resetear a primera página y renderizar
        self.paginaActual = 1;
        self.renderizarTabla();
        
        console.log('🔄 Lista ordenada por:', campo, self.ordenActual.direccion);
    };

    // Cargar clientes
    BaseClientes.prototype.cargarClientes = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            console.log('📊 Cargando clientes...');
            
            self.mostrarCargando(true);

            // Verificar que el servicio esté disponible
            if (typeof window.clientesService === 'undefined') {
                var error = new Error('Servicio de clientes no disponible');
                console.error('❌', error.message);
                self.mostrarError('Error: Servicio de clientes no disponible');
                self.mostrarCargando(false);
                reject(error);
                return;
            }

            window.clientesService.obtenerTodosLosClientes()
                .then(function(clientes) {
                    // ✅ ORDENAR ALFABÉTICAMENTE POR NOMBRE (redundante por seguridad)
                    if (clientes && clientes.length > 0) {
                        clientes.sort(function(a, b) {
                            var nombreA = (a.nombre || '').toLowerCase().trim();
                            var nombreB = (b.nombre || '').toLowerCase().trim();
                            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
                        });
                    }
                    
                    self.clientes = clientes || [];
                    self.clientesFiltrados = [...self.clientes];
                    
                    console.log('✅ Clientes cargados:', self.clientes.length, '(ordenados alfabéticamente)');
                    
                    self.actualizarEstadisticas();
                    self.renderizarTabla();
                    self.mostrarCargando(false);
                    
                    // Mostrar notificación de éxito
                    self.mostrarNotificacion(
                        `${self.clientes.length} clientes cargados exitosamente`,
                        'success'
                    );
                    
                    resolve(self.clientes);
                })
                .catch(function(error) {
                    console.error('❌ Error al cargar clientes:', error);
                    self.mostrarError('Error al cargar los clientes');
                    self.mostrarCargando(false);
                    reject(error);
                });
        });
    };

    // Mostrar/ocultar indicador de carga
    BaseClientes.prototype.mostrarCargando = function(mostrar) {
        var loadingIndicator = document.getElementById('loading-indicator');
        var tabla = document.getElementById('tabla-clientes');
        
        if (loadingIndicator && tabla) {
            if (mostrar) {
                loadingIndicator.style.display = 'flex';
                tabla.style.display = 'none';
            } else {
                loadingIndicator.style.display = 'none';
                tabla.style.display = 'table';
            }
        }
    };

    // Procesar búsqueda
    BaseClientes.prototype.procesarBusqueda = function(termino) {
        var self = this;
        
        console.log('🔍 Procesando búsqueda:', termino);
        
        self.filtroActual = termino;
        self.paginaActual = 1; // Resetear a primera página
        
        if (!termino || termino.trim() === '') {
            self.clientesFiltrados = [...self.clientes];
        } else {
            var terminoLowerCase = termino.toLowerCase().trim();
            self.clientesFiltrados = self.clientes.filter(function(cliente) {
                // Buscar en direcciones múltiples
                var coincideDireccion = false;
                var direcciones = self.obtenerDirecciones(cliente);
                for (var i = 0; i < direcciones.length; i++) {
                    if (direcciones[i].toLowerCase().includes(terminoLowerCase)) {
                        coincideDireccion = true;
                        break;
                    }
                }
                
                return (
                    (cliente.nombre && cliente.nombre.toLowerCase().includes(terminoLowerCase)) ||
                    (cliente.cedula && cliente.cedula.toString().includes(terminoLowerCase)) ||
                    (cliente.telefono && cliente.telefono.toString().includes(terminoLowerCase)) ||
                    coincideDireccion
                );
            });
        }
        
        // ✅ MANTENER ORDEN ALFABÉTICO EN RESULTADOS FILTRADOS
        self.clientesFiltrados.sort(function(a, b) {
            var nombreA = (a.nombre || '').toLowerCase().trim();
            var nombreB = (b.nombre || '').toLowerCase().trim();
            return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
        });
        
        console.log('📊 Resultados de búsqueda:', self.clientesFiltrados.length, '(ordenados alfabéticamente)');
        
        self.actualizarEstadisticas();
        self.renderizarTabla();
        self.actualizarPaginacion();
    };

    // Limpiar búsqueda
    BaseClientes.prototype.limpiarBusqueda = function() {
        var inputBusqueda = document.getElementById('busqueda-clientes');
        if (inputBusqueda) {
            inputBusqueda.value = '';
            this.procesarBusqueda('');
        }
    };

    // Aplicar filtro rápido
    BaseClientes.prototype.aplicarFiltroRapido = function(filtro) {
        var self = this;
        
        console.log('🏷️ Aplicando filtro:', filtro);
        
        switch (filtro) {
            case 'todos':
                self.clientesFiltrados = [...self.clientes];
                break;
                
            case 'activos':
                self.clientesFiltrados = self.clientes.filter(function(cliente) {
                    return cliente.activo !== false;
                });
                break;
                
            case 'nuevos':
                var hace30Dias = new Date();
                hace30Dias.setDate(hace30Dias.getDate() - 30);
                
                self.clientesFiltrados = self.clientes.filter(function(cliente) {
                    if (!cliente.fechaRegistro) return false;
                    var fechaRegistro = new Date(cliente.fechaRegistro);
                    return fechaRegistro >= hace30Dias;
                });
                break;
                
            default:
                self.clientesFiltrados = [...self.clientes];
        }
        
        self.paginaActual = 1;
        self.actualizarEstadisticas();
        self.renderizarTabla();
        self.actualizarPaginacion();
    };

    // Actualizar estadísticas
    BaseClientes.prototype.actualizarEstadisticas = function() {
        var totalClientesElement = document.getElementById('total-clientes');
        var clientesActivosElement = document.getElementById('clientes-activos');
        
        if (totalClientesElement) {
            totalClientesElement.textContent = this.clientes.length;
        }
        
        if (clientesActivosElement) {
            var activos = this.clientes.filter(function(cliente) {
                return cliente.activo !== false;
            }).length;
            clientesActivosElement.textContent = activos;
        }
    };

    // Renderizar tabla
    BaseClientes.prototype.renderizarTabla = function() {
        var self = this;
        var tabla = document.getElementById('tabla-clientes');
        var tbody = document.getElementById('tbody-clientes');
        var mensajeVacio = document.getElementById('mensaje-vacio');
        
        if (!tbody) return;
        
        // Calcular paginación
        var inicio = (self.paginaActual - 1) * self.clientesPorPagina;
        var fin = inicio + self.clientesPorPagina;
        var clientesPagina = self.clientesFiltrados.slice(inicio, fin);
        
        if (clientesPagina.length === 0) {
            // Mostrar mensaje de vacío
            if (tabla) tabla.style.display = 'none';
            if (mensajeVacio) mensajeVacio.style.display = 'flex';
            return;
        }
        
        // Mostrar tabla
        if (tabla) tabla.style.display = 'table';
        if (mensajeVacio) mensajeVacio.style.display = 'none';
        
        // Generar filas con diseño profesional
        var filasHTML = clientesPagina.map(function(cliente, index) {
            var numeroFila = inicio + index + 1;
            
            return `
                <tr class="fila-cliente" data-cliente-id="${cliente.id}">
                    <td class="celda-nombre">
                        <div class="cliente-info">
                            <div class="nombre-principal">${self.escaparHTML(cliente.nombre)}</div>
                            <small class="numero-cliente">#${numeroFila}</small>
                        </div>
                    </td>
                    <td class="celda-cedula">
                        <span class="cedula">${self.escaparHTML(cliente.cedula)}</span>
                    </td>
                    <td class="celda-telefono">
                        <span class="telefono">${self.escaparHTML(cliente.telefono || 'No registrado')}</span>
                    </td>
                    <td class="celda-direccion1">
                        ${self.renderizarDireccion1(cliente)}
                    </td>
                    <td class="celda-direccion2">
                        ${self.renderizarDireccion2(cliente)}
                    </td>
                    <td class="celda-notas">
                        <span class="notas">${self.escaparHTML(cliente.notas || 'Sin notas')}</span>
                    </td>
                    <td class="celda-acciones">
                        <div class="acciones-grupo">
                            <button class="btn-accion btn-editar" 
                                    data-cliente-id="${cliente.id}" 
                                    title="Editar cliente">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-accion btn-eliminar" 
                                    data-cliente-id="${cliente.id}" 
                                    title="Eliminar cliente">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }).join('');
        
        tbody.innerHTML = filasHTML;
        
        // Configurar eventos de las acciones
        self.configurarEventosAcciones();
        
        // Actualizar paginación
        self.actualizarPaginacion();
        
        console.log('🎨 Tabla profesional renderizada con', clientesPagina.length, 'clientes');
    };

    /**
     * Renderiza la primera dirección del cliente
     */
    BaseClientes.prototype.renderizarDireccion1 = function(cliente) {
        const direcciones = this.obtenerDirecciones(cliente);
        const direccion1 = direcciones.length > 0 ? direcciones[0] : '';
        
        if (!direccion1) {
            return '<span class="direccion no-registrada">No registrada</span>';
        }
        
        return `<span class="direccion1" title="${this.escaparHTML(direccion1)}">
            ${this.truncarTexto(direccion1, 30)}
        </span>`;
    };

    /**
     * Renderiza la segunda dirección del cliente con navegación si hay más
     */
    BaseClientes.prototype.renderizarDireccion2 = function(cliente) {
        const direcciones = this.obtenerDirecciones(cliente);
        
        if (direcciones.length <= 1) {
            return '<span class="direccion no-registrada">-</span>';
        }
        
        const direccion2 = direcciones[1];
        const tieneMultiples = direcciones.length > 2;
        
        return `
            <div class="direccion-container">
                <span class="direccion2" title="${this.escaparHTML(direccion2)}">
                    ${this.truncarTexto(direccion2, 25)}
                </span>
                ${tieneMultiples ? `
                    <button class="btn-ver-direcciones" 
                            data-cliente-id="${cliente.id}" 
                            onclick="baseClientes.mostrarTodasLasDirecciones(${cliente.id})"
                            title="Ver todas las direcciones (${direcciones.length} total)">
                        <i class="fas fa-chevron-right"></i>
                        <span class="contador">+${direcciones.length - 2}</span>
                    </button>
                ` : ''}
            </div>
        `;
    };

    /**
     * Obtiene las direcciones del cliente (maneja diferentes formatos)
     */
    BaseClientes.prototype.obtenerDirecciones = function(cliente) {
        // Si el cliente tiene un array de direcciones
        if (cliente.direcciones && Array.isArray(cliente.direcciones)) {
            return cliente.direcciones.filter(dir => dir && dir.trim());
        }
        
        // Construir array con direcciones individuales
        var direcciones = [];
        
        // Dirección principal
        if (cliente.direccion && cliente.direccion.trim()) {
            direcciones.push(cliente.direccion.trim());
        }
        
        // Dirección dos
        if (cliente.direccionDos && cliente.direccionDos.trim()) {
            direcciones.push(cliente.direccionDos.trim());
        }
        
        return direcciones;
    };

    /**
     * Muestra modal con todas las direcciones del cliente
     */
    BaseClientes.prototype.mostrarTodasLasDirecciones = function(clienteId) {
        const cliente = this.clientesActuales.find(c => c.id === clienteId);
        if (!cliente) return;
        
        const direcciones = this.obtenerDirecciones(cliente);
        if (direcciones.length <= 2) return;
        
        const modalHTML = `
            <div id="modal-direcciones" class="modal-overlay active">
                <div class="modal-content modal-direcciones">
                    <div class="modal-header">
                        <h3>
                            <i class="fas fa-map-marker-alt"></i>
                            Direcciones de ${this.escaparHTML(cliente.nombre)}
                        </h3>
                        <button class="btn-cerrar" onclick="baseClientes.cerrarModalDirecciones()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="direcciones-lista">
                            ${direcciones.map((direccion, index) => `
                                <div class="direccion-item">
                                    <div class="direccion-numero">
                                        <i class="fas fa-home"></i>
                                        Dirección ${index + 1}
                                    </div>
                                    <div class="direccion-texto">
                                        ${this.escaparHTML(direccion)}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Agregar modal al DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHTML;
        document.body.appendChild(modalContainer.firstElementChild);
    };

    /**
     * Cierra el modal de direcciones
     */
    BaseClientes.prototype.cerrarModalDirecciones = function() {
        const modal = document.getElementById('modal-direcciones');
        if (modal) {
            modal.remove();
        }
    };

    // Configurar eventos de acciones
    BaseClientes.prototype.configurarEventosAcciones = function() {
        var self = this;
        
        // Botones eliminar
        var botonesEliminar = document.querySelectorAll('.btn-eliminar');
        botonesEliminar.forEach(function(boton) {
            boton.addEventListener('click', function() {
                var clienteId = parseInt(this.dataset.clienteId);
                self.confirmarEliminacion(clienteId);
            });
        });
        
        // Botones ver (por ahora solo muestran información)
        var botonesVer = document.querySelectorAll('.btn-ver');
        botonesVer.forEach(function(boton) {
            boton.addEventListener('click', function() {
                var clienteId = parseInt(this.dataset.clienteId);
                self.verDetallesCliente(clienteId);
            });
        });
        
        // Botones editar (por ahora solo muestran información)
        var botonesEditar = document.querySelectorAll('.btn-editar');
        botonesEditar.forEach(function(boton) {
            boton.addEventListener('click', function() {
                var clienteId = parseInt(this.dataset.clienteId);
                self.editarCliente(clienteId);
            });
        });
    };

    // Confirmar eliminación
    BaseClientes.prototype.confirmarEliminacion = function(clienteId) {
        var cliente = this.clientes.find(function(c) { return c.id === clienteId; });
        if (!cliente) {
            console.error('❌ Cliente no encontrado:', clienteId);
            return;
        }
        
        this.clienteAEliminar = cliente;
        
        // Mostrar información del cliente en el modal
        var infoCliente = document.getElementById('info-cliente-eliminar');
        if (infoCliente) {
            infoCliente.innerHTML = `
                <div class="client-detail">
                    <strong>${this.escaparHTML(cliente.nombre)}</strong><br>
                    <small>Cédula: ${this.escaparHTML(cliente.cedula)}</small><br>
                    <small>Teléfono: ${this.escaparHTML(cliente.telefono || 'No registrado')}</small>
                </div>
            `;
        }
        
        // Mostrar modal
        var modal = document.getElementById('modal-confirmar-eliminacion');
        if (modal) {
            modal.style.display = 'flex';
        }
    };

    // Ejecutar eliminación
    BaseClientes.prototype.ejecutarEliminacion = function(cliente) {
        var self = this;
        
        console.log('🗑️ Eliminando cliente:', cliente.id);
        
        // Mostrar indicador de carga en el botón
        var btnConfirmar = document.getElementById('btn-confirmar-eliminacion');
        if (btnConfirmar) {
            var textoOriginal = btnConfirmar.innerHTML;
            btnConfirmar.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Eliminando...';
            btnConfirmar.disabled = true;
        }
        
        window.clientesService.eliminarCliente(cliente.id)
            .then(function() {
                console.log('✅ Cliente eliminado exitosamente');
                
                // Actualizar datos locales
                self.clientes = self.clientes.filter(function(c) { return c.id !== cliente.id; });
                self.clientesFiltrados = self.clientesFiltrados.filter(function(c) { return c.id !== cliente.id; });
                
                // Recargar datos para asegurar sincronización
                return self.cargarClientes();
            })
            .then(function() {
                self.mostrarNotificacion(
                    `Cliente "${cliente.nombre}" eliminado exitosamente`,
                    'success'
                );
            })
            .catch(function(error) {
                console.error('❌ Error al eliminar cliente:', error);
                self.mostrarError('Error al eliminar el cliente');
            })
            .finally(function() {
                // Restaurar botón
                if (btnConfirmar) {
                    btnConfirmar.innerHTML = textoOriginal;
                    btnConfirmar.disabled = false;
                }
            });
    };

    // Ver detalles del cliente
    BaseClientes.prototype.verDetallesCliente = function(clienteId) {
        var cliente = this.clientes.find(function(c) { return c.id === clienteId; });
        if (!cliente) return;
        
        this.mostrarNotificacion(
            `Detalles: ${cliente.nombre} - ${cliente.cedula}`,
            'info'
        );
    };

    // Editar cliente
    BaseClientes.prototype.editarCliente = function(clienteId) {
        var cliente = this.clientes.find(function(c) { return c.id === clienteId; });
        if (!cliente) return;
        
        this.mostrarNotificacion(
            `Editar: ${cliente.nombre} (Función en desarrollo)`,
            'info'
        );
    };

    // Manejar navegación de vuelta
    BaseClientes.prototype.manejarVolver = function() {
        console.log('🔙 Manejando navegación de vuelta desde:', this.origenNavegacion);
        
        try {
            switch (this.origenNavegacion) {
                case 'dashboard':
                    window.location.href = '../../../index.html';
                    break;
                    
                case 'ventas':
                    window.location.href = '../../../modulos/ventas/ventas.html';
                    break;
                    
                default:
                    // Intentar volver con history
                    if (window.history.length > 1) {
                        window.history.back();
                    } else {
                        // Fallback al dashboard
                        window.location.href = '../../../index.html';
                    }
            }
        } catch (error) {
            console.error('❌ Error en navegación:', error);
            // Fallback seguro
            window.location.href = '../../../index.html';
        }
    };

    // Ir a página específica
    BaseClientes.prototype.irAPagina = function(numeroPagina) {
        var totalPaginas = Math.ceil(this.clientesFiltrados.length / this.clientesPorPagina);
        
        if (numeroPagina < 1 || numeroPagina > totalPaginas) {
            return;
        }
        
        this.paginaActual = numeroPagina;
        this.renderizarTabla();
    };

    // Actualizar paginación
    BaseClientes.prototype.actualizarPaginacion = function() {
        var self = this;
        var totalClientes = self.clientesFiltrados.length;
        var totalPaginas = Math.ceil(totalClientes / self.clientesPorPagina);
        
        // Actualizar información de paginación
        var infoPaginacion = document.getElementById('info-paginacion');
        if (infoPaginacion) {
            var inicio = (self.paginaActual - 1) * self.clientesPorPagina + 1;
            var fin = Math.min(inicio + self.clientesPorPagina - 1, totalClientes);
            
            if (totalClientes === 0) {
                infoPaginacion.textContent = 'No hay clientes para mostrar';
            } else {
                infoPaginacion.textContent = `Mostrando ${inicio}-${fin} de ${totalClientes} clientes`;
            }
        }
        
        // Actualizar botones de paginación
        var btnPrimera = document.getElementById('btn-primera-pagina');
        var btnAnterior = document.getElementById('btn-pagina-anterior');
        var btnSiguiente = document.getElementById('btn-pagina-siguiente');
        var btnUltima = document.getElementById('btn-ultima-pagina');
        
        if (btnPrimera) btnPrimera.disabled = self.paginaActual <= 1;
        if (btnAnterior) btnAnterior.disabled = self.paginaActual <= 1;
        if (btnSiguiente) btnSiguiente.disabled = self.paginaActual >= totalPaginas;
        if (btnUltima) btnUltima.disabled = self.paginaActual >= totalPaginas;
        
        // Generar números de página
        self.generarNumerosPaginacion(totalPaginas);
    };

    // Generar números de paginación
    BaseClientes.prototype.generarNumerosPaginacion = function(totalPaginas) {
        var self = this;
        var containerNumeros = document.getElementById('numeros-paginacion');
        if (!containerNumeros) return;
        
        var numerosHTML = '';
        var inicioRango = Math.max(1, self.paginaActual - 2);
        var finRango = Math.min(totalPaginas, self.paginaActual + 2);
        
        for (var i = inicioRango; i <= finRango; i++) {
            var claseActiva = i === self.paginaActual ? 'active' : '';
            numerosHTML += `
                <button class="btn-pagination-number ${claseActiva}" data-pagina="${i}">
                    ${i}
                </button>
            `;
        }
        
        containerNumeros.innerHTML = numerosHTML;
        
        // Configurar eventos
        var botonesNumero = containerNumeros.querySelectorAll('.btn-pagination-number');
        botonesNumero.forEach(function(boton) {
            boton.addEventListener('click', function() {
                var pagina = parseInt(this.dataset.pagina);
                self.irAPagina(pagina);
            });
        });
    };

    // Mostrar notificación
    BaseClientes.prototype.mostrarNotificacion = function(mensaje, tipo) {
        var container = document.getElementById('notificaciones-container');
        if (!container) return;
        
        tipo = tipo || 'info';
        var iconos = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };
        
        var notificacion = document.createElement('div');
        notificacion.className = `notificacion ${tipo}`;
        notificacion.innerHTML = `
            <i class="fas ${iconos[tipo]}"></i>
            <span>${this.escaparHTML(mensaje)}</span>
            <button class="btn-cerrar-notificacion">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Configurar cierre automático
        var timeout = setTimeout(function() {
            if (notificacion.parentNode) {
                notificacion.remove();
            }
        }, 5000);
        
        // Configurar cierre manual
        var btnCerrar = notificacion.querySelector('.btn-cerrar-notificacion');
        btnCerrar.addEventListener('click', function() {
            clearTimeout(timeout);
            notificacion.remove();
        });
        
        container.appendChild(notificacion);
        
        // Animación de entrada
        setTimeout(function() {
            notificacion.classList.add('show');
        }, 10);
    };

    // Mostrar error
    BaseClientes.prototype.mostrarError = function(mensaje) {
        this.mostrarNotificacion(mensaje, 'error');
    };

    // Formatear fecha
    BaseClientes.prototype.formatearFecha = function(fecha) {
        if (!fecha) return 'No registrada';
        
        try {
            var fechaObj = new Date(fecha);
            return fechaObj.toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch (error) {
            return 'Fecha inválida';
        }
    };

    // Escapar HTML
    BaseClientes.prototype.escaparHTML = function(text) {
        if (!text) return '';
        var div = document.createElement('div');
        div.textContent = text.toString();
        return div.innerHTML;
    };

    // Truncar texto
    BaseClientes.prototype.truncarTexto = function(texto, longitud) {
        if (!texto) return '';
        return texto.length > longitud ? texto.substring(0, longitud) + '...' : texto;
    };

    return BaseClientes;
})();

// Inicialización automática cuando se carga el DOM
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM cargado, esperando servicios...');
    
    // Esperar a que el servicio esté disponible
    function inicializarCuandoEsteListoElServicio() {
        if (typeof window.clientesService !== 'undefined') {
            console.log('✅ Servicio disponible, inicializando BaseClientes');
            window.baseClientes = new BaseClientes();
        } else {
            console.log('⏳ Esperando servicio de clientes...');
            setTimeout(inicializarCuandoEsteListoElServicio, 100);
        }
    }
    
    inicializarCuandoEsteListoElServicio();
});

console.log('🔧 BaseClientes compatible cargado');
