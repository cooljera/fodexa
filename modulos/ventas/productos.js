// Ejemplo: Renderizar tarjetas de productos y categorías
window.addEventListener('DOMContentLoaded', function() {
  // Tarjetas de ejemplo para productos
  var productos = [
    { nombre: 'Hamburguesa Clásica', categoria: 'Comidas rápidas', precio: '$18.000' },
    { nombre: 'Pizza Margarita', categoria: 'Pizzas', precio: '$22.000' }
  ];
  var contProd = document.getElementById('contenedor-tarjetas-productos');
  contProd.innerHTML = productos.map(function(p) {
    return `<div class="tarjeta-prod">
      <div class="tarjeta-titulo"><i class="fas fa-box"></i> ${p.nombre}</div>
      <div><strong>Categoría:</strong> ${p.categoria}</div>
      <div><strong>Precio:</strong> ${p.precio}</div>
      <div class="tarjeta-acciones">
        <button class="btn-tarjeta btn-editar"><i class="fas fa-edit"></i></button>
        <button class="btn-tarjeta btn-eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');

  // Tarjetas de ejemplo para categorías
  var categorias = [
    { nombre: 'Comidas rápidas' },
    { nombre: 'Pizzas' }
  ];
  var contCat = document.getElementById('contenedor-tarjetas-categorias');
  contCat.innerHTML = categorias.map(function(c) {
    return `<div class="tarjeta-prod">
      <div class="tarjeta-titulo"><i class="fas fa-tags"></i> ${c.nombre}</div>
      <div class="tarjeta-acciones">
        <button class="btn-tarjeta btn-editar"><i class="fas fa-edit"></i></button>
        <button class="btn-tarjeta btn-eliminar"><i class="fas fa-trash"></i></button>
      </div>
    </div>`;
  }).join('');
});

// Modal de formulario para agregar producto
function mostrarModalProducto() {
  var modal = document.createElement('div');
  modal.className = 'modal-prod';
  modal.innerHTML = `
    <div class="modal-contenido">
      <h2 class="seccion-titulo"><i class="fas fa-plus"></i> Nuevo Producto</h2>
      <form class="form-prod">
        <div class="form-row">
          <label for="nombre-prod">Nombre</label>
          <input type="text" id="nombre-prod" required>
        </div>
        <div class="form-row">
          <label for="categoria-prod">Categoría</label>
          <select id="categoria-prod"><option>Comidas rápidas</option><option>Pizzas</option></select>
        </div>
        <div class="form-row">
          <label for="precio-prod">Precio</label>
          <input type="number" id="precio-prod" required>
        </div>
        <button type="submit" class="btn-form">Guardar</button>
      </form>
      <button class="btn-form" id="cerrar-modal-prod" style="margin-top:1rem;">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('cerrar-modal-prod').onclick = function() {
    document.body.removeChild(modal);
  };
  modal.querySelector('form').onsubmit = function(e) {
    e.preventDefault();
    // Aquí iría la lógica para guardar el producto
    document.body.removeChild(modal);
  };
}
document.getElementById('btn-agregar-producto').onclick = mostrarModalProducto;

// Modal de formulario para agregar categoría
function mostrarModalCategoria() {
  var modal = document.createElement('div');
  modal.className = 'modal-prod';
  modal.innerHTML = `
    <div class="modal-contenido">
      <h2 class="seccion-titulo"><i class="fas fa-plus"></i> Nueva Categoría</h2>
      <form class="form-prod">
        <div class="form-row">
          <label for="nombre-cat">Nombre</label>
          <input type="text" id="nombre-cat" required>
        </div>
        <button type="submit" class="btn-form">Guardar</button>
      </form>
      <button class="btn-form" id="cerrar-modal-cat" style="margin-top:1rem;">Cancelar</button>
    </div>
  `;
  document.body.appendChild(modal);
  document.getElementById('cerrar-modal-cat').onclick = function() {
    document.body.removeChild(modal);
  };
  modal.querySelector('form').onsubmit = function(e) {
    e.preventDefault();
    // Aquí iría la lógica para guardar la categoría
    document.body.removeChild(modal);
  };
}
document.getElementById('btn-agregar-categoria').onclick = mostrarModalCategoria;
// Navegación modular para Gestión de Productos (estilo inventario)
window.fodexaNavegacionProductos = function() {
  var btns = document.querySelectorAll('.menu-btn-prod');
  var secciones = [
    document.getElementById('seccion-categorias'),
    document.getElementById('seccion-productos'),
    document.getElementById('seccion-configuracion')
  ];
  btns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      btns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');
      var section = btn.getAttribute('data-section');
      secciones.forEach(function(sec) {
        if (sec.id === 'seccion-' + section) {
          sec.classList.remove('hidden'); sec.classList.add('visible');
        } else {
          sec.classList.remove('visible'); sec.classList.add('hidden');
        }
      });
    });
  });
}

// Ejecutar al cargar
document.addEventListener('DOMContentLoaded', function() {
  if (document.querySelector('.menu-btn-prod')) {
    window.fodexaNavegacionProductos();
  }
});
function renderizarTarjetasProductos(productos) {
    const contenedor = document.getElementById('contenedor-tarjetas-productos');
    if (!contenedor) return;
    contenedor.innerHTML = '';
    if (!productos || productos.length === 0) {
        contenedor.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:#888;font-size:18px;padding:32px 0;">No hay productos registrados.</div>';
        return;
    }
    productos.forEach(producto => {
        const estado = producto.disponible ? 'Activo' : 'Inactivo';
        const colorEstado = producto.disponible ? '#27ae60' : '#e74c3c';
        const card = document.createElement('div');
        card.className = 'tarjeta-producto';
        card.style = 'background:#fff;border-radius:14px;box-shadow:0 2px 10px rgba(0,0,0,0.07);padding:22px 20px 18px 20px;display:flex;flex-direction:column;gap:10px;position:relative;';
        card.innerHTML = `
            <div style="display:flex;align-items:center;justify-content:space-between;">
                <h3 style="font-size:1.2rem;font-weight:700;color:#2563eb;margin:0;">${producto.nombre}</h3>
                <span style="font-size:13px;font-weight:600;padding:4px 12px;border-radius:12px;background:${colorEstado}22;color:${colorEstado};">${estado}</span>
            </div>
            <div style="font-size:15px;color:#888;margin-bottom:2px;">Código: <b>${producto.codigo || '-'}</b></div>
            <div style="font-size:15px;color:#444;margin-bottom:2px;">Categoría: <b>${producto.categoria || '-'}</b></div>
            <div style="font-size:15px;color:#444;margin-bottom:2px;">Precio: <b>$${producto.precio?.toLocaleString() || '-'}</b></div>
            <div style="font-size:15px;color:#444;margin-bottom:2px;">Stock: <b>${producto.stock ?? '-'}</b></div>
            <div style="display:flex;gap:10px;margin-top:10px;">
                <button class="btn-editar-producto" onclick="editarProducto('${producto.id}')" style="background:#2563eb;color:#fff;border:none;border-radius:6px;padding:6px 16px;font-size:15px;cursor:pointer;">🖊️ Editar</button>
                <button class="btn-eliminar-producto" onclick="eliminarProducto('${producto.id}')" style="background:#e74c3c;color:#fff;border:none;border-radius:6px;padding:6px 16px;font-size:15px;cursor:pointer;">🗑️ Eliminar</button>
                <button class="btn-estadisticas-producto" onclick="verEstadisticasProducto('${producto.id}','${producto.nombre.replace(/'/g, '\'')}')" style="background:#f5f6fa;color:#2563eb;border:none;border-radius:6px;padding:6px 16px;font-size:15px;cursor:pointer;">📊 Ver estadísticas</button>
            </div>
        `;
        contenedor.appendChild(card);
    });
// Mostrar modal de estadísticas de producto
function verEstadisticasProducto(id, nombre) {
    const modal = document.getElementById('modal-estadisticas-producto');
    if (!modal) return;
    document.getElementById('titulo-estadisticas-producto').textContent = `Estadísticas de "${nombre}"`;
    // Cargar historial de ventas desde pedidos.json
    fetch('data/pedidos.json')
        .then(res => res.json())
        .then(data => {
            const pedidos = data.pedidos || [];
            let historial = [];
            pedidos.forEach(pedido => {
                if (!pedido.productos) return;
                pedido.productos.forEach(prod => {
                    if (prod.id === id) {
                        historial.push({
                            fecha: pedido.fechaCreacion,
                            cantidad: prod.cantidad,
                            total: prod.precio * prod.cantidad,
                            cliente: pedido.cliente?.nombre || '-'
                        });
                    }
                });
            });
            // Render tabla
            const tbody = document.getElementById('tabla-historial-ventas-producto');
            tbody.innerHTML = '';
            let totalUnidades = 0;
            let totalDinero = 0;
            historial.forEach(item => {
                totalUnidades += item.cantidad;
                totalDinero += item.total;
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td style="padding:6px 4px;">${new Date(item.fecha).toLocaleString()}</td>
                    <td style="padding:6px 4px;">${item.cantidad}</td>
                    <td style="padding:6px 4px;">$${item.total.toLocaleString()}</td>
                    <td style="padding:6px 4px;">${item.cliente}</td>
                `;
                tbody.appendChild(tr);
            });
            // Resumen
            document.getElementById('resumen-estadisticas-producto').innerHTML = `
                <b>Total unidades vendidas:</b> ${totalUnidades} <br>
                <b>Total generado:</b> $${totalDinero.toLocaleString()}
            `;
            // Mini gráfica de barras semanal (opcional, simple)
            const grafica = document.getElementById('grafica-estadisticas-producto');
            if (historial.length > 0) {
                // Agrupar por semana (año-semana)
                const barras = {};
                historial.forEach(item => {
                    const d = new Date(item.fecha);
                    const year = d.getFullYear();
                    const week = Math.ceil((((d - new Date(year,0,1)) / 86400000) + new Date(year,0,1).getDay()+1)/7);
                    const key = `${year}-S${week}`;
                    barras[key] = (barras[key] || 0) + item.cantidad;
                });
                const labels = Object.keys(barras);
                const values = Object.values(barras);
                let max = Math.max(...values, 1);
                grafica.innerHTML = `<div style='display:flex;align-items:end;gap:8px;height:60px;margin-bottom:8px;'>${values.map((v,i)=>`<div title='${labels[i]}: ${v}' style='width:22px;height:${Math.round((v/max)*54)}px;background:#2563eb;border-radius:4px 4px 0 0;'></div>`).join('')}</div><div style='font-size:12px;color:#888;text-align:center;'>Ventas por semana</div>`;
            } else {
                grafica.innerHTML = '';
            }
            modal.style.display = 'flex';
        });
}

function cerrarModalEstadisticasProducto() {
    const modal = document.getElementById('modal-estadisticas-producto');
    if (modal) modal.style.display = 'none';

// Inicializar vista de productos
function inicializarVistaProductos() {
    let productos = [];
    // Intentar cargar desde localStorage o IndexedDB si existe lógica, si no, cargar desde JSON
    if (typeof ProductosManager !== 'undefined' && ProductosManager.getAll) {
        productos = ProductosManager.getAll();
    } else {
        // fallback: cargar desde archivo JSON (requiere fetch y servidor local)
        fetch('data/productos.json')
            .then(res => res.json())
            .then(data => {
                productos = data.productos || [];
                renderizarTarjetasProductos(productos);
            });
        return;
    }
    renderizarTarjetasProductos(productos);
}

// Buscador de productos
document.addEventListener('DOMContentLoaded', () => {
    const buscador = document.getElementById('buscador-productos');
    if (buscador) {
        buscador.addEventListener('input', function() {
            let productos = [];
            if (typeof ProductosManager !== 'undefined' && ProductosManager.getAll) {
                productos = ProductosManager.getAll();
            }
            const filtro = buscador.value.trim().toLowerCase();
            if (filtro) {
                productos = productos.filter(p => p.nombre.toLowerCase().includes(filtro));
            }
            renderizarTarjetasProductos(productos);
        });
    }
});

// Mostrar la vista de productos y cargar productos
function mostrarVistaProductos() {
    // Ocultar otras vistas principales si existen
    const secciones = [
        document.querySelector('[data-module="ventas"]'),
        document.querySelector('[data-module="domicilios"]'),
        document.querySelector('[data-module="clientes"]'),
        document.querySelector('[data-module="inventario"]'),
        document.querySelector('[data-module="reportes"]')
    ];
    secciones.forEach(sec => { if(sec) sec.style.display = 'none'; });
    // Mostrar la vista de productos
    const vista = document.getElementById('vista-productos');
    if(vista) vista.style.display = 'block';
    inicializarVistaProductos();
}

// Placeholder para crear producto
function abrirModalCrearProducto() {
    alert('Funcionalidad para crear nuevo producto próximamente.');
}

// Placeholder para editar producto
function editarProducto(id) {
    // Obtener producto
    const producto = ProductosManager.getById(id);
    if (!producto) return alert('Producto no encontrado');
    // Mostrar modal de edición (asume que existe un modal con tabs)
    mostrarModalEdicionProducto(producto);
}

// Renderizar modal de edición de producto con pestaña Insumos
function mostrarModalEdicionProducto(producto) {
    // Crear modal si no existe
    let modal = document.getElementById('modal-editar-producto');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-editar-producto';
        modal.className = 'modal-producto';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="tabs">
                    <button id="tab-info" class="tab-btn active">Información</button>
                    <button id="tab-insumos" class="tab-btn">Insumos</button>
                </div>
                <div id="tab-info-content" class="tab-content active"></div>
                <div id="tab-insumos-content" class="tab-content"></div>
                <button onclick="document.getElementById('modal-editar-producto').style.display='none'">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
        // Tabs logic
        modal.querySelector('#tab-info').onclick = function() {
            modal.querySelector('#tab-info').classList.add('active');
            modal.querySelector('#tab-insumos').classList.remove('active');
            modal.querySelector('#tab-info-content').classList.add('active');
            modal.querySelector('#tab-insumos-content').classList.remove('active');
        };
        modal.querySelector('#tab-insumos').onclick = function() {
            modal.querySelector('#tab-insumos').classList.add('active');
            modal.querySelector('#tab-info').classList.remove('active');
            modal.querySelector('#tab-insumos-content').classList.add('active');
            modal.querySelector('#tab-info-content').classList.remove('active');
        };
    }
    // Calcular costo de producción y margen
    const costoProduccion = calcularCostoProduccion(producto.insumos || []);
    const precioVenta = Number(producto.precio) || 0;
    const { ganancia, margen } = calcularMargenGanancia(precioVenta, costoProduccion);
    // Render info tab (puedes expandir con más campos)
    modal.querySelector('#tab-info-content').innerHTML = `
        <h3>Editar Producto</h3>
        <div><b>Nombre:</b> ${producto.nombre}</div>
        <div><b>Código:</b> ${producto.codigo}</div>
        <div><b>Precio:</b> $${producto.precio}</div>
        <div><b>Stock:</b> ${producto.stock}</div>
        <div><b>Categoría:</b> ${producto.categoria}</div>
        <div style="margin-top:10px;"><b>Costo de producción estimado:</b> <span id="costo-produccion-estimado">$${costoProduccion.toLocaleString(undefined, {maximumFractionDigits:2})}</span></div>
        <div><b>Ganancia bruta:</b> <span id="ganancia-bruta">$${ganancia.toLocaleString(undefined, {maximumFractionDigits:2})}</span></div>
        <div><b>Margen:</b> <span id="margen-porcentaje">${margen}%</span></div>
    `;
    // Función para actualizar los campos de costo/margen en el modal
    modal.actualizarCostosProducto = function(prod) {
        const costo = calcularCostoProduccion(prod.insumos || []);
        const precio = Number(prod.precio) || 0;
        const { ganancia, margen } = calcularMargenGanancia(precio, costo);
        modal.querySelector('#costo-produccion-estimado').textContent = `$${costo.toLocaleString(undefined, {maximumFractionDigits:2})}`;
        modal.querySelector('#ganancia-bruta').textContent = `$${ganancia.toLocaleString(undefined, {maximumFractionDigits:2})}`;
        modal.querySelector('#margen-porcentaje').textContent = `${margen}%`;
    };
    // Render insumos tab
    renderizarTabInsumos(producto, modal);
    modal.style.display = 'flex';
}

// Renderizar la pestaña de insumos para un producto
function renderizarTabInsumos(producto, modal) {
    const cont = document.getElementById('modal-editar-producto').querySelector('#tab-insumos-content');
    let html = '<h3>Insumos del producto</h3>';
    html += '<table style="width:100%;margin-bottom:10px;"><tr><th>Insumo</th><th>Cantidad</th><th>Acciones</th></tr>';
    if (producto.insumos && producto.insumos.length > 0) {
        producto.insumos.forEach((insumo, idx) => {
            const insumoProd = window.ProductosManager.getById(insumo.id);
            // Verificar alerta de stock mínimo
            let alerta = '';
            let clase = '';
            if (insumoProd) {
                if (insumoEnAlerta(insumoProd)) {
                    alerta = `<span title="${mensajeAlertaInsumo(insumoProd)}" style="margin-left:6px;cursor:pointer;">${iconoAlertaInsumo(insumoProd)}</span>`;
                    clase = claseAlertaInsumo(insumoProd);
                }
            }
            html += `<tr class="${clase}">
                <td>${insumoProd ? insumoProd.nombre : '(Insumo eliminado)'} ${alerta}</td>
                <td><input type='text' value='${insumo.cantidad}' style='width:60px' onchange='actualizarCantidadInsumo(${producto.id},${idx},this.value)' /></td>
                <td>
                    <button onclick="eliminarInsumoDeProducto(${producto.id},${idx})">Eliminar</button>
                </td>
            </tr>`;
        });
    } else {
        html += '<tr><td colspan="3" style="color:#888;">Sin insumos</td></tr>';
    }
    html += '</table>';
    html += `<div style='display:flex;gap:8px;align-items:center;'>
        <input id='autocomplete-insumo' type='text' placeholder='Buscar insumo...' style='width:180px;' autocomplete='off' />
        <input id='autocomplete-cantidad' type='text' placeholder='Cantidad' style='width:80px;' />
        <button id='btn-agregar-insumo-rapido'>Agregar</button>
        <button id='btn-nuevo-insumo-rapido'>Crear insumo</button>
    </div>`;
    cont.innerHTML = html;
    // Cuando se modifique la cantidad de un insumo, actualizar costos
    cont.querySelectorAll('input[type="text"]').forEach((input, idx) => {
        input.addEventListener('change', function() {
            // Actualizar cantidad en el producto
            producto.insumos[idx].cantidad = Number(this.value) || 0;
            if (modal && typeof modal.actualizarCostosProducto === 'function') {
                modal.actualizarCostosProducto(producto);
            }
        });
    });
    // Si se agregan/eliminan insumos, también actualizar costos (debería llamarse después de cada acción)
    // Puedes llamar modal.actualizarCostosProducto(producto) después de agregar/eliminar insumos
}
    // Autocomplete de insumos
    const input = cont.querySelector('#autocomplete-insumo');
    const lista = window.ProductosManager.getAll().filter(p => p.id !== producto.id);
    let sugerencias = [];
    input.oninput = function() {
        const val = input.value.toLowerCase();
        sugerencias = lista.filter(p => p.nombre.toLowerCase().includes(val));
        let datalist = document.getElementById('autocomplete-list-insumos');
        if (!datalist) {
            datalist = document.createElement('div');
            datalist.id = 'autocomplete-list-insumos';
            datalist.style.position = 'absolute';
            datalist.style.background = '#fff';
            datalist.style.border = '1px solid #ccc';
            datalist.style.zIndex = 1000;
            input.parentNode.appendChild(datalist);
        }
        datalist.innerHTML = '';
        sugerencias.forEach(p => {
            const opt = document.createElement('div');
            opt.textContent = p.nombre;
            opt.style.padding = '4px 8px';
            opt.style.cursor = 'pointer';
            opt.onclick = function() {
                input.value = p.nombre;
                datalist.innerHTML = '';
            };
            datalist.appendChild(opt);
        });
        if (val === '' || sugerencias.length === 0) datalist.innerHTML = '';
    };
    document.addEventListener('click', function(e) {
        if (e.target !== input) {
            const datalist = document.getElementById('autocomplete-list-insumos');
            if (datalist) datalist.innerHTML = '';
        }
    });
    // Agregar insumo rápido
    cont.querySelector('#btn-agregar-insumo-rapido').onclick = function() {
        const nombre = input.value.trim();
        const cantidad = cont.querySelector('#autocomplete-cantidad').value.trim();
        if (!nombre || !cantidad) return alert('Completa nombre y cantidad');
        const insumo = lista.find(p => p.nombre.toLowerCase() === nombre.toLowerCase());
        if (!insumo) return alert('Selecciona un insumo válido o créalo');
        if (!producto.insumos) producto.insumos = [];
        producto.insumos.push({ id: insumo.id, cantidad });
        window.ProductosManager.updateInsumos(producto.id, producto.insumos);
        renderizarTabInsumos(producto);
    };
    // Crear insumo rápido
    cont.querySelector('#btn-nuevo-insumo-rapido').onclick = function() {
        abrirModalNuevoInsumo(producto.id, function(nuevo) {
            if (nuevo) {
                input.value = nuevo.nombre;
            }
        });
    };
}
}

// Eliminar insumo de producto
function eliminarInsumoDeProducto(productoId, idx) {
    const producto = window.ProductosManager.getById(productoId);
    if (!producto) return;
    producto.insumos.splice(idx, 1);
    window.ProductosManager.updateInsumos(productoId, producto.insumos);
    renderizarTabInsumos(producto);
}

// Modal para agregar insumo
function abrirModalAgregarInsumo(productoId) {
    let modal = document.getElementById('modal-agregar-insumo');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-agregar-insumo';
        modal.className = 'modal-producto';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Agregar Insumo</h3>
                <div id="insumo-select-container"></div>
                <div>
                    <label>Cantidad utilizada por unidad:</label>
                    <input id="cantidad-insumo" type="text" placeholder="Ej: 150g, 1, 2g" />
                </div>
                <button id="btn-guardar-insumo">Guardar</button>
                <button onclick="document.getElementById('modal-agregar-insumo').style.display='none'">Cancelar</button>
                <button id="btn-nuevo-insumo">Crear nuevo insumo</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    // Render select de insumos existentes
    const productos = window.ProductosManager.getAll();
    let selectHtml = '<select id="select-insumo">';
    productos.forEach(p => {
        selectHtml += `<option value="${p.id}">${p.nombre}</option>`;
    });
    selectHtml += '</select>';
    modal.querySelector('#insumo-select-container').innerHTML = selectHtml;
    // Guardar insumo
    modal.querySelector('#btn-guardar-insumo').onclick = function() {
        const insumoId = parseInt(document.getElementById('select-insumo').value);
        const cantidad = document.getElementById('cantidad-insumo').value;
        if (!insumoId || !cantidad) return alert('Selecciona insumo y cantidad');
        const producto = window.ProductosManager.getById(productoId);
        if (!producto.insumos) producto.insumos = [];
        producto.insumos.push({ id: insumoId, cantidad });
        window.ProductosManager.updateInsumos(productoId, producto.insumos);
        renderizarTabInsumos(producto);
        modal.style.display = 'none';
    };
    // Crear nuevo insumo desde modal
    modal.querySelector('#btn-nuevo-insumo').onclick = function() {
        abrirModalNuevoInsumo(productoId);
    };
    modal.style.display = 'flex';
}

// Modal para crear nuevo insumo (producto simple)
function abrirModalNuevoInsumo(productoId, callback) {
    let modal = document.getElementById('modal-nuevo-insumo');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'modal-nuevo-insumo';
        modal.className = 'modal-producto';
        modal.innerHTML = `
            <div class="modal-content">
                <h3>Crear nuevo insumo</h3>
                <input id="nuevo-insumo-nombre" placeholder="Nombre del insumo" />
                <input id="nuevo-insumo-stock" type="number" placeholder="Stock inicial" />
                <input id="nuevo-insumo-unidad" placeholder="Unidad (g, ml, unidad, etc.)" />
                <button id="btn-crear-insumo">Crear</button>
                <button onclick="document.getElementById('modal-nuevo-insumo').style.display='none'">Cancelar</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.querySelector('#btn-crear-insumo').onclick = function() {
        const nombre = document.getElementById('nuevo-insumo-nombre').value;
        const stock = parseFloat(document.getElementById('nuevo-insumo-stock').value) || 0;
        const unidad = document.getElementById('nuevo-insumo-unidad').value;
        if (!nombre) return alert('Nombre requerido');
        // Crear insumo como producto simple
        const nuevo = window.ProductosManager.create({ nombre, stock, categoria: 'Insumos', precio: 0, unidad });
        if (nuevo) {
            alert('Insumo creado');
            document.getElementById('modal-nuevo-insumo').style.display = 'none';
            if (typeof callback === 'function') callback(nuevo);
        }
    };
    modal.style.display = 'flex';
}
// Editar cantidad de insumo en línea
function actualizarCantidadInsumo(productoId, idx, nuevaCantidad) {
    const producto = window.ProductosManager.getById(productoId);
    if (!producto) return;
    if (!producto.insumos[idx]) return;
    producto.insumos[idx].cantidad = nuevaCantidad;
    window.ProductosManager.updateInsumos(productoId, producto.insumos);
}

// Placeholder para eliminar producto
function eliminarProducto(id) {
    if(confirm('¿Seguro que deseas eliminar este producto?')) {
        if (typeof ProductosManager !== 'undefined' && ProductosManager.delete) {
            ProductosManager.delete(id);
            inicializarVistaProductos();
        } else {
            alert('No se pudo eliminar el producto.');
        }
    }
}
/**
 * FODEXA - Gestión de Productos
 * CRUD completo para productos y categorías
 */

// ============================
// VARIABLES GLOBALES
// ============================
// let productos = []; // Eliminado para evitar duplicidad
let categorias = [];
let productoEditando = null;
let categoriaEditando = null;

// ============================
// GESTIÓN DE PRODUCTOS
// ============================
const ProductosManager = {
    
    // Obtener todos los productos
    getAll() {
        return getStoredData('productos') || [];
    },
    
    // Obtener producto por ID
    getById(id) {
        const productos = this.getAll();
        return productos.find(p => p.id === parseInt(id));
    },
    
    // Crear nuevo producto
    create(productoData) {
        try {
            const productos = this.getAll();
            // Generar código incremental único si no se proporciona
            let codigo = productoData.codigo && productoData.codigo.trim();
            if (!codigo) {
                // Buscar el mayor número de código existente con formato PRD###
                const codigos = productos
                    .map(p => p.codigo)
                    .filter(c => /^PRD\d{3}$/.test(c));
                let maxNum = 0;
                codigos.forEach(c => {
                    const num = parseInt(c.replace('PRD', ''));
                    if (num > maxNum) maxNum = num;
                });
                codigo = `PRD${String(maxNum + 1).padStart(3, '0')}`;
            } else {
                // Validar unicidad
                if (!this.validateUniqueCode(codigo)) {
                    showNotification('El código ya existe', 'error');
                    return null;
                }
            }
            // Permitir insumos (productos compuestos)
            let insumos = Array.isArray(productoData.insumos) ? productoData.insumos : [];
            const nuevoProducto = {
                id: this.generateNewId(),
                ...productoData,
                codigo,
                insumos,
                fechaCreacion: new Date().toISOString(),
                fechaActualizacion: new Date().toISOString()
            };
            productos.push(nuevoProducto);
            setStoredData('productos', productos);
            showNotification('Producto creado exitosamente', 'success');
            return nuevoProducto;
        } catch (error) {
            console.error('Error creando producto:', error);
            showNotification('Error al crear producto', 'error');
            return null;
        }
    },
    // Actualizar insumos de un producto
    updateInsumos(id, insumos) {
        try {
            const productos = this.getAll();
            const index = productos.findIndex(p => p.id === parseInt(id));
            if (index === -1) return false;
            productos[index].insumos = insumos;
            productos[index].fechaActualizacion = new Date().toISOString();
            setStoredData('productos', productos);
            showNotification('Insumos actualizados', 'success');
            return true;
        } catch (error) {
            showNotification('Error al actualizar insumos', 'error');
            return false;
        }
    },
    
    // Actualizar producto
    update(id, productoData) {
        try {
            const productos = this.getAll();
            const index = productos.findIndex(p => p.id === parseInt(id));
            
            if (index === -1) {
                showNotification('Producto no encontrado', 'error');
                return null;
            }
            
            productos[index] = {
                ...productos[index],
                ...productoData,
                fechaActualizacion: new Date().toISOString()
            };
            
            setStoredData('productos', productos);
            showNotification('Producto actualizado exitosamente', 'success');
            return productos[index];
        } catch (error) {
            console.error('Error actualizando producto:', error);
            showNotification('Error al actualizar producto', 'error');
            return null;
        }
    },
    
    // Eliminar producto
    delete(id) {
        try {
            const productos = this.getAll();
            const index = productos.findIndex(p => p.id === parseInt(id));
            
            if (index === -1) {
                showNotification('Producto no encontrado', 'error');
                return false;
            }
            
            productos.splice(index, 1);
            setStoredData('productos', productos);
            
            showNotification('Producto eliminado exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error eliminando producto:', error);
            showNotification('Error al eliminar producto', 'error');
            return false;
        }
    },
    
    // Buscar productos
    search(termino) {
        const productos = this.getAll();
        return productos.filter(producto =>
            producto.nombre.toLowerCase().includes(termino.toLowerCase()) ||
            producto.codigo.toLowerCase().includes(termino.toLowerCase()) ||
            producto.descripcion.toLowerCase().includes(termino.toLowerCase()) ||
            producto.categoria.toLowerCase().includes(termino.toLowerCase())
        );
    },
    
    // Filtrar por categoría
    filterByCategory(categoria) {
        const productos = this.getAll();
        if (categoria === 'todas') {
            return productos;
        }
        return productos.filter(producto => producto.categoria === categoria);
    },
    
    // Filtrar por stock bajo
    getLowStock(limite = 10) {
        const productos = this.getAll();
        return productos.filter(producto => producto.stock <= limite);
    },
    
    // Filtrar por stock agotado
    getOutOfStock() {
        const productos = this.getAll();
        return productos.filter(producto => producto.stock === 0);
    },
    
    // Actualizar stock
    updateStock(id, nuevoStock) {
        try {
            const productos = this.getAll();
            const index = productos.findIndex(p => p.id === parseInt(id));
            
            if (index === -1) {
                showNotification('Producto no encontrado', 'error');
                return false;
            }
            
            productos[index].stock = parseInt(nuevoStock);
            productos[index].fechaActualizacion = new Date().toISOString();
            
            setStoredData('productos', productos);
            showNotification('Stock actualizado exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error actualizando stock:', error);
            showNotification('Error al actualizar stock', 'error');
            return false;
        }
    },
    
    // Validar código único
    validateUniqueCode(codigo, excludeId = null) {
        const productos = this.getAll();
        return !productos.some(p => 
            p.codigo.toLowerCase() === codigo.toLowerCase() && 
            p.id !== parseInt(excludeId)
        );
    },
    
    // Generar nuevo ID
    generateNewId() {
        const productos = this.getAll();
        if (productos.length === 0) return 1;
        return Math.max(...productos.map(p => p.id)) + 1;
    },
    
    // Exportar datos
    export() {
        const productos = this.getAll();
        const dataStr = JSON.stringify(productos, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `fodexa_productos_${new Date().toISOString().slice(0, 10)}.json`;
        link.click();
        
        showNotification('Productos exportados exitosamente', 'success');
    },
    
    // Importar datos
    import(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const productos = JSON.parse(e.target.result);
                    
                    if (!Array.isArray(productos)) {
                        throw new Error('El archivo debe contener un array de productos');
                    }
                    
                    // Validar estructura
                    const isValid = productos.every(p => 
                        p.hasOwnProperty('nombre') && 
                        p.hasOwnProperty('precio') && 
                        p.hasOwnProperty('categoria')
                    );
                    
                    if (!isValid) {
                        throw new Error('Estructura de datos inválida');
                    }
                    
                    // Asignar IDs si no existen
                    productos.forEach(producto => {
                        if (!producto.id) {
                            producto.id = this.generateNewId();
                        }
                    });
                    
                    setStoredData('productos', productos);
                    showNotification(`${productos.length} productos importados exitosamente`, 'success');
                    resolve(productos);
                    
                } catch (error) {
                    console.error('Error importando productos:', error);
                    showNotification('Error al importar productos: ' + error.message, 'error');
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                showNotification('Error al leer el archivo', 'error');
                reject(new Error('Error al leer el archivo'));
            };
            
            reader.readAsText(file);
        });
    }
};

// ============================
// GESTIÓN DE CATEGORÍAS
// ============================
const CategoriasManager = {
    
    // Obtener todas las categorías
    getAll() {
        return getStoredData('categorias') || [];
    },
    
    // Obtener categoría por ID
    getById(id) {
        const categorias = this.getAll();
        return categorias.find(c => c.id === parseInt(id));
    },
    
    // Crear nueva categoría
    create(categoriaData) {
        try {
            const categorias = this.getAll();
            
            // Validar nombre único
            if (categorias.some(c => c.nombre.toLowerCase() === categoriaData.nombre.toLowerCase())) {
                showNotification('Ya existe una categoría con ese nombre', 'warning');
                return null;
            }
            
            const nuevaCategoria = {
                id: this.generateNewId(),
                ...categoriaData,
                fechaCreacion: new Date().toISOString()
            };
            
            categorias.push(nuevaCategoria);
            setStoredData('categorias', categorias);
            
            showNotification('Categoría creada exitosamente', 'success');
            return nuevaCategoria;
        } catch (error) {
            console.error('Error creando categoría:', error);
            showNotification('Error al crear categoría', 'error');
            return null;
        }
    },
    
    // Actualizar categoría
    update(id, categoriaData) {
        try {
            const categorias = this.getAll();
            const index = categorias.findIndex(c => c.id === parseInt(id));
            
            if (index === -1) {
                showNotification('Categoría no encontrada', 'error');
                return null;
            }
            
            // Validar nombre único (excluyendo la actual)
            if (categorias.some(c => 
                c.nombre.toLowerCase() === categoriaData.nombre.toLowerCase() && 
                c.id !== parseInt(id)
            )) {
                showNotification('Ya existe una categoría con ese nombre', 'warning');
                return null;
            }
            
            const categoriaAnterior = categorias[index].nombre;
            categorias[index] = {
                ...categorias[index],
                ...categoriaData
            };
            
            setStoredData('categorias', categorias);
            
            // Actualizar productos que usan esta categoría
            if (categoriaAnterior !== categoriaData.nombre) {
                this.updateProductsCategory(categoriaAnterior, categoriaData.nombre);
            }
            
            showNotification('Categoría actualizada exitosamente', 'success');
            return categorias[index];
        } catch (error) {
            console.error('Error actualizando categoría:', error);
            showNotification('Error al actualizar categoría', 'error');
            return null;
        }
    },
    
    // Eliminar categoría
    delete(id) {
        try {
            const categorias = this.getAll();
            const categoria = categorias.find(c => c.id === parseInt(id));
            
            if (!categoria) {
                showNotification('Categoría no encontrada', 'error');
                return false;
            }
            
            // Verificar si hay productos usando esta categoría
            const productos = ProductosManager.getAll();
            const productosEnCategoria = productos.filter(p => p.categoria === categoria.nombre);
            
            if (productosEnCategoria.length > 0) {
                const reasignar = confirm(
                    `Hay ${productosEnCategoria.length} productos en esta categoría. ` +
                    '¿Deseas reasignarlos a "Sin categoría" antes de eliminar?'
                );
                
                if (reasignar) {
                    this.updateProductsCategory(categoria.nombre, 'Sin categoría');
                } else {
                    return false;
                }
            }
            
            const index = categorias.findIndex(c => c.id === parseInt(id));
            categorias.splice(index, 1);
            setStoredData('categorias', categorias);
            
            showNotification('Categoría eliminada exitosamente', 'success');
            return true;
        } catch (error) {
            console.error('Error eliminando categoría:', error);
            showNotification('Error al eliminar categoría', 'error');
            return false;
        }
    },
    
    // Actualizar categoría en productos
    updateProductsCategory(categoriaAnterior, categoriaNueva) {
        const productos = ProductosManager.getAll();
        const productosActualizados = productos.map(producto => {
            if (producto.categoria === categoriaAnterior) {
                return { ...producto, categoria: categoriaNueva };
            }
            return producto;
        });
        
        setStoredData('productos', productosActualizados);
    },
    
    // Generar nuevo ID
    generateNewId() {
        const categorias = this.getAll();
        if (categorias.length === 0) return 1;
        return Math.max(...categorias.map(c => c.id)) + 1;
    },
    
    // Obtener estadísticas
    getStats() {
        const categorias = this.getAll();
        const productos = ProductosManager.getAll();
        
        return categorias.map(categoria => {
            const productosEnCategoria = productos.filter(p => p.categoria === categoria.nombre);
            const stockTotal = productosEnCategoria.reduce((sum, p) => sum + p.stock, 0);
            const valorTotal = productosEnCategoria.reduce((sum, p) => sum + (p.precio * p.stock), 0);
            
            return {
                ...categoria,
                totalProductos: productosEnCategoria.length,
                stockTotal: stockTotal,
                valorTotal: valorTotal
            };
        });
    }
};

// ============================
// FUNCIONES DE FORMULARIO
// ============================
function validarFormularioProducto(datos) {
    const errores = [];
    
    if (!datos.nombre.trim()) {
        errores.push('El nombre es obligatorio');
    }
    
    if (!datos.codigo.trim()) {
        errores.push('El código es obligatorio');
    } else if (!ProductosManager.validateUniqueCode(datos.codigo, productoEditando?.id)) {
        errores.push('El código ya existe');
    }
    
    if (!datos.precio || datos.precio <= 0) {
        errores.push('El precio debe ser mayor a 0');
    }
    
    if (!datos.categoria.trim()) {
        errores.push('La categoría es obligatoria');
    }
    
    if (datos.stock < 0) {
        errores.push('El stock no puede ser negativo');
    }
    
    return errores;
}

function validarFormularioCategoria(datos) {
    const errores = [];
    
    if (!datos.nombre.trim()) {
        errores.push('El nombre es obligatorio');
    }
    
    if (!datos.color.trim()) {
        errores.push('El color es obligatorio');
    }
    
    return errores;
}

// ============================
// FUNCIONES DE CARGA MASIVA
// ============================
function procesarCargaMasiva(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lineas = csv.split('\n');
                const headers = lineas[0].split(',').map(h => h.trim());
                
                // Validar headers mínimos
                const requiredHeaders = ['nombre', 'precio', 'categoria'];
                const hasRequiredHeaders = requiredHeaders.every(h => 
                    headers.includes(h)
                );
                
                if (!hasRequiredHeaders) {
                    throw new Error('El archivo CSV debe tener las columnas: nombre, precio, categoria');
                }
                
                const productos = [];
                const errores = [];
                
                for (let i = 1; i < lineas.length; i++) {
                    const linea = lineas[i].trim();
                    if (!linea) continue;
                    
                    const valores = linea.split(',').map(v => v.trim());
                    const producto = {};
                    
                    headers.forEach((header, index) => {
                        producto[header] = valores[index] || '';
                    });
                    
                    // Validaciones básicas
                    if (!producto.nombre) {
                        errores.push(`Línea ${i + 1}: Nombre requerido`);
                        continue;
                    }
                    
                    if (!producto.precio || isNaN(parseFloat(producto.precio))) {
                        errores.push(`Línea ${i + 1}: Precio inválido`);
                        continue;
                    }
                    
                    if (!producto.categoria) {
                        errores.push(`Línea ${i + 1}: Categoría requerida`);
                        continue;
                    }
                    
                    // Formatear datos
                    producto.precio = parseFloat(producto.precio);
                    producto.stock = parseInt(producto.stock) || 0;
                    producto.codigo = producto.codigo || `PRD${Date.now()}${i}`;
                    producto.descripcion = producto.descripcion || '';
                    
                    productos.push(producto);
                }
                
                if (errores.length > 0) {
                    throw new Error('Errores en el archivo:\n' + errores.join('\n'));
                }
                
                resolve(productos);
                
            } catch (error) {
                reject(error);
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Error al leer el archivo'));
        };
        
        reader.readAsText(file);
    });
}

// ============================
// FUNCIONES DE UTILIDAD
// ============================
function getStoredData(key) {
    try {
        const data = localStorage.getItem(`fodexa_${key}`);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Error al obtener ${key}:`, error);
        return null;
    }
}

function setStoredData(key, data) {
    try {
        localStorage.setItem(`fodexa_${key}`, JSON.stringify(data));
        return true;
    } catch (error) {
        console.error(`Error al guardar ${key}:`, error);
        return false;
    }
}

function showNotification(message, type = 'info', duration = 3000) {
    if (window.FODEXA && window.FODEXA.showNotification) {
        window.FODEXA.showNotification(message, type, duration);
    } else {
        console.log(`[${type.toUpperCase()}] ${message}`);
    }
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('es-CO', {
        style: 'currency',
        currency: 'COP',
        minimumFractionDigits: 0
    }).format(amount);
}

// ============================
// EXPORTAR MÓDULOS
// ============================
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        ProductosManager,
        CategoriasManager,
        validarFormularioProducto,
        validarFormularioCategoria,
        procesarCargaMasiva
    };
} else {
    // Hacer disponible globalmente
    window.ProductosManager = ProductosManager;
    window.CategoriasManager = CategoriasManager;
    window.validarFormularioProducto = validarFormularioProducto;
    window.validarFormularioCategoria = validarFormularioCategoria;
    window.procesarCargaMasiva = procesarCargaMasiva;
    // Exportar mostrarVistaProductos globalmente
    window.mostrarVistaProductos = mostrarVistaProductos;
}
