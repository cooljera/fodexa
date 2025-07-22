/**
 * FODEXA - Gestión de Pedidos
 * Sistema avanzado para el manejo de pedidos a domicilio
 */

// ============================
// CLASE PEDIDO
// ============================
class Pedido {
    constructor(data) {
        this.id = data.id || generateId();
        this.numero = data.numero;
        this.fechaCreacion = data.fechaCreacion || new Date().toISOString();
        this.estado = data.estado || 'pendiente';
        this.cliente = data.cliente;
        this.items = data.items || [];
        this.subtotal = data.subtotal || 0;
        this.costoDomicilio = data.costoDomicilio || 0;
        this.total = data.total || 0;
        this.metodoPago = data.metodoPago;
        this.tiempoEstimado = data.tiempoEstimado || 45;
        this.notas = data.notas || '';
        this.domiciliario = data.domiciliario || null;
        this.usuario = data.usuario;
        this.timeline = data.timeline || [];
        this.ubicacion = data.ubicacion || null;
        this.prioridad = data.prioridad || 'normal';
    }

    // Calcular tiempo transcurrido
    getTiempoTranscurrido() {
        const ahora = new Date();
        const creacion = new Date(this.fechaCreacion);
        return Math.floor((ahora - creacion) / 60000); // minutos
    }

    // Verificar si está retrasado
    isRetrasado() {
        return this.getTiempoTranscurrido() > this.tiempoEstimado && 
               this.estado !== 'entregado' && 
               this.estado !== 'cancelado';
    }

    // Agregar evento al timeline
    addTimelineEvent(estado, descripcion = null) {
        this.timeline.push({
            estado: estado,
            fecha: new Date().toISOString(),
            descripcion: descripcion || getDescripcionEstado(estado)
        });
    }

    // Cambiar estado
    cambiarEstado(nuevoEstado, descripcion = null) {
        const estadoAnterior = this.estado;
        this.estado = nuevoEstado;
        this.addTimelineEvent(nuevoEstado, descripcion);
        
        // Eventos específicos según el estado
        switch (nuevoEstado) {
            case 'preparando':
                this.horaPreparacion = new Date().toISOString();
                break;
            case 'en-ruta':
                this.horaSalida = new Date().toISOString();
                break;
            case 'entregado':
                this.horaEntrega = new Date().toISOString();
                break;
            case 'cancelado':
                this.horaCancelacion = new Date().toISOString();
                break;
        }
        
        return { anterior: estadoAnterior, nuevo: nuevoEstado };
    }

    // Asignar domiciliario
    asignarDomiciliario(domiciliario) {
        this.domiciliario = domiciliario;
        this.addTimelineEvent(this.estado, `Asignado a ${domiciliario.nombre}`);
    }

    // Calcular totales
    calcularTotales() {
        this.subtotal = this.items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
        this.total = this.subtotal + this.costoDomicilio;
        return { subtotal: this.subtotal, total: this.total };
    }

    // Validar pedido
    validar() {
        const errores = [];
        
        if (!this.cliente || !this.cliente.nombre) {
            errores.push('Cliente requerido');
        }
        
        if (!this.cliente || !this.cliente.telefono) {
            errores.push('Teléfono del cliente requerido');
        }
        
        if (!this.cliente || !this.cliente.direccion) {
            errores.push('Dirección requerida');
        }
        
        if (!this.items || this.items.length === 0) {
            errores.push('Debe tener al menos un producto');
        }
        
        if (!this.metodoPago) {
            errores.push('Método de pago requerido');
        }
        
        return errores;
    }

    // Exportar a JSON
    toJSON() {
        return {
            id: this.id,
            numero: this.numero,
            fechaCreacion: this.fechaCreacion,
            estado: this.estado,
            cliente: this.cliente,
            items: this.items,
            subtotal: this.subtotal,
            costoDomicilio: this.costoDomicilio,
            total: this.total,
            metodoPago: this.metodoPago,
            tiempoEstimado: this.tiempoEstimado,
            notas: this.notas,
            domiciliario: this.domiciliario,
            usuario: this.usuario,
            timeline: this.timeline,
            ubicacion: this.ubicacion,
            prioridad: this.prioridad,
            horaPreparacion: this.horaPreparacion,
            horaSalida: this.horaSalida,
            horaEntrega: this.horaEntrega,
            horaCancelacion: this.horaCancelacion
        };
    }
}

// ============================
// MANAGER DE PEDIDOS
// ============================
const PedidosManager = {
    
    // Obtener todos los pedidos
    getAll() {
        const data = getStoredData('pedidos') || [];
        return data.map(p => new Pedido(p));
    },
    
    // Obtener pedido por ID
    getById(id) {
        const pedidos = this.getAll();
        return pedidos.find(p => p.id === id);
    },
    
    // Crear nuevo pedido
    create(pedidoData) {
        try {
            const pedido = new Pedido(pedidoData);
            
            // Validar
            const errores = pedido.validar();
            if (errores.length > 0) {
                throw new Error('Errores de validación: ' + errores.join(', '));
            }
            
            // Asignar número consecutivo
            pedido.numero = this.getNextNumber();
            
            // Calcular totales
            pedido.calcularTotales();
            
            // Agregar evento inicial
            pedido.addTimelineEvent('pendiente', 'Pedido creado');
            
            // Guardar
            const pedidos = this.getAll();
            pedidos.push(pedido);
            this.saveAll(pedidos);
            
            return pedido;
        } catch (error) {
            console.error('Error creando pedido:', error);
            throw error;
        }
    },
    
    // Actualizar pedido
    update(id, pedidoData) {
        try {
            const pedidos = this.getAll();
            const index = pedidos.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Pedido no encontrado');
            }
            
            // Actualizar datos
            Object.assign(pedidos[index], pedidoData);
            
            // Recalcular totales
            pedidos[index].calcularTotales();
            
            // Guardar
            this.saveAll(pedidos);
            
            return pedidos[index];
        } catch (error) {
            console.error('Error actualizando pedido:', error);
            throw error;
        }
    },
    
    // Cambiar estado de pedido
    changeStatus(id, nuevoEstado, descripcion = null) {
        try {
            const pedido = this.getById(id);
            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }
            
            const resultado = pedido.cambiarEstado(nuevoEstado, descripcion);
            
            // Actualizar en storage
            const pedidos = this.getAll();
            const index = pedidos.findIndex(p => p.id === id);
            pedidos[index] = pedido;
            this.saveAll(pedidos);
            
            return resultado;
        } catch (error) {
            console.error('Error cambiando estado:', error);
            throw error;
        }
    },
    
    // Asignar domiciliario
    assignDelivery(pedidoId, domiciliarioId) {
        try {
            const pedido = this.getById(pedidoId);
            if (!pedido) {
                throw new Error('Pedido no encontrado');
            }
            
            const domiciliarios = getStoredData('domiciliarios') || [];
            const domiciliario = domiciliarios.find(d => d.id === domiciliarioId);
            
            if (!domiciliario) {
                throw new Error('Domiciliario no encontrado');
            }
            
            // Asignar
            pedido.asignarDomiciliario(domiciliario);
            
            // Actualizar domiciliario
            domiciliario.estado = 'ocupado';
            domiciliario.pedidosAsignados = (domiciliario.pedidosAsignados || 0) + 1;
            setStoredData('domiciliarios', domiciliarios);
            
            // Guardar pedido
            this.update(pedidoId, pedido);
            
            return { pedido, domiciliario };
        } catch (error) {
            console.error('Error asignando domiciliario:', error);
            throw error;
        }
    },
    
    // Filtrar pedidos
    filter(filtros) {
        let pedidos = this.getAll();
        
        if (filtros.estado) {
            pedidos = pedidos.filter(p => p.estado === filtros.estado);
        }
        
        if (filtros.domiciliario) {
            pedidos = pedidos.filter(p => 
                p.domiciliario && p.domiciliario.id === parseInt(filtros.domiciliario)
            );
        }
        
        if (filtros.fecha) {
            const fechaFiltro = new Date(filtros.fecha);
            pedidos = pedidos.filter(p => {
                const fechaPedido = new Date(p.fechaCreacion);
                return fechaPedido.toDateString() === fechaFiltro.toDateString();
            });
        }
        
        if (filtros.cliente) {
            const termino = filtros.cliente.toLowerCase();
            pedidos = pedidos.filter(p =>
                p.cliente.nombre.toLowerCase().includes(termino) ||
                p.cliente.telefono.includes(termino) ||
                p.numero.toString().includes(termino)
            );
        }
        
        if (filtros.retrasados) {
            pedidos = pedidos.filter(p => p.isRetrasado());
        }
        
        return pedidos;
    },
    
    // Buscar pedidos
    search(termino) {
        if (!termino.trim()) return this.getAll();
        
        const terminoLower = termino.toLowerCase();
        return this.getAll().filter(pedido =>
            pedido.cliente.nombre.toLowerCase().includes(terminoLower) ||
            pedido.cliente.telefono.includes(termino) ||
            pedido.cliente.direccion.toLowerCase().includes(terminoLower) ||
            pedido.numero.toString().includes(termino) ||
            pedido.id.includes(termino)
        );
    },
    
    // Obtener pedidos por estado
    getByStatus(estado) {
        return this.getAll().filter(p => p.estado === estado);
    },
    
    // Obtener pedidos del día
    getToday() {
        const hoy = new Date().toDateString();
        return this.getAll().filter(p => 
            new Date(p.fechaCreacion).toDateString() === hoy
        );
    },
    
    // Obtener pedidos retrasados
    getDelayed() {
        return this.getAll().filter(p => p.isRetrasado());
    },
    
    // Obtener estadísticas
    getStats(fecha = null) {
        let pedidos = fecha ? 
            this.getAll().filter(p => 
                new Date(p.fechaCreacion).toDateString() === new Date(fecha).toDateString()
            ) : 
            this.getToday();
        
        const stats = {
            total: pedidos.length,
            pendientes: pedidos.filter(p => p.estado === 'pendiente').length,
            preparando: pedidos.filter(p => p.estado === 'preparando').length,
            enRuta: pedidos.filter(p => p.estado === 'en-ruta').length,
            entregados: pedidos.filter(p => p.estado === 'entregado').length,
            cancelados: pedidos.filter(p => p.estado === 'cancelado').length,
            retrasados: pedidos.filter(p => p.isRetrasado()).length,
            
            // Financieros
            ingresos: pedidos
                .filter(p => p.estado === 'entregado')
                .reduce((sum, p) => sum + p.total, 0),
                
            // Tiempos promedio
            tiempoPromedio: this.getTiempoPromedio(pedidos.filter(p => p.estado === 'entregado')),
            
            // Por método de pago
            metodosPago: this.groupByPaymentMethod(pedidos.filter(p => p.estado === 'entregado'))
        };
        
        return stats;
    },
    
    // Obtener siguiente número
    getNextNumber() {
        const pedidos = this.getAll();
        if (pedidos.length === 0) return 1;
        return Math.max(...pedidos.map(p => p.numero || 0)) + 1;
    },
    
    // Guardar todos los pedidos
    saveAll(pedidos) {
        const data = pedidos.map(p => p instanceof Pedido ? p.toJSON() : p);
        setStoredData('pedidos', data);
    },
    
    // Obtener tiempo promedio de entrega
    getTiempoPromedio(pedidosEntregados) {
        if (pedidosEntregados.length === 0) return 0;
        
        const tiempos = pedidosEntregados
            .filter(p => p.horaEntrega && p.fechaCreacion)
            .map(p => {
                const inicio = new Date(p.fechaCreacion);
                const fin = new Date(p.horaEntrega);
                return (fin - inicio) / 60000; // minutos
            });
        
        if (tiempos.length === 0) return 0;
        return Math.round(tiempos.reduce((sum, t) => sum + t, 0) / tiempos.length);
    },
    
    // Agrupar por método de pago
    groupByPaymentMethod(pedidos) {
        const metodos = {};
        
        pedidos.forEach(pedido => {
            const metodo = pedido.metodoPago;
            if (!metodos[metodo]) {
                metodos[metodo] = {
                    cantidad: 0,
                    total: 0
                };
            }
            metodos[metodo].cantidad++;
            metodos[metodo].total += pedido.total;
        });
        
        return metodos;
    },
    
    // Eliminar pedido
    delete(id) {
        try {
            const pedidos = this.getAll();
            const index = pedidos.findIndex(p => p.id === id);
            
            if (index === -1) {
                throw new Error('Pedido no encontrado');
            }
            
            pedidos.splice(index, 1);
            this.saveAll(pedidos);
            
            return true;
        } catch (error) {
            console.error('Error eliminando pedido:', error);
            throw error;
        }
    },
    
    // Generar reporte
    generateReport(fechaInicio, fechaFin) {
        const inicio = new Date(fechaInicio);
        const fin = new Date(fechaFin);
        
        const pedidos = this.getAll().filter(p => {
            const fecha = new Date(p.fechaCreacion);
            return fecha >= inicio && fecha <= fin;
        });
        
        return {
            periodo: `${fechaInicio} - ${fechaFin}`,
            resumen: this.getStats(),
            pedidos: pedidos,
            detallesPorDia: this.groupByDay(pedidos),
            topClientes: this.getTopClientes(pedidos),
            productosVendidos: this.getProductosVendidos(pedidos)
        };
    },
    
    // Agrupar por día
    groupByDay(pedidos) {
        const dias = {};
        
        pedidos.forEach(pedido => {
            const fecha = new Date(pedido.fechaCreacion).toLocaleDateString('es-CO');
            if (!dias[fecha]) {
                dias[fecha] = {
                    cantidad: 0,
                    ingresos: 0,
                    entregados: 0
                };
            }
            dias[fecha].cantidad++;
            if (pedido.estado === 'entregado') {
                dias[fecha].ingresos += pedido.total;
                dias[fecha].entregados++;
            }
        });
        
        return dias;
    },
    
    // Obtener mejores clientes
    getTopClientes(pedidos) {
        const clientes = {};
        
        pedidos
            .filter(p => p.estado === 'entregado')
            .forEach(pedido => {
                const clienteKey = `${pedido.cliente.nombre}_${pedido.cliente.telefono}`;
                if (!clientes[clienteKey]) {
                    clientes[clienteKey] = {
                        nombre: pedido.cliente.nombre,
                        telefono: pedido.cliente.telefono,
                        pedidos: 0,
                        total: 0
                    };
                }
                clientes[clienteKey].pedidos++;
                clientes[clienteKey].total += pedido.total;
            });
        
        return Object.values(clientes)
            .sort((a, b) => b.total - a.total)
            .slice(0, 10);
    },
    
    // Obtener productos vendidos
    getProductosVendidos(pedidos) {
        const productos = {};
        
        pedidos
            .filter(p => p.estado === 'entregado')
            .forEach(pedido => {
                pedido.items.forEach(item => {
                    if (!productos[item.nombre]) {
                        productos[item.nombre] = {
                            cantidad: 0,
                            ingresos: 0
                        };
                    }
                    productos[item.nombre].cantidad += item.cantidad;
                    productos[item.nombre].ingresos += item.precio * item.cantidad;
                });
            });
        
        return Object.entries(productos)
            .map(([nombre, data]) => ({ nombre, ...data }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, 10);
    }
};

// ============================
// FUNCIONES AUXILIARES
// ============================
function getDescripcionEstado(estado) {
    const descripciones = {
        'pendiente': 'Pedido recibido y confirmado',
        'preparando': 'Preparando pedido en cocina',
        'en-ruta': 'Pedido en camino al destino',
        'entregado': 'Pedido entregado exitosamente',
        'cancelado': 'Pedido cancelado'
    };
    return descripciones[estado] || estado;
}

function getStoredData(key) {
    try {
        const data = localStorage.getItem(`fodexa_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error obteniendo ${key}:`, error);
        return null;
    }
}

function setStoredData(key, data) {
    try {
        localStorage.setItem(`fodexa_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error guardando ${key}:`, error);
        return false;
    }
}

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// ============================
// EXPORTAR
// ============================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Pedido, PedidosManager };
} else {
    window.Pedido = Pedido;
    window.PedidosManager = PedidosManager;
}
