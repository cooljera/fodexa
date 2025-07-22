/**
 * FODEXA - Gestión de Domiciliarios
 * Sistema completo para el manejo de personal de delivery
 */

// ============================
// CLASE DOMICILIARIO
// ============================
class Domiciliario {
    constructor(data) {
        this.id = data.id || generateId();
        this.nombre = data.nombre;
        this.telefono = data.telefono;
        this.email = data.email || '';
        this.documento = data.documento || '';
        this.vehiculo = data.vehiculo; // 'moto', 'bicicleta', 'carro', 'a-pie'
        this.placa = data.placa || '';
        this.estado = data.estado || 'disponible'; // 'disponible', 'ocupado', 'descanso', 'offline'
        this.pedidosAsignados = data.pedidosAsignados || 0;
        this.calificacion = data.calificacion || 5.0;
        this.totalCalificaciones = data.totalCalificaciones || 0;
        this.fechaIngreso = data.fechaIngreso || new Date().toISOString();
        this.zona = data.zona || 'general';
        this.horaInicio = data.horaInicio || null;
        this.horaFin = data.horaFin || null;
        this.ubicacionActual = data.ubicacionActual || null;
        this.estadisticas = data.estadisticas || this.initEstadisticas();
        this.activo = data.activo !== undefined ? data.activo : true;
    }

    // Inicializar estadísticas
    initEstadisticas() {
        return {
            pedidosCompletados: 0,
            pedidosCancelados: 0,
            tiempoPromedioEntrega: 0,
            distanciaRecorrida: 0,
            ingresosTotales: 0,
            calificacionPromedio: 5.0
        };
    }

    // Verificar disponibilidad
    isDisponible() {
        return this.activo && 
               this.estado === 'disponible' && 
               this.pedidosAsignados < this.getMaxPedidos();
    }

    // Obtener máximo de pedidos según vehículo
    getMaxPedidos() {
        const maxPorVehiculo = {
            'moto': 3,
            'bicicleta': 2,
            'carro': 5,
            'a-pie': 1
        };
        return maxPorVehiculo[this.vehiculo] || 2;
    }

    // Asignar pedido
    asignarPedido() {
        if (!this.isDisponible()) {
            throw new Error('Domiciliario no disponible');
        }
        
        this.pedidosAsignados++;
        this.estado = 'ocupado';
        
        if (!this.horaInicio) {
            this.horaInicio = new Date().toISOString();
        }
    }

    // Completar pedido
    completarPedido(tiempoEntrega, calificacion = null) {
        this.pedidosAsignados = Math.max(0, this.pedidosAsignados - 1);
        
        if (this.pedidosAsignados === 0) {
            this.estado = 'disponible';
        }
        
        // Actualizar estadísticas
        this.estadisticas.pedidosCompletados++;
        
        if (tiempoEntrega) {
            this.actualizarTiempoPromedio(tiempoEntrega);
        }
        
        if (calificacion) {
            this.actualizarCalificacion(calificacion);
        }
    }

    // Cancelar pedido
    cancelarPedido() {
        this.pedidosAsignados = Math.max(0, this.pedidosAsignados - 1);
        
        if (this.pedidosAsignados === 0) {
            this.estado = 'disponible';
        }
        
        this.estadisticas.pedidosCancelados++;
    }

    // Actualizar tiempo promedio
    actualizarTiempoPromedio(nuevoTiempo) {
        const totalPedidos = this.estadisticas.pedidosCompletados;
        const tiempoActual = this.estadisticas.tiempoPromedioEntrega;
        
        this.estadisticas.tiempoPromedioEntrega = 
            ((tiempoActual * (totalPedidos - 1)) + nuevoTiempo) / totalPedidos;
    }

    // Actualizar calificación
    actualizarCalificacion(nuevaCalificacion) {
        this.totalCalificaciones++;
        this.calificacion = 
            ((this.calificacion * (this.totalCalificaciones - 1)) + nuevaCalificacion) / 
            this.totalCalificaciones;
        
        this.estadisticas.calificacionPromedio = this.calificacion;
    }

    // Iniciar turno
    iniciarTurno() {
        this.estado = 'disponible';
        this.horaInicio = new Date().toISOString();
    }

    // Finalizar turno
    finalizarTurno() {
        this.estado = 'offline';
        this.horaFin = new Date().toISOString();
        this.pedidosAsignados = 0;
    }

    // Tomar descanso
    tomarDescanso() {
        if (this.pedidosAsignados === 0) {
            this.estado = 'descanso';
        } else {
            throw new Error('No puede tomar descanso con pedidos asignados');
        }
    }

    // Validar datos
    validar() {
        const errores = [];
        
        if (!this.nombre?.trim()) {
            errores.push('Nombre requerido');
        }
        
        if (!this.telefono?.trim()) {
            errores.push('Teléfono requerido');
        }
        
        if (!this.vehiculo) {
            errores.push('Tipo de vehículo requerido');
        }
        
        const vehiculosValidos = ['moto', 'bicicleta', 'carro', 'a-pie'];
        if (!vehiculosValidos.includes(this.vehiculo)) {
            errores.push('Tipo de vehículo inválido');
        }
        
        return errores;
    }

    // Obtener eficiencia
    getEficiencia() {
        const total = this.estadisticas.pedidosCompletados + this.estadisticas.pedidosCancelados;
        if (total === 0) return 100;
        
        return Math.round((this.estadisticas.pedidosCompletados / total) * 100);
    }

    // Exportar a JSON
    toJSON() {
        return {
            id: this.id,
            nombre: this.nombre,
            telefono: this.telefono,
            email: this.email,
            documento: this.documento,
            vehiculo: this.vehiculo,
            placa: this.placa,
            estado: this.estado,
            pedidosAsignados: this.pedidosAsignados,
            calificacion: this.calificacion,
            totalCalificaciones: this.totalCalificaciones,
            fechaIngreso: this.fechaIngreso,
            zona: this.zona,
            horaInicio: this.horaInicio,
            horaFin: this.horaFin,
            ubicacionActual: this.ubicacionActual,
            estadisticas: this.estadisticas,
            activo: this.activo
        };
    }
}

// ============================
// MANAGER DE DOMICILIARIOS
// ============================
const DomiciliariosManager = {
    
    // Obtener todos los domiciliarios
    getAll() {
        const data = getStoredData('domiciliarios') || [];
        return data.map(d => new Domiciliario(d));
    },
    
    // Obtener domiciliario por ID
    getById(id) {
        const domiciliarios = this.getAll();
        return domiciliarios.find(d => d.id === id);
    },
    
    // Crear nuevo domiciliario
    create(domiciliarioData) {
        try {
            const domiciliario = new Domiciliario(domiciliarioData);
            
            // Validar
            const errores = domiciliario.validar();
            if (errores.length > 0) {
                throw new Error('Errores de validación: ' + errores.join(', '));
            }
            
            // Verificar teléfono único
            if (this.existsByPhone(domiciliario.telefono)) {
                throw new Error('Ya existe un domiciliario con ese teléfono');
            }
            
            // Guardar
            const domiciliarios = this.getAll();
            domiciliarios.push(domiciliario);
            this.saveAll(domiciliarios);
            
            return domiciliario;
        } catch (error) {
            console.error('Error creando domiciliario:', error);
            throw error;
        }
    },
    
    // Actualizar domiciliario
    update(id, domiciliarioData) {
        try {
            const domiciliarios = this.getAll();
            const index = domiciliarios.findIndex(d => d.id === id);
            
            if (index === -1) {
                throw new Error('Domiciliario no encontrado');
            }
            
            // Verificar teléfono único (excluyendo el actual)
            if (domiciliarioData.telefono && 
                this.existsByPhone(domiciliarioData.telefono, id)) {
                throw new Error('Ya existe un domiciliario con ese teléfono');
            }
            
            // Actualizar datos
            Object.assign(domiciliarios[index], domiciliarioData);
            
            // Validar
            const errores = domiciliarios[index].validar();
            if (errores.length > 0) {
                throw new Error('Errores de validación: ' + errores.join(', '));
            }
            
            // Guardar
            this.saveAll(domiciliarios);
            
            return domiciliarios[index];
        } catch (error) {
            console.error('Error actualizando domiciliario:', error);
            throw error;
        }
    },
    
    // Eliminar domiciliario
    delete(id) {
        try {
            const domiciliarios = this.getAll();
            const index = domiciliarios.findIndex(d => d.id === id);
            
            if (index === -1) {
                throw new Error('Domiciliario no encontrado');
            }
            
            const domiciliario = domiciliarios[index];
            
            // Verificar que no tenga pedidos asignados
            if (domiciliario.pedidosAsignados > 0) {
                throw new Error('No se puede eliminar un domiciliario con pedidos asignados');
            }
            
            domiciliarios.splice(index, 1);
            this.saveAll(domiciliarios);
            
            return true;
        } catch (error) {
            console.error('Error eliminando domiciliario:', error);
            throw error;
        }
    },
    
    // Verificar si existe por teléfono
    existsByPhone(telefono, excludeId = null) {
        const domiciliarios = this.getAll();
        return domiciliarios.some(d => 
            d.telefono === telefono && d.id !== excludeId
        );
    },
    
    // Obtener domiciliarios disponibles
    getAvailable() {
        return this.getAll().filter(d => d.isDisponible());
    },
    
    // Obtener domiciliarios por estado
    getByStatus(estado) {
        return this.getAll().filter(d => d.estado === estado);
    },
    
    // Obtener domiciliarios activos
    getActive() {
        return this.getAll().filter(d => d.activo);
    },
    
    // Buscar domiciliarios
    search(termino) {
        if (!termino.trim()) return this.getAll();
        
        const terminoLower = termino.toLowerCase();
        return this.getAll().filter(domiciliario =>
            domiciliario.nombre.toLowerCase().includes(terminoLower) ||
            domiciliario.telefono.includes(termino) ||
            domiciliario.email.toLowerCase().includes(terminoLower) ||
            domiciliario.placa.toLowerCase().includes(terminoLower)
        );
    },
    
    // Asignar pedido automáticamente
    autoAssign(zona = null, tipoVehiculo = null) {
        let disponibles = this.getAvailable();
        
        // Filtrar por zona si se especifica
        if (zona) {
            disponibles = disponibles.filter(d => 
                d.zona === zona || d.zona === 'general'
            );
        }
        
        // Filtrar por tipo de vehículo si se especifica
        if (tipoVehiculo) {
            disponibles = disponibles.filter(d => d.vehiculo === tipoVehiculo);
        }
        
        if (disponibles.length === 0) {
            return null;
        }
        
        // Ordenar por criterios de selección:
        // 1. Menos pedidos asignados
        // 2. Mayor calificación
        // 3. Más experiencia (fecha de ingreso)
        disponibles.sort((a, b) => {
            if (a.pedidosAsignados !== b.pedidosAsignados) {
                return a.pedidosAsignados - b.pedidosAsignados;
            }
            if (a.calificacion !== b.calificacion) {
                return b.calificacion - a.calificacion;
            }
            return new Date(a.fechaIngreso) - new Date(b.fechaIngreso);
        });
        
        return disponibles[0];
    },
    
    // Asignar pedido a domiciliario
    assignOrder(domiciliarioId, pedidoData) {
        try {
            const domiciliario = this.getById(domiciliarioId);
            if (!domiciliario) {
                throw new Error('Domiciliario no encontrado');
            }
            
            domiciliario.asignarPedido();
            
            // Actualizar en storage
            this.update(domiciliarioId, domiciliario);
            
            return domiciliario;
        } catch (error) {
            console.error('Error asignando pedido:', error);
            throw error;
        }
    },
    
    // Completar pedido
    completeOrder(domiciliarioId, tiempoEntrega, calificacion = null) {
        try {
            const domiciliario = this.getById(domiciliarioId);
            if (!domiciliario) {
                throw new Error('Domiciliario no encontrado');
            }
            
            domiciliario.completarPedido(tiempoEntrega, calificacion);
            
            // Actualizar en storage
            this.update(domiciliarioId, domiciliario);
            
            return domiciliario;
        } catch (error) {
            console.error('Error completando pedido:', error);
            throw error;
        }
    },
    
    // Cancelar pedido
    cancelOrder(domiciliarioId) {
        try {
            const domiciliario = this.getById(domiciliarioId);
            if (!domiciliario) {
                throw new Error('Domiciliario no encontrado');
            }
            
            domiciliario.cancelarPedido();
            
            // Actualizar en storage
            this.update(domiciliarioId, domiciliario);
            
            return domiciliario;
        } catch (error) {
            console.error('Error cancelando pedido:', error);
            throw error;
        }
    },
    
    // Cambiar estado
    changeStatus(domiciliarioId, nuevoEstado) {
        try {
            const domiciliario = this.getById(domiciliarioId);
            if (!domiciliario) {
                throw new Error('Domiciliario no encontrado');
            }
            
            const estadosValidos = ['disponible', 'ocupado', 'descanso', 'offline'];
            if (!estadosValidos.includes(nuevoEstado)) {
                throw new Error('Estado inválido');
            }
            
            // Validaciones específicas
            if (nuevoEstado === 'descanso' && domiciliario.pedidosAsignados > 0) {
                throw new Error('No puede tomar descanso con pedidos asignados');
            }
            
            domiciliario.estado = nuevoEstado;
            
            // Actualizar horas según el estado
            if (nuevoEstado === 'disponible' && !domiciliario.horaInicio) {
                domiciliario.horaInicio = new Date().toISOString();
            } else if (nuevoEstado === 'offline') {
                domiciliario.horaFin = new Date().toISOString();
            }
            
            // Actualizar en storage
            this.update(domiciliarioId, domiciliario);
            
            return domiciliario;
        } catch (error) {
            console.error('Error cambiando estado:', error);
            throw error;
        }
    },
    
    // Obtener estadísticas generales
    getStats() {
        const domiciliarios = this.getAll();
        const activos = domiciliarios.filter(d => d.activo);
        
        return {
            total: domiciliarios.length,
            activos: activos.length,
            disponibles: domiciliarios.filter(d => d.estado === 'disponible').length,
            ocupados: domiciliarios.filter(d => d.estado === 'ocupado').length,
            enDescanso: domiciliarios.filter(d => d.estado === 'descanso').length,
            offline: domiciliarios.filter(d => d.estado === 'offline').length,
            
            // Por vehículo
            porVehiculo: this.groupByVehicle(activos),
            
            // Calificación promedio
            calificacionPromedio: this.getAverageRating(activos),
            
            // Eficiencia promedio
            eficienciaPromedio: this.getAverageEfficiency(activos)
        };
    },
    
    // Agrupar por vehículo
    groupByVehicle(domiciliarios) {
        const grupos = {};
        
        domiciliarios.forEach(d => {
            if (!grupos[d.vehiculo]) {
                grupos[d.vehiculo] = 0;
            }
            grupos[d.vehiculo]++;
        });
        
        return grupos;
    },
    
    // Obtener calificación promedio
    getAverageRating(domiciliarios) {
        if (domiciliarios.length === 0) return 0;
        
        const total = domiciliarios.reduce((sum, d) => sum + d.calificacion, 0);
        return Math.round((total / domiciliarios.length) * 10) / 10;
    },
    
    // Obtener eficiencia promedio
    getAverageEfficiency(domiciliarios) {
        if (domiciliarios.length === 0) return 0;
        
        const total = domiciliarios.reduce((sum, d) => sum + d.getEficiencia(), 0);
        return Math.round(total / domiciliarios.length);
    },
    
    // Obtener top performers
    getTopPerformers(limite = 5) {
        return this.getActive()
            .filter(d => d.estadisticas.pedidosCompletados > 0)
            .sort((a, b) => {
                // Ordenar por calificación y eficiencia
                const scoreA = (a.calificacion * 0.6) + (a.getEficiencia() * 0.4);
                const scoreB = (b.calificacion * 0.6) + (b.getEficiencia() * 0.4);
                return scoreB - scoreA;
            })
            .slice(0, limite);
    },
    
    // Generar reporte de rendimiento
    generatePerformanceReport(fechaInicio, fechaFin) {
        const domiciliarios = this.getAll();
        
        return {
            periodo: `${fechaInicio} - ${fechaFin}`,
            resumen: this.getStats(),
            topPerformers: this.getTopPerformers(),
            detallesPorDomiciliario: domiciliarios.map(d => ({
                id: d.id,
                nombre: d.nombre,
                estadisticas: d.estadisticas,
                calificacion: d.calificacion,
                eficiencia: d.getEficiencia(),
                estado: d.estado,
                vehiculo: d.vehiculo
            }))
        };
    },
    
    // Guardar todos los domiciliarios
    saveAll(domiciliarios) {
        const data = domiciliarios.map(d => d instanceof Domiciliario ? d.toJSON() : d);
        setStoredData('domiciliarios', data);
    },
    
    // Activar/Desactivar domiciliario
    toggleActive(id) {
        const domiciliario = this.getById(id);
        if (!domiciliario) {
            throw new Error('Domiciliario no encontrado');
        }
        
        domiciliario.activo = !domiciliario.activo;
        
        // Si se desactiva, ponerlo offline
        if (!domiciliario.activo) {
            domiciliario.estado = 'offline';
            domiciliario.pedidosAsignados = 0;
        }
        
        this.update(id, domiciliario);
        
        return domiciliario;
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
    module.exports = { Domiciliario, DomiciliariosManager };
} else {
    window.Domiciliario = Domiciliario;
    window.DomiciliariosManager = DomiciliariosManager;
}
