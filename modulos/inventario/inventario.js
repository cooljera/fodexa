// Renderiza la tabla de inventario con ingredientes y stock

(function(){
  function mostrarInventario(filtro) {
    var contenedor = document.getElementById('inventario-listado');
    if (!contenedor) return;
    var ingredientes = [];
    try {
      ingredientes = JSON.parse(localStorage.getItem('ingredientesFodexa') || '[]');
    } catch(e) { ingredientes = []; }
    // Filtro por proveedor
    if (filtro && filtro !== 'todos') {
      ingredientes = ingredientes.filter(function(ing) {
        return ing.proveedorId === filtro;
      });
    }
    contenedor.innerHTML = '';
    if (!ingredientes.length) {
      contenedor.innerHTML = '<div style="color:#222;opacity:0.7;padding:18px;background:#fff;border-radius:12px;box-shadow:0 2px 8px #4b008220;">No hay ingredientes registrados.</div>';
      return;
    }
    var tabla = document.createElement('div');
    tabla.className = 'ingredientes-table';
    tabla.style.width = '100%';
    tabla.style.overflowX = 'auto';
    tabla.style.background = '#fff';
    tabla.style.borderRadius = '14px';
    tabla.style.boxShadow = '0 2px 8px #4b008220';
    tabla.style.marginBottom = '2px';
    tabla.style.fontSize = '0.98em';
    tabla.style.padding = '0';
    var header = document.createElement('div');
    header.className = 'ingredientes-table-header';
    header.style.display = 'flex';
    header.style.alignItems = 'center';
    header.style.fontWeight = '600';
    header.style.background = '#f3f4f6';
    header.style.color = '#2563eb';
    header.style.borderRadius = '14px 14px 0 0';
    header.style.padding = '12px 8px';
    header.style.gap = '10px';
    header.innerHTML = `
      <div style="flex:1;min-width:140px;">Nombre del producto</div>
      <div style="flex:1;min-width:120px;">Proveedor</div>
      <div style="flex:0.8;min-width:110px;">Stock actual</div>
      <div style="flex:0.8;min-width:110px;">Stock mínimo</div>
    `;
    tabla.appendChild(header);
    // Obtener proveedores para mostrar el nombre
    var proveedores = [];
    try {
      proveedores = JSON.parse(localStorage.getItem('fodexa_proveedores') || '[]');
    } catch(e) { proveedores = []; }
    function obtenerProveedorNombre(id) {
      var proveedor = proveedores.find(function(p) { return p.id === id; });
      return proveedor ? proveedor.nombre : 'Sin proveedor';
    }
    // Obtener stock de inventario y stock mínimo
    var stockMap = {};
    var stockMinMap = {};
    try {
      stockMap = JSON.parse(localStorage.getItem('stockInventarioFodexa') || '{}');
    } catch(e) { stockMap = {}; }
    try {
      stockMinMap = JSON.parse(localStorage.getItem('stockMinimoInventarioFodexa') || '{}');
    } catch(e) { stockMinMap = {}; }
    ingredientes.forEach(function(ing) {
      var proveedor = obtenerProveedorNombre(ing.proveedorId);
      var stock = (typeof ing.stock !== 'undefined') ? ing.stock : (stockMap[ing.nombre] || 0);
      var stockMin = (typeof ing.stockMin !== 'undefined') ? ing.stockMin : (stockMinMap[ing.nombre] || 0);
      var fila = document.createElement('div');
      fila.className = 'ingredientes-table-row';
      fila.style.display = 'flex';
      fila.style.alignItems = 'center';
      fila.style.borderBottom = '1px solid #e5e7eb';
      fila.style.padding = '10px 8px';
      fila.style.gap = '10px';
      fila.style.color = '#222';
      fila.innerHTML = `
        <div style="flex:1;min-width:140px;font-weight:500;"><i class="fas fa-leaf"></i> ${ing.nombre}</div>
        <div style="flex:1;min-width:120px;"><i class="fas fa-truck"></i> ${proveedor}</div>
        <div style="flex:0.8;min-width:110px;">
          <input type="number" min="0" value="${stock}" data-nombre="${ing.nombre}" class="input-stock-actual" style="width:80px;padding:4px 6px;border-radius:6px;border:1px solid #d1d5db;">
        </div>
        <div style="flex:0.8;min-width:110px;">
          <input type="number" min="0" value="${stockMin}" data-nombre="${ing.nombre}" class="input-stock-minimo" style="width:80px;padding:4px 6px;border-radius:6px;border:1px solid #d1d5db;">
        </div>
      `;
      tabla.appendChild(fila);
    });
    contenedor.appendChild(tabla);
    // Eventos para inputs de stock actual y mínimo
    var stockInputs = tabla.querySelectorAll('.input-stock-actual');
    stockInputs.forEach(function(input) {
      input.addEventListener('change', function() {
        var nombre = input.getAttribute('data-nombre');
        var val = parseFloat(input.value) || 0;
        stockMap[nombre] = val;
        localStorage.setItem('stockInventarioFodexa', JSON.stringify(stockMap));
      });
    });
    var stockMinInputs = tabla.querySelectorAll('.input-stock-minimo');
    stockMinInputs.forEach(function(input) {
      input.addEventListener('change', function() {
        var nombre = input.getAttribute('data-nombre');
        var val = parseFloat(input.value) || 0;
        stockMinMap[nombre] = val;
        localStorage.setItem('stockMinimoInventarioFodexa', JSON.stringify(stockMinMap));
      });
    });
  }
  window.mostrarInventario = mostrarInventario;
  // Filtro en input
  document.addEventListener('DOMContentLoaded', function() {
    var select = document.getElementById('busqueda-inventario');
    function cargarProveedoresEnSelect() {
      if (!select) return;
      select.innerHTML = '';
      var optTodos = document.createElement('option');
      optTodos.value = 'todos';
      optTodos.textContent = 'Todos los proveedores';
      select.appendChild(optTodos);
      // Obtener ingredientes y proveedores asociados a esos ingredientes
      var ingredientes = [];
      try {
        ingredientes = JSON.parse(localStorage.getItem('ingredientesFodexa') || '[]');
      } catch(e) { ingredientes = []; }
      var proveedores = [];
      try {
        proveedores = JSON.parse(localStorage.getItem('fodexa_proveedores') || '[]');
      } catch(e) { proveedores = []; }
      // Solo los proveedores que están asociados a algún ingrediente
      var usados = {};
      ingredientes.forEach(function(ing) {
        if (ing.proveedorId) usados[ing.proveedorId] = true;
      });
      var visibles = [];
      proveedores.forEach(function(p) {
        if (usados[p.id]) {
          visibles.push(p);
        }
      });
      if (visibles.length > 0) {
        // Separador visual
        var optSep = document.createElement('option');
        optSep.disabled = true;
        optSep.textContent = '────────────';
        select.appendChild(optSep);
        // Opciones de proveedores
        visibles.forEach(function(p) {
          var opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.nombre;
          select.appendChild(opt);
        });
      } else {
        var optNone = document.createElement('option');
        optNone.disabled = true;
        optNone.textContent = 'No hay proveedores en inventario';
        select.appendChild(optNone);
      }
    }
    cargarProveedoresEnSelect();
    // Refrescar select cada vez que se muestra la sección inventario
    const menuBtns = document.querySelectorAll('.menu-btn');
    menuBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        const destino = btn.getAttribute('data-section');
        if (destino === 'inventario') {
          cargarProveedoresEnSelect();
        }
      });
    });
    select.addEventListener('change', function() {
      window.mostrarInventario(select.value);
    });
    window.mostrarInventario('todos');
    window._recargarSelectProveedoresInventario = cargarProveedoresEnSelect;
    // Escuchar evento global para refrescar el select si se agregan proveedores desde otra sección
    window.addEventListener('proveedoresActualizados', function() {
      cargarProveedoresEnSelect();
    });
  });
})();
// --- AJUSTES FODEXA: Stock Faltante en tiempo real y Pedido agrupado ---
document.addEventListener('DOMContentLoaded', function() {
  // 1. Cálculo automático de stock faltante en tiempo real
  function recalcularStockFaltante() {
    const filas = document.querySelectorAll('.ingredientes-table-row');
    filas.forEach(function(fila) {
      const inputStock = fila.querySelector('.input-stock-actual');
      const inputMin = fila.querySelector('.input-stock-minimo');
      const colFaltante = fila.querySelector('.col-stock-faltante');
      if (inputStock && inputMin && colFaltante) {
        const stockActual = parseFloat(inputStock.value) || 0;
        const stockMin = parseFloat(inputMin.value) || 0;
        const faltante = Math.max(stockMin - stockActual, 0);
        colFaltante.textContent = faltante > 0 ? faltante : '';
        colFaltante.style.color = faltante > 0 ? '#ef4444' : '#222';
      }
    });
  }

  // Delegar eventos input a los campos de stock actual y mínimo
  function delegarEventosStock() {
    const contenedor = document.getElementById('inventario-listado');
    if (!contenedor) return;
    contenedor.addEventListener('input', function(e) {
      if (e.target.classList.contains('input-stock-actual') || e.target.classList.contains('input-stock-minimo')) {
        recalcularStockFaltante();
      }
    });
  }

  // 2. Botón fijo para generar pedido y resumen agrupado
  function crearBotonYResumenPedido() {
    // Elimina el botón grande si existe
    let btnPedido = document.getElementById('btn-generar-pedido-fijo');
    if (btnPedido && btnPedido.parentNode) {
      btnPedido.parentNode.removeChild(btnPedido);
    }
    // Elimina el resumen si existe
    let resumen = document.getElementById('resumen-pedido-fijo');
    if (resumen && resumen.parentNode) {
      resumen.parentNode.removeChild(resumen);
    }
    // Elimina el botón WhatsApp si existe
    let btnWA = document.getElementById('btn-whatsapp-pedido');
    if (btnWA && btnWA.parentNode) {
      btnWA.parentNode.removeChild(btnWA);
    }
    // El botón pequeño debe estar ya en la interfaz alineado a un lado (no se crea aquí)
  }

  // 3. Generar pedido agrupado por proveedor, solo ingredientes visibles y con stock faltante
  function generarResumenPedido() {
    // Obtener solo los ingredientes actualmente visibles en la tabla
    const filas = document.querySelectorAll('.ingredientes-table-row');
    if (!filas.length) return {texto: 'No hay productos con stock faltante.', waLinks: []};
    let proveedores = [];
    try { proveedores = JSON.parse(localStorage.getItem('fodexa_proveedores') || '[]'); } catch(e) { proveedores = []; }
    const provMap = {};
    proveedores.forEach(p => { provMap[p.id] = p; });
    // Buscar el ingrediente visible por nombre en ambas fuentes
    let ingredientesFodexa = [];
    let ingredientesData = [];
    try { ingredientesFodexa = JSON.parse(localStorage.getItem('ingredientesFodexa') || '[]'); } catch(e) { ingredientesFodexa = []; }
    try { ingredientesData = JSON.parse(localStorage.getItem('ingredientesData') || '[]'); } catch(e) { ingredientesData = []; }
    const faltantesPorProveedor = {};
    filas.forEach(fila => {
      const inputStock = fila.querySelector('.input-stock-actual');
      const inputMin = fila.querySelector('.input-stock-minimo');
      if (!inputStock || !inputMin) return;
      const nombre = inputStock.getAttribute('data-nombre');
      if (!nombre) return;
      // Buscar el ingrediente por nombre en ambas fuentes
      let ing = ingredientesFodexa.find(i => i.nombre === nombre);
      if (!ing) ing = ingredientesData.find(i => i.nombre === nombre);
      if (ing) {
        // Usar los valores actuales de los inputs visibles
        const actual = parseFloat(inputStock.value) || 0;
        const minimo = parseFloat(inputMin.value) || 0;
        const faltante = Math.max(minimo - actual, 0);
        if (faltante > 0) {
          const provId = ing.proveedorId || 'sin_proveedor';
          if (!faltantesPorProveedor[provId]) faltantesPorProveedor[provId] = { proveedor: provMap[provId] || null, productos: [] };
          if (!faltantesPorProveedor[provId].productos.some(p => p.nombre === ing.nombre)) {
            faltantesPorProveedor[provId].productos.push({ nombre: ing.nombre, cantidad: faltante });
          }
        }
      }
    });
    // Construir texto y links agrupados por proveedor
    let texto = '';
    let waLinks = [];
    Object.keys(faltantesPorProveedor).forEach(provId => {
      const grupo = faltantesPorProveedor[provId];
      const proveedor = grupo.proveedor;
      if (grupo.productos.length) {
        texto += `Pedido automático - Proveedor: ${proveedor ? proveedor.nombre : 'Sin proveedor'}\n\n`;
        grupo.productos.forEach(prod => {
          texto += `- ${prod.nombre} (falta ${prod.cantidad})\n`;
        });
        texto += `\nEntregar a: Roal Burger\nDirección: Avenida Las Américas, calle 22 #29-59\nDespués de: [hora]\n\n`;
        // WhatsApp link
        if (proveedor && proveedor.whatsappProveedor) {
          let tel = String(proveedor.whatsappProveedor).replace(/[^\d]/g, '');
          if (tel.length >= 8) {
            let msg = encodeURIComponent(texto.trim());
            let url = `https://wa.me/57${tel}?text=${msg}`;
            waLinks.push(url);
          }
        }
      }
    });
    if (!texto) texto = 'No hay productos con stock faltante.';
    return {texto, waLinks};
  }

  // Inicialización
  setTimeout(function() {
    recalcularStockFaltante();
    delegarEventosStock();
    crearBotonYResumenPedido();
  }, 300);
});
// ...existing code...
/**
 * inventario.js - Lógica principal para el módulo de inventario FODEXA
 * Gestiona proveedores, ingredientes, lista de compras y edición.
 * Todo el almacenamiento es en localStorage (adaptable a Supabase).
 * No modifica el DOM fuera de inventario.html/.css.
 */

// --- CONSTANTES Y SELECTORES ---
// const LS_PROVEEDORES_KEY = 'fodexa_proveedores'; // Eliminar duplicado si ya existe en otro script
const LS_INGREDIENTES_KEY = 'fodexa_ingredientes';

// Selectores principales (ajusta los IDs/clases según inventario.html)
const proveedorForm = document.getElementById('proveedor-form');
const proveedoresContainer = document.getElementById('proveedores-container');
const ingredienteModal = document.getElementById('ingrediente-modal');
const ingredienteForm = document.getElementById('ingrediente-form');
const listaComprasModal = document.getElementById('lista-compras-modal');
const listaComprasBtn = document.getElementById('btn-lista-compras');
const busquedaInput = document.getElementById('busqueda-input');

// --- UTILIDADES DE LOCALSTORAGE ---
function guardarProveedores(proveedores) {
    localStorage.setItem(LS_PROVEEDORES_KEY, JSON.stringify(proveedores));
}
function cargarProveedores() {
    return JSON.parse(localStorage.getItem(LS_PROVEEDORES_KEY) || '[]');
}
function guardarIngredientes(ingredientes) {
    localStorage.setItem(LS_INGREDIENTES_KEY, JSON.stringify(ingredientes));
}
function cargarIngredientes() {
    return JSON.parse(localStorage.getItem(LS_INGREDIENTES_KEY) || '[]');
}

// --- ESTADO TRANSITORIO ---
let proveedores = cargarProveedores();
let ingredientes = cargarIngredientes();
let proveedorSeleccionado = null; // Para agregar ingrediente
let ingredienteEditando = null;   // Para edición

// --- RENDERIZADO DE PROVEEDORES ---
function renderizarProveedores(filtro = '') {
    proveedoresContainer.innerHTML = '';
    const lista = filtro
        ? proveedores.filter(p => p.nombre.toLowerCase().includes(filtro.toLowerCase()))
        : proveedores;
    lista.forEach(proveedor => {
        const card = document.createElement('div');
        card.className = 'proveedor-card';
        card.innerHTML = `
            <div class="proveedor-nombre"><i class="fas fa-truck"></i> ${proveedor.nombre}</div>
            <div class="proveedor-info"><i class="fas fa-user"></i> ${proveedor.contacto}</div>
            <div class="proveedor-info"><i class="fas fa-phone"></i> ${proveedor.telefono}</div>
            <div class="proveedor-info"><i class="fas fa-envelope"></i> ${proveedor.email}</div>
            <div class="proveedor-info"><i class="fas fa-city"></i> ${proveedor.ciudad}</div>
            <div class="proveedor-actions">
                <button class="btn-edit" onclick="editarProveedor('${proveedor.id}')"><i class="fas fa-edit"></i> Editar</button>
                <button class="btn-ingrediente" onclick="abrirModalIngrediente('${proveedor.id}')" title="Agregar ingrediente"><i class="fas fa-plus"></i></button>
            </div>
            <div class="ingredientes-container" id="ingredientes-${proveedor.id}"></div>
        `;
        proveedoresContainer.appendChild(card);
        renderizarIngredientesProveedor(proveedor.id);
    });
}

// --- REGISTRO DE PROVEEDOR ---
if (proveedorForm) {
    proveedorForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const editandoId = proveedorForm.getAttribute('data-editando');
        const nuevoProveedor = {
            id: editandoId ? editandoId : 'prov_' + Date.now(),
            nombre: proveedorForm.nombreProveedor.value.trim(),
            contacto: proveedorForm.nombreContacto.value.trim(),
            telefono: proveedorForm.telefonoProveedor.value.trim(),
            email: proveedorForm.emailProveedor.value.trim(),
            ciudad: proveedorForm.ciudadProveedor.value.trim()
        };
        if (editandoId) {
            proveedores = proveedores.map(p => p.id === editandoId ? nuevoProveedor : p);
            proveedorForm.removeAttribute('data-editando');
        } else {
            proveedores.push(nuevoProveedor);
        }
        guardarProveedores(proveedores);
        renderizarProveedores();
        proveedorForm.reset();
    });
}

// --- RENDERIZADO DE INGREDIENTES POR PROVEEDOR ---
function renderizarIngredientesProveedor(proveedorId, filtro = '') {
    const contenedor = document.getElementById(`ingredientes-${proveedorId}`);
    if (!contenedor) return;
    const lista = ingredientes.filter(ing =>
        ing.proveedorId === proveedorId &&
        (filtro ? ing.nombre.toLowerCase().includes(filtro.toLowerCase()) : true)
    );
    if (lista.length === 0) {
        contenedor.innerHTML = '<div class="sin-ingredientes">Sin ingredientes registrados.</div>';
        return;
    }
    const tabla = document.createElement('table');
    tabla.className = 'tabla-ingredientes';
    tabla.innerHTML = `
        <thead>
            <tr>
                <th>Nombre</th>
                <th>Unidad</th>
                <th>Stock</th>
                <th>Stock Mín.</th>
                <th>Costo</th>
                <th>Última compra</th>
                <th>Acciones</th>
            </tr>
        </thead>
        <tbody>
            ${lista.map(ing => `
                <tr class="${ing.stockActual < ing.stockMinimo ? 'alerta-stock' : ''}">
                    <td>${ing.nombre}</td>
                    <td>${ing.unidad}</td>
                    <td>${ing.stockActual}</td>
                    <td>${ing.stockMinimo}</td>
                    <td>$${ing.costoUnidad}</td>
                    <td>${ing.fechaUltimaCompra}</td>
                    <td>
                        <button class="btn-editar-ingrediente" title="Editar" onclick="editarIngrediente('${ing.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    contenedor.innerHTML = '';
    contenedor.appendChild(tabla);
}

// --- REGISTRO DE INGREDIENTE ---
function abrirModalIngrediente(proveedorId) {
    proveedorSeleccionado = proveedorId;
    ingredienteEditando = null;
    if (ingredienteModal) {
        ingredienteModal.classList.add('activo');
        ingredienteForm.reset();
        ingredienteForm.querySelector('.modal-titulo').textContent = 'Agregar ingrediente';
    }
}
window.abrirModalIngrediente = abrirModalIngrediente;

// Guardar ingrediente (nuevo o edición)
if (ingredienteForm) {
    ingredienteForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const datos = {
            id: ingredienteEditando ? ingredienteEditando.id : 'ing_' + Date.now(),
            proveedorId: proveedorSeleccionado,
            nombre: ingredienteForm.nombre.value.trim(),
            unidad: ingredienteForm.unidad.value,
            stockActual: parseFloat(ingredienteForm.stockActual.value),
            stockMinimo: parseFloat(ingredienteForm.stockMinimo.value),
            costoUnidad: parseFloat(ingredienteForm.costoUnidad.value),
            fechaUltimaCompra: ingredienteForm.fechaUltimaCompra.value
        };
        if (ingredienteEditando) {
            // Editar existente
            ingredientes = ingredientes.map(ing => ing.id === datos.id ? datos : ing);
        } else {
            ingredientes.push(datos);
        }
        guardarIngredientes(ingredientes);
        renderizarIngredientesProveedor(proveedorSeleccionado);
        actualizarListaCompras();
        cerrarModalIngrediente();
    });
}

// --- EDICIÓN DE PROVEEDOR ---
function editarProveedor(proveedorId) {
    const proveedor = proveedores.find(p => p.id === proveedorId);
    const modalProveedor = document.getElementById('modal-proveedor');
    if (!proveedor || !proveedorForm || !modalProveedor) return;
    proveedorForm.nombreProveedor.value = proveedor.nombre;
    proveedorForm.nombreContacto.value = proveedor.contacto;
    proveedorForm.telefonoProveedor.value = proveedor.telefono;
    proveedorForm.emailProveedor.value = proveedor.email;
    proveedorForm.ciudadProveedor.value = proveedor.ciudad;
    proveedorForm.setAttribute('data-editando', proveedorId);
    modalProveedor.style.display = 'flex';
    const titulo = modalProveedor.querySelector('h3');
    if (titulo) titulo.innerHTML = '<i class="fas fa-edit"></i> Editar proveedor';
}
window.editarProveedor = editarProveedor;

// Guardar cambios proveedor
if (proveedorForm) {
    const btnEditar = proveedorForm.querySelector('.btn-editar');
    if (btnEditar) {
        btnEditar.addEventListener('click', function(e) {
            e.preventDefault();
            const proveedorId = proveedorForm.getAttribute('data-editando');
            if (!proveedorId) return;
            proveedores = proveedores.map(p =>
                p.id === proveedorId
                    ? {
                        ...p,
                        nombre: proveedorForm.nombre.value.trim(),
                        contacto: proveedorForm.contacto.value.trim(),
                        telefono: proveedorForm.telefono.value.trim(),
                        email: proveedorForm.email.value.trim(),
                        ciudad: proveedorForm.ciudad.value.trim()
                    }
                    : p
            );
            guardarProveedores(proveedores);
            renderizarProveedores();
            proveedorForm.reset();
            proveedorForm.removeAttribute('data-editando');
            proveedorForm.querySelector('.btn-guardar').style.display = 'inline-block';
            btnEditar.style.display = 'none';
        });
    }
}

// --- EDICIÓN DE INGREDIENTE ---
function editarIngrediente(ingredienteId) {
    const ing = ingredientes.find(i => i.id === ingredienteId);
    if (!ing || !ingredienteForm) return;
    proveedorSeleccionado = ing.proveedorId;
    ingredienteEditando = ing;
    abrirModalIngrediente(ing.proveedorId);
    ingredienteForm.nombre.value = ing.nombre;
    ingredienteForm.unidad.value = ing.unidad;
    ingredienteForm.stockActual.value = ing.stockActual;
    ingredienteForm.stockMinimo.value = ing.stockMinimo;
    ingredienteForm.costoUnidad.value = ing.costoUnidad;
    ingredienteForm.fechaUltimaCompra.value = ing.fechaUltimaCompra;
    ingredienteForm.querySelector('.modal-titulo').textContent = 'Editar ingrediente';
}
window.editarIngrediente = editarIngrediente;

// --- MODAL CONTROL ---
function cerrarModalIngrediente() {
    if (ingredienteModal) {
        ingredienteModal.classList.remove('activo');
    }
    ingredienteEditando = null;
    proveedorSeleccionado = null;
}
window.cerrarModalIngrediente = cerrarModalIngredente;

// --- LISTA DE COMPRAS (STOCK BAJO) ---
function obtenerListaCompras() {

    const contenedor = document.getElementById('inventario-container');
    if (!contenedor) return;

    let ingredientes = [];
    try {
        ingredientes = JSON.parse(localStorage.getItem('fodexa_ingredientes') || '[]');
    } catch (e) { ingredientes = []; }

    contenedor.innerHTML = '';

    if (!ingredientes.length) {
        contenedor.innerHTML = '<div style="color:#222;opacity:0.7;padding:24px;background:#fff;border-radius:16px;box-shadow:0 2px 8px #4b008220;font-size:1.1em;text-align:center;">No hay ingredientes cargados.</div>';
        return;
    }

    ingredientes.forEach((ing, idx) => {
        // Modern card FODEXA
        const card = document.createElement('div');
        card.className = 'inventario-card';
        card.style.background = '#fff';
        card.style.borderRadius = '18px';
        card.style.boxShadow = '0 4px 18px 0 #4b0082a0';
        card.style.padding = '22px 32px';
        card.style.marginBottom = '22px';
        card.style.display = 'flex';
        card.style.flexDirection = 'row';
        card.style.alignItems = 'center';
        card.style.gap = '32px';
        card.style.border = '1.5px solid #e5e7eb';
        card.style.transition = 'box-shadow 0.22s, background 0.22s';

        // Icono y nombre
        const nombreDiv = document.createElement('div');
        nombreDiv.style.flex = '2';
        nombreDiv.style.display = 'flex';
        nombreDiv.style.alignItems = 'center';
        nombreDiv.style.gap = '12px';
        nombreDiv.style.fontWeight = '600';
        nombreDiv.style.fontSize = '1.18em';
        nombreDiv.style.color = '#2563eb';
        nombreDiv.innerHTML = `<i class="fas fa-leaf"></i> ${ing.nombre || ''}`;

        // Unidad
        const unidadDiv = document.createElement('div');
        unidadDiv.style.flex = '1';
        unidadDiv.style.color = '#444';
        unidadDiv.style.fontWeight = '500';
        unidadDiv.innerHTML = `<i class="fas fa-balance-scale"></i> ${ing.tipoMedida || ing.unidad || ''}`;

        // Stock actual
        const stockDiv = document.createElement('div');
        stockDiv.style.flex = '1';
        stockDiv.style.color = '#222';
        stockDiv.style.fontWeight = '500';
        stockDiv.innerHTML = `<span style="background:#f3f4f6;padding:6px 16px;border-radius:8px;font-size:1.08em;">Stock actual: <b>${ing.stockActual || 0}</b></span>`;

        // Stock mínimo
        const minimoDiv = document.createElement('div');
        minimoDiv.style.flex = '1';
        minimoDiv.style.color = '#222';
        minimoDiv.style.fontWeight = '500';
        minimoDiv.innerHTML = `<span style="background:#f3f4f6;padding:6px 16px;border-radius:8px;font-size:1.08em;">Stock mínimo: <b>${ing.stockMinimo || 0}</b></span>`;

        // Botón actualizar
        const btn = document.createElement('button');
        btn.className = 'btn btn-primary btn-actualizar-stock';
        btn.style.padding = '10px 22px';
        btn.style.borderRadius = '10px';
        btn.style.fontSize = '1em';
        btn.style.boxShadow = '0 2px 8px 0 #2563eb22';
        btn.style.marginLeft = 'auto';
        btn.setAttribute('data-idx', idx);
        btn.innerHTML = '<i class="fas fa-sync"></i> Actualizar stock';

        // Alerta visual si stockActual < stockMinimo
        if (Number(ing.stockActual) < Number(ing.stockMinimo)) {
            card.style.background = '#ffeded';
            card.style.borderColor = '#ef4444';
        }

        card.appendChild(nombreDiv);
        card.appendChild(unidadDiv);
        card.appendChild(stockDiv);
        card.appendChild(minimoDiv);
        card.appendChild(btn);
        contenedor.appendChild(card);
    });

    // Evento para actualizar stock (opcional)
    const btnsActualizar = contenedor.querySelectorAll('.btn-actualizar-stock');
    btnsActualizar.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const idx = parseInt(btn.getAttribute('data-idx'));
            actualizarStockIngrediente(idx);
        });
    });
    if (listaComprasModal && listaComprasModal.classList.contains('activo')) {
        renderizarListaCompras();
    }
}

// --- EXPORTAR LISTA DE COMPRAS (PLACEHOLDER) ---
function exportarListaComprasExcel() {
    alert('Funcionalidad de exportar a Excel próximamente.');
}
window.exportarListaComprasExcel = exportarListaComprasExcel;
function exportarListaComprasPDF() {
    alert('Funcionalidad de exportar a PDF próximamente.');
}
window.exportarListaComprasPDF = exportarListaComprasPDF;

// --- BÚSQUEDA ---
if (busquedaInput) {
    busquedaInput.addEventListener('input', function() {
        const valor = busquedaInput.value.trim();
        renderizarProveedores(valor);
        // Opcional: búsqueda por ingrediente
        proveedores.forEach(p => renderizarIngredientesProveedor(p.id, valor));
    });
}

// --- ANIMACIONES SUAVES (ejemplo para modales) ---
document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('transitionend', function() {
        if (!modal.classList.contains('activo')) {
            modal.style.display = 'none';
        } else {
            modal.style.display = 'block';
        }
    });
});

// --- INICIALIZACIÓN ---
function inicializarInventario() {
    renderizarProveedores();
    // Modal proveedor
    const btnAbrirModal = document.getElementById('btn-abrir-modal-proveedor');
    const modalProveedor = document.getElementById('modal-proveedor');
    const btnCerrarModal = document.getElementById('btn-cerrar-modal-proveedor');
    const proveedorForm = document.getElementById('proveedor-form');
    if (btnAbrirModal && modalProveedor) {
        btnAbrirModal.addEventListener('click', function() {
            modalProveedor.style.display = 'flex';
            modalProveedor.classList.add('activo');
            proveedorForm.reset();
        });
    }
    if (btnCerrarModal && modalProveedor) {
        btnCerrarModal.addEventListener('click', function() {
            modalProveedor.style.display = 'none';
            modalProveedor.classList.remove('activo');
            proveedorForm.reset();
        });
    }
    if (proveedorForm) {
        proveedorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const nuevoProveedor = {
                id: 'prov_' + Date.now(),
                nombre: proveedorForm.nombreProveedor.value.trim(),
                contacto: proveedorForm.nombreContacto.value.trim(),
                telefono: proveedorForm.telefonoProveedor.value.trim(),
                email: proveedorForm.emailProveedor.value.trim(),
                ciudad: proveedorForm.ciudadProveedor.value.trim()
            };
            proveedores.push(nuevoProveedor);
            guardarProveedores(proveedores);
            renderizarProveedores();
            proveedorForm.reset();
            modalProveedor.style.display = 'none';
            modalProveedor.classList.remove('activo');
        });
    }
    // Filtro en tiempo real
    const busquedaInput = document.getElementById('busqueda-input');
    if (busquedaInput) {
        busquedaInput.addEventListener('input', function() {
            renderizarProveedores(busquedaInput.value.trim());
        });
    }
}
document.addEventListener('DOMContentLoaded', inicializarInventario);

// --- GESTOR DE INVENTARIO ---
/**
 * Muestra el listado de ingredientes en el inventario con campos editables y botón guardar.
 */
function mostrarInventario() {
  const contenedor = document.getElementById('inventario-listado');
  if (!contenedor) return;
  let ingredientes = [];
  try {
    ingredientes = JSON.parse(localStorage.getItem('ingredientesData') || '[]');
  } catch(e) { ingredientes = []; }
  contenedor.innerHTML = '';
  if (!ingredientes.length) {
    contenedor.innerHTML = '<div style="color:#222;opacity:0.7;padding:24px;background:rgba(255,255,255,0.18);border-radius:16px;box-shadow:0 2px 8px #4b008220;font-family:Inter,sans-serif;backdrop-filter:blur(4px);">No hay ingredientes registrados aún.</div>';
    return;
  }
  ingredientes.forEach(function(ing, idx) {
    const card = document.createElement('div');
    card.className = 'inventario-card';
    card.style.background = 'rgba(255,255,255,0.18)';
    card.style.borderRadius = '16px';
    card.style.boxShadow = '0 2px 8px #4b008220';
    card.style.padding = '18px 22px';
    card.style.marginBottom = '18px';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '18px';
    card.style.fontFamily = 'Inter, sans-serif';
    card.style.flexWrap = 'wrap';
    card.style.backdropFilter = 'blur(4px)';

    // Nombre
    const nombreDiv = document.createElement('div');
    nombreDiv.style.flex = '1 1 180px';
    nombreDiv.style.fontWeight = '600';
    nombreDiv.style.fontSize = '1.08em';
    nombreDiv.style.color = '#222';
    nombreDiv.innerHTML = `<i class='fas fa-leaf'></i> ${ing.nombre}`;
    card.appendChild(nombreDiv);

    // Medida
    const medidaDiv = document.createElement('div');
    medidaDiv.style.flex = '0.7 1 90px';
    medidaDiv.style.color = '#2563eb';
    medidaDiv.style.fontWeight = '500';
    medidaDiv.innerText = ing.tipoMedida || '';
    card.appendChild(medidaDiv);

    // Input Stock Actual
    const inputStockActual = document.createElement('input');
    inputStockActual.type = 'number';
    inputStockActual.min = '0';
    inputStockActual.step = 'any';
    inputStockActual.value = ing.stockActual !== undefined ? ing.stockActual : '';
    inputStockActual.placeholder = 'Stock actual';
    inputStockActual.style = 'width:90px;padding:8px 10px;border-radius:8px;border:1.5px solid #d1d5db;background:#fff;color:#222;font-size:1em;';
    inputStockActual.id = `stockActual_${idx}`;
    card.appendChild(inputStockActual);

    // Input Stock Mínimo
    const inputStockMinimo = document.createElement('input');
    inputStockMinimo.type = 'number';
    inputStockMinimo.min = '0';
    inputStockMinimo.step = 'any';
    inputStockMinimo.value = ing.stockMinimo !== undefined ? ing.stockMinimo : '';
    inputStockMinimo.placeholder = 'Stock mínimo';
    inputStockMinimo.style = 'width:90px;padding:8px 10px;border-radius:8px;border:1.5px solid #d1d5db;background:#fff;color:#222;font-size:1em;';
    inputStockMinimo.id = `stockMinimo_${idx}`;
    card.appendChild(inputStockMinimo);

    // Botón Guardar
    const btnGuardar = document.createElement('button');
    btnGuardar.className = 'btn btn-primary';
    btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
    btnGuardar.style = 'background:#2563eb;color:#fff;border:none;border-radius:10px;padding:10px 22px;box-shadow:0 2px 8px #2563eb22;font-size:1em;cursor:pointer;';
    btnGuardar.onclick = function() { guardarStock(idx); };
    card.appendChild(btnGuardar);

    contenedor.appendChild(card);
  });
}

/**
 * Guarda el stock actual y mínimo de un ingrediente por índice.
 */
function guardarStock(index) {
  let ingredientes = [];
  try {
    ingredientes = JSON.parse(localStorage.getItem('ingredientesData') || '[]');
  } catch(e) { ingredientes = []; }
  if (!ingredientes[index]) return;
  const inputStockActual = document.getElementById(`stockActual_${index}`);
  const inputStockMinimo = document.getElementById(`stockMinimo_${index}`);
  if (!inputStockActual || !inputStockMinimo) return;
  ingredientes[index].stockActual = inputStockActual.value !== '' ? Number(inputStockActual.value) : undefined;
  ingredientes[index].stockMinimo = inputStockMinimo.value !== '' ? Number(inputStockMinimo.value) : undefined;
  localStorage.setItem('ingredientesData', JSON.stringify(ingredientes));
  // Feedback visual
  inputStockActual.style.borderColor = '#22c55e';
  inputStockMinimo.style.borderColor = '#22c55e';
  setTimeout(() => {
    inputStockActual.style.borderColor = '#d1d5db';
    inputStockMinimo.style.borderColor = '#d1d5db';
  }, 900);
}

/**
 * Carga el inventario desde los ingredientes guardados en localStorage y renderiza las tarjetas.
 */
function cargarInventarioDesdeIngredientes() {
  const contenedor = document.getElementById('inventario-listado');
  if (!contenedor) return;
  let ingredientes = [];
  try {
    ingredientes = JSON.parse(localStorage.getItem('ingredientesData') || '[]');
  } catch(e) { ingredientes = []; }
  contenedor.innerHTML = '';
  if (!ingredientes.length) {
    contenedor.innerHTML = '<div style="color:#fff;opacity:0.7;padding:24px;background:rgba(255,255,255,0.08);border-radius:16px;box-shadow:0 2px 8px #4b008220;font-family:Inter,sans-serif;backdrop-filter:blur(6px);">No hay ingredientes registrados aún.</div>';
    return;
  }
  ingredientes.forEach(function(ing, idx) {
    const card = document.createElement('div');
    card.className = 'card-inventario';
    // Nombre
    const nombre = document.createElement('h3');
    nombre.textContent = ing.nombre || '';
    card.appendChild(nombre);
    // Medida
    const medida = document.createElement('div');
    medida.textContent = 'Medida: ' + (ing.tipoMedida || '');
    card.appendChild(medida);
    // Input Stock Actual
    const labelStockActual = document.createElement('label');
    labelStockActual.textContent = 'Stock actual';
    const inputStockActual = document.createElement('input');
    inputStockActual.type = 'number';
    inputStockActual.min = '0';
    inputStockActual.value = ing.stockActual !== undefined ? ing.stockActual : '';
    inputStockActual.placeholder = 'Ingrese stock actual';
    inputStockActual.id = `stockActual_${idx}`;
    labelStockActual.appendChild(inputStockActual);
    card.appendChild(labelStockActual);
    // Input Stock Mínimo
    const labelStockMinimo = document.createElement('label');
    labelStockMinimo.textContent = 'Stock mínimo';
    const inputStockMinimo = document.createElement('input');
    inputStockMinimo.type = 'number';
    inputStockMinimo.min = '0';
    inputStockMinimo.value = ing.stockMinimo !== undefined ? ing.stockMinimo : '';
    inputStockMinimo.placeholder = 'Ingrese stock mínimo';
    inputStockMinimo.id = `stockMinimo_${idx}`;
    labelStockMinimo.appendChild(inputStockMinimo);
    card.appendChild(labelStockMinimo);
    // Botón Guardar
    const btnGuardar = document.createElement('button');
    btnGuardar.className = 'btn btn-primary';
    btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
    btnGuardar.onclick = function() { guardarStock(idx); };
    card.appendChild(btnGuardar);
    contenedor.appendChild(card);
  });
}

// Ejecuta cargarInventarioDesdeIngredientes al hacer clic en la pestaña Inventario
(function() {
  const btnInventario = document.querySelector('.menu-btn[data-section="inventario"]');
  if (btnInventario) {
    btnInventario.addEventListener('click', function() {
      setTimeout(cargarInventarioDesdeIngredientes, 120);
    });
  }
})();

// --- ADAPTACIÓN A SUPABASE (placeholder) ---
async function guardarEnSupabase(tabla, datos) {
    // Implementar integración con Supabase aquí si se requiere
    // Por ahora solo localStorage
}

// --- NOTA: Todas las funciones globales están expuestas en window para uso desde HTML ---

// MODAL PROVEEDOR: abrir/cerrar con vanilla JS
(function() {
  var btnAbrir = document.getElementById('btn-abrir-modal-proveedor');
  var modal = document.getElementById('modal-proveedor');
  var btnCerrar = document.getElementById('btn-cerrar-modal-proveedor');
  if (btnAbrir && modal) {
    btnAbrir.addEventListener('click', function() {
      modal.style.display = 'flex';
    });
  }
  if (btnCerrar && modal) {
    btnCerrar.addEventListener('click', function(e) {
      modal.style.display = 'none';
    });
  }
  // Cerrar al hacer clic fuera del modal
  if (modal) {
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
})();

// --- INVENTARIO FODEXA ---
window.mostrarInventario = mostrarInventario;

// Buscador de ingredientes en inventario
(function() {
  const inputBusqueda = document.getElementById('busqueda-inventario');
  if (!inputBusqueda) return;
  inputBusqueda.addEventListener('input', function() {
    mostrarInventarioFiltrado(inputBusqueda.value.trim());
  });
})();

function mostrarInventarioFiltrado(filtro) {
  const contenedor = document.getElementById('inventario-listado');
  if (!contenedor) return;
  let ingredientes = [];
  try {
    ingredientes = JSON.parse(localStorage.getItem('ingredientesData') || '[]');
  } catch(e) { ingredientes = []; }
  if (filtro) {
    const f = filtro.toLowerCase();
    ingredientes = ingredientes.filter(ing =>
      (ing.nombre || '').toLowerCase().includes(f) ||
      (ing.tipoMedida || '').toLowerCase().includes(f)
    );
  }
  contenedor.innerHTML = '';
  if (!ingredientes.length) {
    contenedor.innerHTML = '<div style="color:#222;opacity:0.7;padding:24px;background:rgba(255,255,255,0.18);border-radius:16px;box-shadow:0 2px 8px #4b008220;font-family:Inter,sans-serif;backdrop-filter:blur(4px);">No hay ingredientes registrados aún.</div>';
    return;
  }
  ingredientes.forEach(function(ing, idx) {
    const card = document.createElement('div');
    card.className = 'inventario-card';
    card.style.background = 'rgba(255,255,255,0.18)';
    card.style.borderRadius = '16px';
    card.style.boxShadow = '0 2px 8px #4b008220';
    card.style.padding = '18px 22px';
    card.style.marginBottom = '18px';
    card.style.display = 'flex';
    card.style.alignItems = 'center';
    card.style.gap = '18px';
    card.style.fontFamily = 'Inter, sans-serif';
    card.style.flexWrap = 'wrap';
    card.style.backdropFilter = 'blur(4px)';

    // Nombre
    const nombreDiv = document.createElement('div');
    nombreDiv.style.flex = '1 1 180px';
    nombreDiv.style.fontWeight = '600';
    nombreDiv.style.fontSize = '1.08em';
    nombreDiv.style.color = '#222';
    nombreDiv.innerHTML = `<i class='fas fa-leaf'></i> ${ing.nombre}`;
    card.appendChild(nombreDiv);

    // Medida
    const medidaDiv = document.createElement('div');
    medidaDiv.style.flex = '0.7 1 90px';
    medidaDiv.style.color = '#2563eb';
    medidaDiv.style.fontWeight = '500';
    medidaDiv.innerText = ing.tipoMedida || '';
    card.appendChild(medidaDiv);

    // Input Stock Actual
    const inputStockActual = document.createElement('input');
    inputStockActual.type = 'number';
    inputStockActual.min = '0';
    inputStockActual.step = 'any';
    inputStockActual.value = ing.stockActual !== undefined ? ing.stockActual : '';
    inputStockActual.placeholder = 'Stock actual';
    inputStockActual.style = 'width:90px;padding:8px 10px;border-radius:8px;border:1.5px solid #d1d5db;background:#fff;color:#222;font-size:1em;';
    inputStockActual.id = `stockActual_${idx}`;
    card.appendChild(inputStockActual);

    // Input Stock Mínimo
    const inputStockMinimo = document.createElement('input');
    inputStockMinimo.type = 'number';
    inputStockMinimo.min = '0';
    inputStockMinimo.step = 'any';
    inputStockMinimo.value = ing.stockMinimo !== undefined ? ing.stockMinimo : '';
    inputStockMinimo.placeholder = 'Stock mínimo';
    inputStockMinimo.style = 'width:90px;padding:8px 10px;border-radius:8px;border:1.5px solid #d1d5db;background:#fff;color:#222;font-size:1em;';
    inputStockMinimo.id = `stockMinimo_${idx}`;
    card.appendChild(inputStockMinimo);

    // Botón Guardar
    const btnGuardar = document.createElement('button');
    btnGuardar.className = 'btn btn-primary';
    btnGuardar.innerHTML = '<i class="fas fa-save"></i> Guardar';
    btnGuardar.style = 'background:#2563eb;color:#fff;border:none;border-radius:10px;padding:10px 22px;box-shadow:0 2px 8px #2563eb22;font-size:1em;cursor:pointer;';
    btnGuardar.onclick = function() { guardarStock(idx); };
    card.appendChild(btnGuardar);

    contenedor.appendChild(card);
  });
}

// Sobrescribe mostrarInventario para que use el filtro si existe
function mostrarInventario() {
  const inputBusqueda = document.getElementById('busqueda-inventario');
  if (inputBusqueda && inputBusqueda.value) {
    mostrarInventarioFiltrado(inputBusqueda.value.trim());
  } else {
    mostrarInventarioFiltrado('');
  }
}