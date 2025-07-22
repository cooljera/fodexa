/**
 * FODEXA - Gestión de Historial de Clientes
 * Sistema para tracking de actividad y pedidos de clientes
 */

// ============================
// CLASE CLIENTE
// ============================
class Cliente {
    constructor(data) {
        this.id = data.id || generateId();
        this.nombre = data.nombre;
        this.telefono = data.telefono;
        this.email = data.email || '';
        this.documento = data.documento || '';
        this.fechaNacimiento = data.fechaNacimiento || null;
        this.direccion = data.direccion || '';
        this.barrio = data.barrio || '';
        this.ciudad = data.ciudad || 'Medellín';
        this.tipo = data.tipo || 'nuevo'; // 'nuevo', 'regular', 'frecuente', 'vip'
        this.descuento = data.descuento || 0;
        this.notas = data.notas || '';
        this.notificaciones = data.notificaciones !== false;
        this.marketing = data.marketing === true;
        this.fechaRegistro = data.fechaRegistro || new Date().toISOString();
        this.ultimaVisita = data.ultimaVisita || null;
        this.totalPedidos = data.totalPedidos || 0;
        this.totalGastado = data.totalGastado || 0;
        this.activo = data.activo !== false;
        this.historialPedidos = data.historialPedidos || [];
        this.preferencias = data.preferencias || this.initPreferencias();
        this.estadisticas = data.estadisticas || this.initEstadisticas();
    }

    // Inicializar preferencias
    initPreferencias() {
        return {
            metodoPagoFavorito: null,
            productosFrequentes: [],
            horarioPreferido: null,
            tipoEntrega: 'domicilio' // 'domicilio', 'recogida'
        };
    }

    // Inicializar estadísticas
    initEstadisticas() {
        return {
            pedidosCompletados: 0,
            pedidosCancelados: 0,
            ticketPromedio: 0,
            frecuenciaVisitas: 0, // días promedio entre visitas
            calificacionPromedio: 5.0,
            productos: {} // tracking de productos más comprados
        };
    }

    // Agregar pedido al historial
    agregarPedido(pedidoData) {
        const pedido = {
            id: pedidoData.id,
            fecha: pedidoData.fecha || new Date().toISOString(),
            total: pedidoData.total,
            productos: pedidoData.productos || [],
            estado: pedidoData.estado || 'completado',
            metodoPago: pedidoData.metodoPago,
            tipoEntrega: pedidoData.tipoEntrega || 'domicilio',
            calificacion: pedidoData.calificacion || null,
            notas: pedidoData.notas || ''
        };

        this.historialPedidos.push(pedido);
        this.actualizarEstadisticas(pedido);
        this.actualizarTipo();
        this.ultimaVisita = pedido.fecha;
    }

    // Actualizar estadísticas basadas en nuevo pedido
    actualizarEstadisticas(pedido) {
        if (pedido.estado === 'completado') {
            this.estadisticas.pedidosCompletados++;
            this.totalPedidos = this.estadisticas.pedidosCompletados;
            this.totalGastado += pedido.total;
            
            // Actualizar ticket promedio
            this.estadisticas.ticketPromedio = 
                this.totalGastado / this.estadisticas.pedidosCompletados;
            
            // Actualizar productos frecuentes
            if (pedido.productos) {
                pedido.productos.forEach(producto => {
                    const key = producto.id || producto.nombre;
                    this.estadisticas.productos[key] = 
                        (this.estadisticas.productos[key] || 0) + (producto.cantidad || 1);
                });
            }
            
            // Actualizar preferencias
            if (pedido.metodoPago) {
                this.preferencias.metodoPagoFavorito = pedido.metodoPago;
            }
            
            if (pedido.tipoEntrega) {
                this.preferencias.tipoEntrega = pedido.tipoEntrega;
            }
            
        } else if (pedido.estado === 'cancelado') {
            this.estadisticas.pedidosCancelados++;
        }
        
        // Actualizar calificación promedio
        if (pedido.calificacion) {
            const pedidosConCalificacion = this.historialPedidos.filter(p => p.calificacion);
            const sumaCalificaciones = pedidosConCalificacion.reduce((sum, p) => sum + p.calificacion, 0);
            this.estadisticas.calificacionPromedio = sumaCalificaciones / pedidosConCalificacion.length;
        }
        
        // Calcular frecuencia de visitas
        this.calcularFrecuenciaVisitas();
    }

    // Calcular frecuencia de visitas
    calcularFrecuenciaVisitas() {
        const pedidosCompletados = this.historialPedidos
            .filter(p => p.estado === 'completado')
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
        
        if (pedidosCompletados.length < 2) {
            this.estadisticas.frecuenciaVisitas = 0;
            return;
        }
        
        const fechas = pedidosCompletados.map(p => new Date(p.fecha));
        const intervalos = [];
        
        for (let i = 1; i < fechas.length; i++) {
            const diasDiferencia = (fechas[i] - fechas[i-1]) / (1000 * 60 * 60 * 24);
            intervalos.push(diasDiferencia);
        }
        
        this.estadisticas.frecuenciaVisitas = 
            intervalos.reduce((sum, intervalo) => sum + intervalo, 0) / intervalos.length;
    }

    // Actualizar tipo de cliente automáticamente
    actualizarTipo() {
        const pedidosCompletados = this.estadisticas.pedidosCompletados;
        const totalGastado = this.totalGastado;
        
        if (pedidosCompletados >= 20 && totalGastado >= 500000) {
            this.tipo = 'vip';
        } else if (pedidosCompletados >= 10 && totalGastado >= 200000) {
            this.tipo = 'frecuente';
        } else if (pedidosCompletados >= 3) {
            this.tipo = 'regular';
        } else {
            this.tipo = 'nuevo';
        }
    }

    // Obtener productos más comprados
    getProductosFrequentes(limite = 5) {
        const productos = Object.entries(this.estadisticas.productos)
            .map(([id, cantidad]) => ({ id, cantidad }))
            .sort((a, b) => b.cantidad - a.cantidad)
            .slice(0, limite);
        
        return productos;
    }

    // Obtener historial filtrado
    getHistorialFiltrado(filtros = {}) {
        let historial = [...this.historialPedidos];
        
        if (filtros.fechaInicio) {
            historial = historial.filter(p => 
                new Date(p.fecha) >= new Date(filtros.fechaInicio)
            );
        }
        
        if (filtros.fechaFin) {
            historial = historial.filter(p => 
                new Date(p.fecha) <= new Date(filtros.fechaFin)
            );
        }
        
        if (filtros.estado) {
            historial = historial.filter(p => p.estado === filtros.estado);
        }
        
        if (filtros.tipoEntrega) {
            historial = historial.filter(p => p.tipoEntrega === filtros.tipoEntrega);
        }
        
        return historial.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    }

    // Calcular valor del cliente (CLV simplificado)
    getValorCliente() {
        if (this.estadisticas.frecuenciaVisitas === 0) return this.totalGastado;
        
        const visitasAnuales = 365 / this.estadisticas.frecuenciaVisitas;
        const valorAnual = visitasAnuales * this.estadisticas.ticketPromedio;
        
        // Proyección a 2 años (simplificado)
        return valorAnual * 2;
    }

    // Verificar si es cliente en riesgo
    isClienteEnRiesgo() {
        if (!this.ultimaVisita) return false;
        
        const diasSinVisita = (new Date() - new Date(this.ultimaVisita)) / (1000 * 60 * 60 * 24);
        const umbralDias = this.estadisticas.frecuenciaVisitas * 2; // Doble de su frecuencia normal
        
        return diasSinVisita > Math.max(umbralDias, 30); // Mínimo 30 días
    }

    // Obtener recomendaciones personalizadas
    getRecomendaciones() {
        const recomendaciones = [];
        
        // Basado en productos frecuentes
        const productosFreq = this.getProductosFrequentes(3);
        if (productosFreq.length > 0) {
            recomendaciones.push({
                tipo: 'producto',
                mensaje: `Suele pedir: ${productosFreq.map(p => p.id).join(', ')}`,
                datos: productosFreq
            });
        }
        
        // Basado en ticket promedio
        if (this.estadisticas.ticketPromedio > 0) {
            recomendaciones.push({
                tipo: 'upsell',
                mensaje: `Ticket promedio: $${Math.round(this.estadisticas.ticketPromedio).toLocaleString()}`,
                datos: { ticketPromedio: this.estadisticas.ticketPromedio }
            });
        }
        
        // Basado en descuento
        if (this.descuento > 0) {
            recomendaciones.push({
                tipo: 'descuento',
                mensaje: `Descuento aplicable: ${this.descuento}%`,
                datos: { descuento: this.descuento }
            });
        }
        
        // Cliente en riesgo
        if (this.isClienteEnRiesgo()) {
            recomendaciones.push({
                tipo: 'retencion',
                mensaje: 'Cliente en riesgo - Considerar promoción especial',
                datos: { diasSinVisita: this.getDiasSinVisita() }
            });
        }
        
        return recomendaciones;
    }

    // Obtener días sin visita
    getDiasSinVisita() {
        if (!this.ultimaVisita) return null;
        
        return Math.floor((new Date() - new Date(this.ultimaVisita)) / (1000 * 60 * 60 * 24));
    }

    // Validar datos del cliente
    validar() {
        const errores = [];
        
        if (!this.nombre?.trim()) {
            errores.push('Nombre requerido');
        }
        
        if (!this.telefono?.trim()) {
            errores.push('Teléfono requerido');
        }
        
        // Validar formato de teléfono (básico)
        const telefonoRegex = /^[0-9+\-\s()]+$/;
        if (this.telefono && !telefonoRegex.test(this.telefono)) {
            errores.push('Formato de teléfono inválido');
        }
        
        // Validar email si se proporciona
        if (this.email) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(this.email)) {
                errores.push('Formato de email inválido');
            }
        }
        
        // Validar tipo
        const tiposValidos = ['nuevo', 'regular', 'frecuente', 'vip'];
        if (!tiposValidos.includes(this.tipo)) {
            errores.push('Tipo de cliente inválido');
        }
        
        // Validar descuento
        if (this.descuento < 0 || this.descuento > 100) {
            errores.push('Descuento debe estar entre 0 y 100');
        }
        
        return errores;
    }

    // Exportar a JSON
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            telefono: this.telefono,
            email: this.email,
            documento: this.documento,
            fechaNacimiento: this.fechaNacimiento,
            direccion: this.direccion,
            barrio: this.barrio,
            ciudad: this.ciudad,
            tipo: this.tipo,
            descuento: this.descuento,
            notas: this.notas,
            notificaciones: this.notificaciones,
            marketing: this.marketing,
            fechaRegistro: this.fechaRegistro,
            ultimaVisita: this.ultimaVisita,
            totalPedidos: this.totalPedidos,
            totalGastado: this.totalGastado,
            activo: this.activo,
            historialPedidos: this.historialPedidos,
            preferencias: this.preferencias,
            estadisticas: this.estadisticas
        };
    }
}

// ============================
// MANAGER DE CLIENTES
// ============================
const ClientesManager = {
    
    // Obtener todos los clientes
    getAll() {
        const data = getStoredData('clientes') || [];
        return data.map(c => new Cliente(c));
    },
    
    // Obtener cliente por ID
    getById(id) {
        const clientes = this.getAll();
        return clientes.find(c => c.id === id);
    },
    
    // Crear nuevo cliente
    create(clienteData) {
        try {
            const cliente = new Cliente(clienteData);
            
            // Validar
            const errores = cliente.validar();
            if (errores.length > 0) {
                throw new Error('Errores de validación: ' + errores.join(', '));
            }
            
            // Verificar teléfono único
            if (this.existsByPhone(cliente.telefono)) {
                throw new Error('Ya existe un cliente con ese teléfono');
            }
            
            // Guardar
            const clientes = this.getAll();
            clientes.push(cliente);
            this.saveAll(clientes);
            
            return cliente;
        } catch (error) {
            console.error('Error creando cliente:', error);
            throw error;
        }
    },
    
    // Actualizar cliente
    update(id, clienteData) {
        try {
            const clientes = this.getAll();
            const index = clientes.findIndex(c => c.id === id);
            
            if (index === -1) {
                throw new Error('Cliente no encontrado');
            }
            
            // Verificar teléfono único (excluyendo el actual)
            if (clienteData.telefono && 
                this.existsByPhone(clienteData.telefono, id)) {
                throw new Error('Ya existe un cliente con ese teléfono');
            }
            
            // Actualizar datos
            Object.assign(clientes[index], clienteData);
            
            // Validar
            const errores = clientes[index].validar();
            if (errores.length > 0) {
                throw new Error('Errores de validación: ' + errores.join(', '));
            }
            
            // Guardar
            this.saveAll(clientes);
            
            return clientes[index];
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            throw error;
        }
    },
    
    // Eliminar cliente
    delete(id) {
        try {
            const clientes = this.getAll();
            const index = clientes.findIndex(c => c.id === id);
            
            if (index === -1) {
                throw new Error('Cliente no encontrado');
            }
            
            clientes.splice(index, 1);
            this.saveAll(clientes);
            
            return true;
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            throw error;
        }
    },
    
    // Verificar si existe por teléfono
    existsByPhone(telefono, excludeId = null) {
        const clientes = this.getAll();
        return clientes.some(c => 
            c.telefono === telefono && c.id !== excludeId
        );
    },
    
    // Buscar clientes
    search(termino) {
        if (!termino.trim()) return this.getAll();
        
        const terminoLower = termino.toLowerCase();
        return this.getAll().filter(cliente =>
            cliente.nombre.toLowerCase().includes(terminoLower) ||
            cliente.telefono.includes(termino) ||
            cliente.email.toLowerCase().includes(terminoLower) ||
            cliente.documento.includes(termino) ||
            cliente.direccion.toLowerCase().includes(terminoLower)
        );
    },
    
    // Obtener clientes por tipo
    getByType(tipo) {
        return this.getAll().filter(c => c.tipo === tipo);
    },
    
    // Obtener clientes activos
    getActive() {
        return this.getAll().filter(c => c.activo);
    },
    
    // Obtener clientes en riesgo
    getClientesEnRiesgo() {
        return this.getAll().filter(c => c.isClienteEnRiesgo());
    },
    
    // Obtener top clientes por valor
    getTopClientes(limite = 10) {
        return this.getAll()
            .filter(c => c.totalGastado > 0)
            .sort((a, b) => b.totalGastado - a.totalGastado)
            .slice(0, limite);
    },
    
    // Registrar pedido para cliente
    registrarPedido(clienteId, pedidoData) {
        const cliente = this.getById(clienteId);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        
        cliente.agregarPedido(pedidoData);
        this.update(clienteId, cliente);
        
        return cliente;
    },
    
    // Obtener estadísticas generales
    getStats() {
        const clientes = this.getAll();
        const activos = clientes.filter(c => c.activo);
        
        // Agrupar por tipo
        const porTipo = {};
        clientes.forEach(c => {
            porTipo[c.tipo] = (porTipo[c.tipo] || 0) + 1;
        });
        
        return {
            total: clientes.length,
            activos: activos.length,
            inactivos: clientes.length - activos.length,
            porTipo: porTipo,
            enRiesgo: this.getClientesEnRiesgo().length,
            
            // Métricas de valor
            totalGastado: clientes.reduce((sum, c) => sum + c.totalGastado, 0),
            ticketPromedio: this.getTicketPromedio(),
            
            // Métricas de actividad
            pedidosTotales: clientes.reduce((sum, c) => sum + c.totalPedidos, 0),
            clientesConPedidos: clientes.filter(c => c.totalPedidos > 0).length
        };
    },
    
    // Obtener ticket promedio general
    getTicketPromedio() {
        const clientesConPedidos = this.getAll().filter(c => c.totalPedidos > 0);
        if (clientesConPedidos.length === 0) return 0;
        
        const sumaTickets = clientesConPedidos.reduce((sum, c) => 
            sum + c.estadisticas.ticketPromedio, 0
        );
        
        return sumaTickets / clientesConPedidos.length;
    },
    
    // Generar reporte de clientes
    generateReport(fechaInicio, fechaFin) {
        const clientes = this.getAll();
        
        return {
            periodo: `${fechaInicio} - ${fechaFin}`,
            resumen: this.getStats(),
            topClientes: this.getTopClientes(10),
            clientesEnRiesgo: this.getClientesEnRiesgo(),
            nuevosClientes: clientes.filter(c => {
                const fechaRegistro = new Date(c.fechaRegistro);
                return fechaRegistro >= new Date(fechaInicio) && 
                       fechaRegistro <= new Date(fechaFin);
            }),
            analisisComportamiento: this.analyzeCustomerBehavior()
        };
    },
    
    // Analizar comportamiento de clientes
    analyzeCustomerBehavior() {
        const clientes = this.getAll().filter(c => c.totalPedidos > 0);
        
        return {
            frecuenciaPromedio: this.getAverageFrecuencia(clientes),
            metodosPagoPopulares: this.getPopularPaymentMethods(clientes),
            tiposEntregaPreferidos: this.getPreferredDeliveryTypes(clientes),
            horariosPopulares: this.getPopularHours(clientes),
            productosPopulares: this.getPopularProducts(clientes)
        };
    },
    
    // Obtener frecuencia promedio
    getAverageFrecuencia(clientes) {
        const frecuencias = clientes
            .filter(c => c.estadisticas.frecuenciaVisitas > 0)
            .map(c => c.estadisticas.frecuenciaVisitas);
        
        if (frecuencias.length === 0) return 0;
        
        return frecuencias.reduce((sum, f) => sum + f, 0) / frecuencias.length;
    },
    
    // Obtener métodos de pago populares
    getPopularPaymentMethods(clientes) {
        const metodos = {};
        
        clientes.forEach(c => {
            if (c.preferencias.metodoPagoFavorito) {
                const metodo = c.preferencias.metodoPagoFavorito;
                metodos[metodo] = (metodos[metodo] || 0) + 1;
            }
        });
        
        return Object.entries(metodos)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5);
    },
    
    // Obtener tipos de entrega preferidos
    getPreferredDeliveryTypes(clientes) {
        const tipos = {};
        
        clientes.forEach(c => {
            const tipo = c.preferencias.tipoEntrega;
            tipos[tipo] = (tipos[tipo] || 0) + 1;
        });
        
        return Object.entries(tipos)
            .sort(([,a], [,b]) => b - a);
    },
    
    // Obtener productos populares
    getPopularProducts(clientes) {
        const productos = {};
        
        clientes.forEach(c => {
            Object.entries(c.estadisticas.productos).forEach(([producto, cantidad]) => {
                productos[producto] = (productos[producto] || 0) + cantidad;
            });
        });
        
        return Object.entries(productos)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10);
    },
    
    // Guardar todos los clientes
    saveAll(clientes) {
        const data = clientes.map(c => c instanceof Cliente ? c.toJSON() : c);
        setStoredData('clientes', data);
    },
    
    // Activar/Desactivar cliente
    toggleActive(id) {
        const cliente = this.getById(id);
        if (!cliente) {
            throw new Error('Cliente no encontrado');
        }
        
        cliente.activo = !cliente.activo;
        this.update(id, cliente);
        
        return cliente;
    }
};

// ============================
// FUNCIONES AUXILIARES
// ============================
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
    module.exports = { Cliente, ClientesManager };
} else {
    window.Cliente = Cliente;
    window.ClientesManager = ClientesManager;
}
