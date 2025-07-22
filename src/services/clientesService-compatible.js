/**
 * ServicesClientes - Servicio para gestión de clientes (Versión compatible sin ES6 modules)
 * Autor: Asistente IA - Optimizado para FODEXA
 * Fecha: 2024
 * 
 * Este servicio maneja todas las operaciones de clientes:
 * - Carga de datos desde IndexedDB o localStorage
 * - Búsqueda y filtrado
 * - Operaciones CRUD
 * - Sincronización de datos
 */

// Clase ClientesService - versión compatible sin ES6 modules
var ClientesService = (function() {
    'use strict';

    function ClientesService() {
        this.dbName = 'FodexaClientesDB';
        this.dbVersion = 1;
        this.storeName = 'clientes';
        this.db = null;
        this.isInitialized = false;
        
        console.log('🔧 ClientesService inicializado (versión compatible)');
        this.init();
    }

    // Inicializar el servicio
    ClientesService.prototype.init = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (self.isInitialized) {
                resolve();
                return;
            }

            // Verificar soporte para IndexedDB
            if (!window.indexedDB) {
                console.warn('⚠️ IndexedDB no soportado, usando localStorage');
                self.isInitialized = true;
                resolve();
                return;
            }

            // Abrir IndexedDB
            var request = indexedDB.open(self.dbName, self.dbVersion);

            request.onerror = function(event) {
                console.error('❌ Error al abrir IndexedDB:', event.target.error);
                self.isInitialized = true;
                resolve(); // Continuar con localStorage
            };

            request.onsuccess = function(event) {
                self.db = event.target.result;
                self.isInitialized = true;
                console.log('✅ IndexedDB inicializado correctamente');
                resolve();
            };

            request.onupgradeneeded = function(event) {
                var db = event.target.result;
                
                if (!db.objectStoreNames.contains(self.storeName)) {
                    var store = db.createObjectStore(self.storeName, { keyPath: 'id', autoIncrement: true });
                    
                    // Crear índices
                    store.createIndex('cedula', 'cedula', { unique: true });
                    store.createIndex('nombre', 'nombre', { unique: false });
                    store.createIndex('telefono', 'telefono', { unique: false });
                    
                    console.log('🗃️ Object store de clientes creado');
                }
            };
        });
    };

    // Obtener todos los clientes
    ClientesService.prototype.obtenerTodosLosClientes = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (!self.isInitialized) {
                self.init().then(function() {
                    return self._obtenerClientesInterno();
                }).then(resolve).catch(reject);
                return;
            }
            
            self._obtenerClientesInterno().then(resolve).catch(reject);
        });
    };

    ClientesService.prototype._obtenerClientesInterno = function() {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            // Intentar primero con IndexedDB
            if (self.db) {
                var transaction = self.db.transaction([self.storeName], 'readonly');
                var store = transaction.objectStore(self.storeName);
                var request = store.getAll();

                request.onsuccess = function() {
                    var clientes = request.result || [];
                    
                    // ✅ ORDENAR ALFABÉTICAMENTE POR NOMBRE
                    clientes.sort(function(a, b) {
                        var nombreA = (a.nombre || '').toLowerCase().trim();
                        var nombreB = (b.nombre || '').toLowerCase().trim();
                        return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
                    });
                    
                    console.log('📊 Clientes cargados desde IndexedDB:', clientes.length, '(ordenados alfabéticamente)');
                    resolve(clientes);
                };

                request.onerror = function() {
                    console.warn('⚠️ Error al leer IndexedDB, intentando localStorage');
                    resolve(self._obtenerClientesDesdeLocalStorage());
                };
            } else {
                // Usar localStorage como fallback
                resolve(self._obtenerClientesDesdeLocalStorage());
            }
        });
    };

    ClientesService.prototype._obtenerClientesDesdeLocalStorage = function() {
        try {
            var clientesJSON = localStorage.getItem('fodexa_clientes');
            var clientes = clientesJSON ? JSON.parse(clientesJSON) : [];
            
            // ✅ ORDENAR ALFABÉTICAMENTE POR NOMBRE
            clientes.sort(function(a, b) {
                var nombreA = (a.nombre || '').toLowerCase().trim();
                var nombreB = (b.nombre || '').toLowerCase().trim();
                return nombreA.localeCompare(nombreB, 'es', { sensitivity: 'base' });
            });
            
            console.log('📊 Clientes cargados desde localStorage:', clientes.length, '(ordenados alfabéticamente)');
            return clientes;
        } catch (error) {
            console.error('❌ Error al leer localStorage:', error);
            return [];
        }
    };

    // Buscar clientes
    ClientesService.prototype.buscarClientes = function(termino) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            self.obtenerTodosLosClientes()
                .then(function(clientes) {
                    if (!termino || termino.trim() === '') {
                        resolve(clientes);
                        return;
                    }

                    var terminoLowerCase = termino.toLowerCase().trim();
                    var clientesFiltrados = clientes.filter(function(cliente) {
                        return (
                            (cliente.nombre && cliente.nombre.toLowerCase().includes(terminoLowerCase)) ||
                            (cliente.cedula && cliente.cedula.toString().includes(terminoLowerCase)) ||
                            (cliente.telefono && cliente.telefono.toString().includes(terminoLowerCase)) ||
                            (cliente.direccion && cliente.direccion.toLowerCase().includes(terminoLowerCase))
                        );
                    });

                    console.log('🔍 Búsqueda completada:', clientesFiltrados.length, 'resultados para:', termino);
                    resolve(clientesFiltrados);
                })
                .catch(reject);
        });
    };

    // Eliminar cliente
    ClientesService.prototype.eliminarCliente = function(clienteId) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (!clienteId) {
                reject(new Error('ID de cliente requerido'));
                return;
            }

            // Intentar eliminar de IndexedDB primero
            if (self.db) {
                var transaction = self.db.transaction([self.storeName], 'readwrite');
                var store = transaction.objectStore(self.storeName);
                var request = store.delete(clienteId);

                request.onsuccess = function() {
                    console.log('✅ Cliente eliminado de IndexedDB:', clienteId);
                    self._sincronizarConLocalStorage();
                    resolve(true);
                };

                request.onerror = function() {
                    console.warn('⚠️ Error al eliminar de IndexedDB, intentando localStorage');
                    self._eliminarDeLocalStorage(clienteId).then(resolve).catch(reject);
                };
            } else {
                // Eliminar solo de localStorage
                self._eliminarDeLocalStorage(clienteId).then(resolve).catch(reject);
            }
        });
    };

    ClientesService.prototype._eliminarDeLocalStorage = function(clienteId) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var clientes = self._obtenerClientesDesdeLocalStorage();
                var clientesActualizados = clientes.filter(function(cliente) {
                    return cliente.id !== clienteId;
                });

                localStorage.setItem('fodexa_clientes', JSON.stringify(clientesActualizados));
                console.log('✅ Cliente eliminado de localStorage:', clienteId);
                resolve(true);
            } catch (error) {
                console.error('❌ Error al eliminar de localStorage:', error);
                reject(error);
            }
        });
    };

    // Sincronizar IndexedDB con localStorage
    ClientesService.prototype._sincronizarConLocalStorage = function() {
        var self = this;
        
        if (!self.db) return;

        self.obtenerTodosLosClientes().then(function(clientes) {
            try {
                localStorage.setItem('fodexa_clientes', JSON.stringify(clientes));
                console.log('🔄 Sincronización con localStorage completada');
            } catch (error) {
                console.error('❌ Error en sincronización:', error);
            }
        });
    };

    // Obtener cliente por ID
    ClientesService.prototype.obtenerClientePorId = function(clienteId) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            self.obtenerTodosLosClientes()
                .then(function(clientes) {
                    var cliente = clientes.find(function(c) {
                        return c.id === clienteId;
                    });
                    resolve(cliente || null);
                })
                .catch(reject);
        });
    };

    // Agregar cliente
    ClientesService.prototype.agregarCliente = function(datosCliente) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            if (!datosCliente || !datosCliente.nombre || !datosCliente.cedula) {
                reject(new Error('Datos de cliente incompletos'));
                return;
            }

            // Verificar si ya existe
            self.buscarClientes(datosCliente.cedula).then(function(clientesExistentes) {
                if (clientesExistentes.length > 0) {
                    reject(new Error('Ya existe un cliente con esta cédula'));
                    return;
                }

                // Crear objeto cliente
                var nuevoCliente = {
                    nombre: datosCliente.nombre,
                    cedula: datosCliente.cedula,
                    telefono: datosCliente.telefono || '',
                    direccion: datosCliente.direccion || '',
                    fechaRegistro: new Date().toISOString(),
                    activo: true
                };

                // Intentar guardar en IndexedDB
                if (self.db) {
                    var transaction = self.db.transaction([self.storeName], 'readwrite');
                    var store = transaction.objectStore(self.storeName);
                    var request = store.add(nuevoCliente);

                    request.onsuccess = function() {
                        nuevoCliente.id = request.result;
                        console.log('✅ Cliente agregado a IndexedDB:', nuevoCliente.id);
                        self._sincronizarConLocalStorage();
                        resolve(nuevoCliente);
                    };

                    request.onerror = function() {
                        console.warn('⚠️ Error al guardar en IndexedDB, usando localStorage');
                        self._agregarALocalStorage(nuevoCliente).then(resolve).catch(reject);
                    };
                } else {
                    self._agregarALocalStorage(nuevoCliente).then(resolve).catch(reject);
                }
            }).catch(reject);
        });
    };

    ClientesService.prototype._agregarALocalStorage = function(nuevoCliente) {
        var self = this;
        
        return new Promise(function(resolve, reject) {
            try {
                var clientes = self._obtenerClientesDesdeLocalStorage();
                
                // Generar ID único
                var maxId = Math.max(0, ...clientes.map(function(c) { return c.id || 0; }));
                nuevoCliente.id = maxId + 1;
                
                clientes.push(nuevoCliente);
                localStorage.setItem('fodexa_clientes', JSON.stringify(clientes));
                
                console.log('✅ Cliente agregado a localStorage:', nuevoCliente.id);
                resolve(nuevoCliente);
            } catch (error) {
                console.error('❌ Error al agregar a localStorage:', error);
                reject(error);
            }
        });
    };

    return ClientesService;
})();

// Crear instancia global
window.clientesService = new ClientesService();

console.log('🔧 ClientesService compatible cargado y disponible globalmente');
