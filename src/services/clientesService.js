/**
 * Servicio de Clientes - Sistema FODEXA POS
 * Maneja todas las operaciones CRUD con la base de datos IndexedDB
 */

// Configuración de la base de datos
const DB_CONFIG = {
    name: 'FodexaClientesDB',
    version: 1,
    storeName: 'clientes'
};

let db = null;

/**
 * Clase ClientesService para manejar operaciones de base de datos
 */
class ClientesService {
    constructor() {
        this.db = null;
        this.isInitialized = false;
    }

    /**
     * Inicializa la conexión a IndexedDB
     */
    async init() {
        if (this.isInitialized && this.db) {
            return this.db;
        }

        try {
            console.log('🗄️ Inicializando servicio de clientes...');
            
            return new Promise((resolve, reject) => {
                if (!window.indexedDB) {
                    console.warn('⚠️ IndexedDB no es compatible con este navegador');
                    this.isInitialized = true;
                    resolve(null);
                    return;
                }

                const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

                request.onerror = (event) => {
                    console.error('❌ Error al abrir IndexedDB:', event.target.error);
                    reject(event.target.error);
                };

                request.onsuccess = (event) => {
                    this.db = event.target.result;
                    this.isInitialized = true;
                    console.log('✅ Servicio de clientes inicializado');
                    resolve(this.db);
                };

                request.onupgradeneeded = (event) => {
                    console.log('🔧 Configurando estructura de base de datos...');
                    
                    const database = event.target.result;
                    
                    if (!database.objectStoreNames.contains(DB_CONFIG.storeName)) {
                        const store = database.createObjectStore(DB_CONFIG.storeName, { 
                            keyPath: 'id', 
                            autoIncrement: true 
                        });
                        
                        // Crear índices para búsquedas eficientes
                        store.createIndex('nombre', 'nombre', { unique: false });
                        store.createIndex('telefonoWhatsapp', 'telefonoWhatsapp', { unique: false });
                        store.createIndex('documentoIdentidad', 'documentoIdentidad', { unique: false });
                        store.createIndex('email', 'email', { unique: false });
                        
                        console.log('📊 Object store de clientes creado con índices');
                    }
                };
            });
        } catch (error) {
            console.error('❌ Error al inicializar servicio de clientes:', error);
            throw error;
        }
    }

    /**
     * Obtiene todos los clientes de la base de datos
     */
    async obtenerTodosLosClientes() {
        if (!this.db) {
            console.warn('⚠️ Base de datos no inicializada, intentando desde localStorage...');
            return this.obtenerClientesLocalStorage();
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.storeName], 'readonly');
                const store = transaction.objectStore(DB_CONFIG.storeName);
                const request = store.getAll();

                request.onsuccess = (event) => {
                    const clientes = event.target.result || [];
                    console.log(`📊 Obtenidos ${clientes.length} clientes de IndexedDB`);
                    resolve(clientes);
                };

                request.onerror = (event) => {
                    console.error('❌ Error al obtener clientes:', event.target.error);
                    // Fallback a localStorage
                    resolve(this.obtenerClientesLocalStorage());
                };
            });
        } catch (error) {
            console.error('❌ Error en obtenerTodosLosClientes:', error);
            return this.obtenerClientesLocalStorage();
        }
    }

    /**
     * Busca clientes por término de búsqueda
     */
    async buscarClientes(termino) {
        if (!termino || termino.trim() === '') {
            return await this.obtenerTodosLosClientes();
        }

        const todosLosClientes = await this.obtenerTodosLosClientes();
        const terminoLower = termino.toLowerCase().trim();

        return todosLosClientes.filter(cliente => {
            return (
                cliente.nombre?.toLowerCase().includes(terminoLower) ||
                cliente.telefonoWhatsapp?.includes(termino) ||
                cliente.documentoIdentidad?.includes(termino) ||
                cliente.email?.toLowerCase().includes(terminoLower) ||
                (cliente.direcciones && cliente.direcciones.some(dir => 
                    dir.toLowerCase().includes(terminoLower)
                ))
            );
        });
    }

    /**
     * Obtiene un cliente por ID
     */
    async obtenerClientePorId(clienteId) {
        if (!this.db) {
            console.warn('⚠️ Base de datos no inicializada, buscando en localStorage...');
            const clientesLS = this.obtenerClientesLocalStorage();
            return clientesLS.find(cliente => cliente.id == clienteId) || null;
        }

        try {
            return new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.storeName], 'readonly');
                const store = transaction.objectStore(DB_CONFIG.storeName);
                const request = store.get(Number(clienteId));

                request.onsuccess = (event) => {
                    const cliente = event.target.result;
                    if (cliente) {
                        console.log('✅ Cliente encontrado:', cliente.nombre);
                        resolve(cliente);
                    } else {
                        // Buscar en localStorage como respaldo
                        const clientesLS = this.obtenerClientesLocalStorage();
                        const clienteLS = clientesLS.find(c => c.id == clienteId);
                        resolve(clienteLS || null);
                    }
                };

                request.onerror = (event) => {
                    console.error('❌ Error al obtener cliente por ID:', event.target.error);
                    // Buscar en localStorage como respaldo
                    const clientesLS = this.obtenerClientesLocalStorage();
                    const clienteLS = clientesLS.find(c => c.id == clienteId);
                    resolve(clienteLS || null);
                };
            });
        } catch (error) {
            console.error('❌ Error en obtenerClientePorId:', error);
            const clientesLS = this.obtenerClientesLocalStorage();
            return clientesLS.find(c => c.id == clienteId) || null;
        }
    }

    /**
     * Guarda un nuevo cliente
     */
    async guardarCliente(clienteData) {
        console.log('💾 Guardando cliente:', clienteData.nombre);

        // Validar datos obligatorios
        if (!clienteData.nombre || !clienteData.telefonoWhatsapp) {
            throw new Error('Nombre y teléfono son obligatorios');
        }

        // Preparar datos del cliente
        const clienteCompleto = {
            ...clienteData,
            fechaCreacion: new Date().toISOString(),
            fechaActualizacion: new Date().toISOString()
        };

        try {
            let clienteGuardado = null;

            // Guardar en IndexedDB si está disponible
            if (this.db) {
                clienteGuardado = await this.guardarEnIndexedDB(clienteCompleto);
            }

            // Guardar en localStorage como respaldo
            const clienteParaLS = clienteGuardado || { 
                ...clienteCompleto, 
                id: Date.now()
            };
            
            await this.guardarEnLocalStorage(clienteParaLS);

            console.log('✅ Cliente guardado exitosamente:', clienteParaLS.nombre);
            return clienteParaLS;

        } catch (error) {
            console.error('❌ Error al guardar cliente:', error);
            throw error;
        }
    }

    /**
     * Actualiza un cliente existente
     */
    async actualizarCliente(clienteId, datosActualizados) {
        console.log('✏️ Actualizando cliente ID:', clienteId);

        try {
            const clienteExistente = await this.obtenerClientePorId(clienteId);
            if (!clienteExistente) {
                throw new Error('Cliente no encontrado');
            }

            const clienteActualizado = {
                ...clienteExistente,
                ...datosActualizados,
                fechaActualizacion: new Date().toISOString()
            };

            // Actualizar en IndexedDB
            if (this.db) {
                await this.actualizarEnIndexedDB(clienteActualizado);
            }

            // Actualizar en localStorage
            await this.actualizarEnLocalStorage(clienteActualizado);

            console.log('✅ Cliente actualizado exitosamente:', clienteActualizado.nombre);
            return clienteActualizado;

        } catch (error) {
            console.error('❌ Error al actualizar cliente:', error);
            throw error;
        }
    }

    /**
     * Elimina un cliente
     */
    async eliminarCliente(clienteId) {
        console.log('🗑️ Eliminando cliente ID:', clienteId);

        try {
            const cliente = await this.obtenerClientePorId(clienteId);
            if (!cliente) {
                throw new Error('Cliente no encontrado');
            }

            // Eliminar de IndexedDB
            if (this.db) {
                await this.eliminarDeIndexedDB(clienteId);
            }

            // Eliminar de localStorage
            await this.eliminarDeLocalStorage(clienteId);

            console.log('✅ Cliente eliminado exitosamente:', cliente.nombre);
            return true;

        } catch (error) {
            console.error('❌ Error al eliminar cliente:', error);
            throw error;
        }
    }

    // ===== MÉTODOS PRIVADOS PARA INDEXEDDB =====

    async guardarEnIndexedDB(clienteData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.storeName], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.storeName);
            const request = store.add(clienteData);

            request.onsuccess = (event) => {
                const clienteGuardado = {
                    ...clienteData,
                    id: event.target.result
                };
                resolve(clienteGuardado);
            };

            request.onerror = (event) => {
                console.error('❌ Error al guardar en IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async actualizarEnIndexedDB(clienteData) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.storeName], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.storeName);
            const request = store.put(clienteData);

            request.onsuccess = () => {
                resolve(clienteData);
            };

            request.onerror = (event) => {
                console.error('❌ Error al actualizar en IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    async eliminarDeIndexedDB(clienteId) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.storeName], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.storeName);
            const request = store.delete(Number(clienteId));

            request.onsuccess = () => {
                resolve(true);
            };

            request.onerror = (event) => {
                console.error('❌ Error al eliminar de IndexedDB:', event.target.error);
                reject(event.target.error);
            };
        });
    }

    // ===== MÉTODOS PRIVADOS PARA LOCALSTORAGE =====

    obtenerClientesLocalStorage() {
        try {
            const data = localStorage.getItem('fodexa_clientes');
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('❌ Error al obtener clientes de localStorage:', error);
            return [];
        }
    }

    async guardarEnLocalStorage(cliente) {
        try {
            const clientes = this.obtenerClientesLocalStorage();
            clientes.push(cliente);
            localStorage.setItem('fodexa_clientes', JSON.stringify(clientes));
            return cliente;
        } catch (error) {
            console.error('❌ Error al guardar en localStorage:', error);
            throw error;
        }
    }

    async actualizarEnLocalStorage(clienteActualizado) {
        try {
            const clientes = this.obtenerClientesLocalStorage();
            const index = clientes.findIndex(c => c.id == clienteActualizado.id);
            
            if (index !== -1) {
                clientes[index] = clienteActualizado;
                localStorage.setItem('fodexa_clientes', JSON.stringify(clientes));
            }
            
            return clienteActualizado;
        } catch (error) {
            console.error('❌ Error al actualizar en localStorage:', error);
            throw error;
        }
    }

    async eliminarDeLocalStorage(clienteId) {
        try {
            const clientes = this.obtenerClientesLocalStorage();
            const clientesFiltrados = clientes.filter(c => c.id != clienteId);
            localStorage.setItem('fodexa_clientes', JSON.stringify(clientesFiltrados));
            return true;
        } catch (error) {
            console.error('❌ Error al eliminar de localStorage:', error);
            throw error;
        }
    }

    // ===== MÉTODOS DE UTILIDAD =====

    /**
     * Obtiene estadísticas de la base de datos
     */
    async obtenerEstadisticas() {
        try {
            const clientes = await this.obtenerTodosLosClientes();
            
            return {
                totalClientes: clientes.length,
                clientesConDirecciones: clientes.filter(c => c.direcciones && c.direcciones.length > 0).length,
                clientesConEmail: clientes.filter(c => c.email && c.email.trim() !== '').length,
                ultimoRegistro: clientes.length > 0 ? 
                    clientes.reduce((ultimo, cliente) => 
                        new Date(cliente.fechaCreacion) > new Date(ultimo.fechaCreacion) ? cliente : ultimo
                    ) : null
            };
        } catch (error) {
            console.error('❌ Error al obtener estadísticas:', error);
            return {
                totalClientes: 0,
                clientesConDirecciones: 0,
                clientesConEmail: 0,
                ultimoRegistro: null
            };
        }
    }

    /**
     * Verifica el estado de la base de datos
     */
    async verificarEstado() {
        const estadisticas = await this.obtenerEstadisticas();
        
        console.log('📊 Estado de la base de datos de clientes:');
        console.log(`   • Total clientes: ${estadisticas.totalClientes}`);
        console.log(`   • Con direcciones: ${estadisticas.clientesConDirecciones}`);
        console.log(`   • Con email: ${estadisticas.clientesConEmail}`);
        console.log(`   • IndexedDB inicializada: ${this.isInitialized ? 'Sí' : 'No'}`);
        
        return estadisticas;
    }
}

// Crear instancia global del servicio
const clientesService = new ClientesService();

// Exportar para uso en módulos ES6
export default clientesService;

// Hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
    window.clientesService = clientesService;
}

// Auto-inicializar cuando se carga el módulo
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', async () => {
        try {
            await clientesService.init();
            console.log('🎯 Servicio de clientes listo para usar');
        } catch (error) {
            console.error('❌ Error al auto-inicializar servicio de clientes:', error);
        }
    });
}
