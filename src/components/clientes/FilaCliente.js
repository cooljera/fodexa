/**
 * Componente FilaCliente - Representa una fila individual en la tabla de clientes
 * Sistema FODEXA POS
 */

class FilaCliente {
    constructor(cliente, index, callbacks = {}) {
        this.cliente = cliente;
        this.index = index;
        this.callbacks = callbacks;
    }

    render() {
        const tr = document.createElement('tr');
        tr.className = 'cliente-row';
        tr.setAttribute('data-cliente-id', this.cliente.id);
        
        // Agregar clase para filas alternas
        if (this.index % 2 === 0) {
            tr.classList.add('row-even');
        } else {
            tr.classList.add('row-odd');
        }

        tr.innerHTML = `
            <!-- Columna Nombre -->
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

            <!-- Columna Apellido -->
            <td class="td-apellido">
                <span class="apellido-text">${this.escapeHtml(this.cliente.apellido)}</span>
            </td>

            <!-- Columna Teléfono -->
            <td class="td-telefono">
                <div class="telefono-container">
                    <i class="fas fa-phone telefono-icon"></i>
                    <a href="tel:${this.cliente.telefono}" class="telefono-link">
                        ${this.formatearTelefono(this.cliente.telefono)}
                    </a>
                    <button class="btn-copiar-telefono" title="Copiar teléfono" onclick="event.stopPropagation(); this.copiarTelefono('${this.cliente.telefono}')">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </td>

            <!-- Columna Dirección -->
            <td class="td-direccion">
                <div class="direccion-container">
                    <i class="fas fa-map-marker-alt direccion-icon"></i>
                    <span class="direccion-text" title="${this.escapeHtml(this.cliente.direccion)}">
                        ${this.truncarTexto(this.cliente.direccion, 40)}
                    </span>
                    ${this.cliente.direccion.length > 40 ? '<button class="btn-ver-mas" title="Ver dirección completa"><i class="fas fa-eye"></i></button>' : ''}
                </div>
            </td>

            <!-- Columna Acciones -->
            <td class="td-acciones">
                <div class="acciones-container">
                    <button class="btn btn-action btn-editar" 
                            onclick="event.stopPropagation();" 
                            title="Editar cliente"
                            data-cliente-id="${this.cliente.id}">
                        <i class="fas fa-edit"></i>
                        <span class="btn-text">Editar</span>
                    </button>
                    
                    <button class="btn btn-action btn-eliminar" 
                            onclick="event.stopPropagation();" 
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
                            <button class="dropdown-item" onclick="event.stopPropagation();">
                                <i class="fas fa-eye"></i>
                                Ver Detalles
                            </button>
                            <button class="dropdown-item" onclick="event.stopPropagation();">
                                <i class="fas fa-history"></i>
                                Historial de Compras
                            </button>
                            <button class="dropdown-item" onclick="event.stopPropagation();">
                                <i class="fab fa-whatsapp"></i>
                                Enviar WhatsApp
                            </button>
                            <hr class="dropdown-divider">
                            <button class="dropdown-item text-danger" onclick="event.stopPropagation();">
                                <i class="fas fa-ban"></i>
                                Desactivar Cliente
                            </button>
                        </div>
                    </div>
                </div>
            </td>
        `;

        // Configurar eventos específicos de esta fila
        this.configurarEventosFila(tr);

        return tr;
    }

    configurarEventosFila(tr) {
        // Evento click en la fila (para ver detalles)
        tr.addEventListener('click', (e) => {
            if (!e.target.closest('button') && !e.target.closest('a')) {
                this.verDetallesCliente();
            }
        });

        // Botón editar
        const btnEditar = tr.querySelector('.btn-editar');
        if (btnEditar) {
            btnEditar.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.callbacks.onEditar) {
                    this.callbacks.onEditar(this.cliente.id);
                }
            });
        }

        // Botón eliminar
        const btnEliminar = tr.querySelector('.btn-eliminar');
        if (btnEliminar) {
            btnEliminar.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.callbacks.onEliminar) {
                    this.callbacks.onEliminar(this.cliente.id);
                }
            });
        }

        // Dropdown de más acciones
        this.configurarDropdown(tr);

        // Botón ver más dirección
        const btnVerMas = tr.querySelector('.btn-ver-mas');
        if (btnVerMas) {
            btnVerMas.addEventListener('click', (e) => {
                e.stopPropagation();
                this.mostrarDireccionCompleta();
            });
        }

        // Hover effects
        this.configurarHoverEffects(tr);
    }

    configurarDropdown(tr) {
        const btnDropdown = tr.querySelector('.btn-mas-acciones');
        const dropdownMenu = tr.querySelector('.dropdown-menu');
        
        if (btnDropdown && dropdownMenu) {
            btnDropdown.addEventListener('click', (e) => {
                e.stopPropagation();
                
                // Cerrar otros dropdowns abiertos
                document.querySelectorAll('.dropdown-menu.show').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.remove('show');
                    }
                });
                
                // Toggle este dropdown
                dropdownMenu.classList.toggle('show');
            });

            // Cerrar dropdown al hacer click fuera
            document.addEventListener('click', (e) => {
                if (!tr.contains(e.target)) {
                    dropdownMenu.classList.remove('show');
                }
            });

            // Configurar elementos del dropdown
            const dropdownItems = dropdownMenu.querySelectorAll('.dropdown-item');
            dropdownItems.forEach((item, index) => {
                item.addEventListener('click', (e) => {
                    e.stopPropagation();
                    dropdownMenu.classList.remove('show');
                    this.manejarAccionDropdown(index);
                });
            });
        }
    }

    configurarHoverEffects(tr) {
        // Efectos de hover para mejorar la experiencia de usuario
        tr.addEventListener('mouseenter', () => {
            tr.classList.add('row-hover');
        });

        tr.addEventListener('mouseleave', () => {
            tr.classList.remove('row-hover');
        });
    }

    // ===== MÉTODOS DE UTILIDAD =====

    escapeHtml(texto) {
        const div = document.createElement('div');
        div.textContent = texto;
        return div.innerHTML;
    }

    truncarTexto(texto, longitud) {
        if (texto.length <= longitud) {
            return texto;
        }
        return texto.substring(0, longitud) + '...';
    }

    formatearTelefono(telefono) {
        // Formatear teléfono colombiano
        const limpio = telefono.replace(/\D/g, '');
        if (limpio.length === 10) {
            return limpio.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        }
        return telefono;
    }

    formatearFechaRegistro(fecha) {
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
                return `Registrado hace ${dias} días`;
            } else if (dias < 365) {
                const meses = Math.floor(dias / 30);
                return `Registrado hace ${meses} mes${meses > 1 ? 'es' : ''}`;
            } else {
                return fechaObj.toLocaleDateString('es-CO');
            }
        } catch (error) {
            return 'Fecha no válida';
        }
    }

    // ===== MÉTODOS DE ACCIONES =====

    verDetallesCliente() {
        console.log('👁️ Viendo detalles del cliente:', this.cliente.nombre);
        // Implementar vista de detalles
        this.mostrarModalDetalles();
    }

    mostrarModalDetalles() {
        // Crear modal temporal para mostrar detalles
        const modalHTML = `
            <div id="modal-detalles-cliente-${this.cliente.id}" class="modal modal-detalles">
                <div class="modal-overlay"></div>
                <div class="modal-content">
                    <div class="modal-header">
                        <h3>Detalles del Cliente</h3>
                        <button class="modal-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="cliente-detalles">
                            <div class="detalle-item">
                                <strong>Nombre Completo:</strong>
                                <span>${this.cliente.nombre} ${this.cliente.apellido}</span>
                            </div>
                            <div class="detalle-item">
                                <strong>Teléfono:</strong>
                                <span>${this.cliente.telefono}</span>
                            </div>
                            <div class="detalle-item">
                                <strong>Email:</strong>
                                <span>${this.cliente.email || 'No registrado'}</span>
                            </div>
                            <div class="detalle-item">
                                <strong>Dirección:</strong>
                                <span>${this.cliente.direccion}</span>
                            </div>
                            <div class="detalle-item">
                                <strong>Fecha de Registro:</strong>
                                <span>${this.formatearFechaRegistro(this.cliente.fechaRegistro)}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button class="btn btn-secondary modal-close">Cerrar</button>
                        <button class="btn btn-primary" onclick="this.editarCliente()">Editar Cliente</button>
                    </div>
                </div>
            </div>
        `;

        // Agregar modal al DOM
        document.body.insertAdjacentHTML('beforeend', modalHTML);
        
        // Mostrar modal
        const modal = document.getElementById(`modal-detalles-cliente-${this.cliente.id}`);
        if (modal) {
            modal.classList.add('show');
            
            // Configurar eventos de cierre
            modal.querySelectorAll('.modal-close, .modal-overlay').forEach(element => {
                element.addEventListener('click', () => {
                    modal.remove();
                });
            });
        }
    }

    copiarTelefono(telefono) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(telefono).then(() => {
                this.mostrarTooltip('Teléfono copiado');
            });
        } else {
            // Fallback para navegadores más antiguos
            const textArea = document.createElement('textarea');
            textArea.value = telefono;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.mostrarTooltip('Teléfono copiado');
        }
    }

    mostrarDireccionCompleta() {
        // Mostrar tooltip con dirección completa
        this.mostrarTooltip(this.cliente.direccion, 3000);
    }

    mostrarTooltip(mensaje, duracion = 2000) {
        // Crear tooltip temporal
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip-temporal';
        tooltip.textContent = mensaje;
        
        // Posicionar cerca del cursor
        tooltip.style.position = 'fixed';
        tooltip.style.top = '50%';
        tooltip.style.left = '50%';
        tooltip.style.transform = 'translate(-50%, -50%)';
        tooltip.style.backgroundColor = '#333';
        tooltip.style.color = '#fff';
        tooltip.style.padding = '8px 12px';
        tooltip.style.borderRadius = '4px';
        tooltip.style.fontSize = '14px';
        tooltip.style.zIndex = '10000';
        tooltip.style.opacity = '0';
        tooltip.style.transition = 'opacity 0.3s ease';
        
        document.body.appendChild(tooltip);
        
        // Mostrar con animación
        setTimeout(() => {
            tooltip.style.opacity = '1';
        }, 10);
        
        // Ocultar después del tiempo especificado
        setTimeout(() => {
            tooltip.style.opacity = '0';
            setTimeout(() => {
                tooltip.remove();
            }, 300);
        }, duracion);
    }

    manejarAccionDropdown(index) {
        switch (index) {
            case 0: // Ver Detalles
                this.verDetallesCliente();
                break;
            case 1: // Historial de Compras
                console.log('📈 Viendo historial de compras para:', this.cliente.nombre);
                break;
            case 2: // Enviar WhatsApp
                this.enviarWhatsApp();
                break;
            case 3: // Desactivar Cliente (después del separador)
                console.log('🚫 Desactivando cliente:', this.cliente.nombre);
                break;
            default:
                console.log('Acción no reconocida');
        }
    }

    enviarWhatsApp() {
        const telefono = this.cliente.telefono.replace(/\D/g, '');
        const mensaje = encodeURIComponent(`Hola ${this.cliente.nombre}, te contactamos desde FODEXA.`);
        const url = `https://wa.me/57${telefono}?text=${mensaje}`;
        window.open(url, '_blank');
    }
}

// Exportar para uso en otros módulos
export default FilaCliente;

// Hacer disponible globalmente
if (typeof window !== 'undefined') {
    window.FilaCliente = FilaCliente;
}
