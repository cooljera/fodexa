(function(){
  const LS_PRODUCTOS_KEY = 'fodexa_productos';
  const LS_CATEGORIAS_KEY = 'fodexa_categorias';

  function guardarProductos(arr){
    localStorage.setItem(LS_PRODUCTOS_KEY, JSON.stringify(arr));
  }
  function cargarProductos(){
    try { return JSON.parse(localStorage.getItem(LS_PRODUCTOS_KEY)) || []; }
    catch(e){ return []; }
  }
  function guardarCategorias(arr){
    localStorage.setItem(LS_CATEGORIAS_KEY, JSON.stringify(arr));
  }
  function cargarCategorias(){
    try { return JSON.parse(localStorage.getItem(LS_CATEGORIAS_KEY)) || []; }
    catch(e){ return []; }
  }

  let productos = cargarProductos();
  let categorias = cargarCategorias();
  let productoEditando = null;
  let categoriaEditando = null;

  function actualizarSelectCategorias(){
    const select = document.querySelector('#form-producto select[name="categoria"]');
    if(!select) return;
    select.innerHTML = categorias.map(c => `<option value="${c.id}">${c.nombre}</option>`).join('');
  }

  function renderizarCategorias(){
    const cont = document.getElementById('categorias-container');
    if(!cont) return;
    cont.innerHTML = '';
    if(categorias.length === 0){
      cont.innerHTML = '<div class="card">No hay categorías registradas</div>';
      actualizarSelectCategorias();
      return;
    }
    categorias.forEach(cat => {
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div>${cat.nombre}</div>
        <div class="card-actions">
          <button onclick="editarCategoria('${cat.id}')">✏️</button>
          <button onclick="eliminarCategoria('${cat.id}')">🗑️</button>
        </div>`;
      cont.appendChild(card);
    });
    actualizarSelectCategorias();
  }

  function renderizarProductos(){
    const cont = document.getElementById('productos-container');
    if(!cont) return;
    cont.innerHTML = '';
    if(productos.length === 0){
      cont.innerHTML = '<div class="card">No hay productos registrados</div>';
      return;
    }
    productos.forEach(prod => {
      const card = document.createElement('div');
      card.className = 'card';
      const cat = categorias.find(c => c.id === prod.categoriaId);
      card.innerHTML = `
        <div><strong>${prod.nombre}</strong> - $${prod.precio.toLocaleString()} <small>${cat ? cat.nombre : 'Sin categoría'}</small></div>
        <div class="card-actions">
          <button onclick="editarProducto('${prod.id}')">✏️</button>
          <button onclick="eliminarProducto('${prod.id}')">🗑️</button>
        </div>`;
      cont.appendChild(card);
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderizarCategorias();
    renderizarProductos();

    document.querySelectorAll('.menu-btn').forEach(btn => {
      btn.addEventListener('click', function(){
        document.querySelectorAll('.menu-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const section = btn.getAttribute('data-section');
        document.querySelectorAll('.seccion').forEach(sec => {
          if(sec.id === 'seccion-' + section){
            sec.classList.remove('hidden');
            sec.classList.add('visible');
          } else {
            sec.classList.add('hidden');
            sec.classList.remove('visible');
          }
        });
      });
    });

    const formCat = document.getElementById('form-categoria');
    if(formCat){
      formCat.addEventListener('submit', function(e){
        e.preventDefault();
        const nombre = formCat.nombre.value.trim();
        if(!nombre) return;
        if(categoriaEditando){
          categorias = categorias.map(c => c.id === categoriaEditando ? { ...c, nombre } : c);
          categoriaEditando = null;
        } else {
          categorias.push({ id: 'cat_' + Date.now(), nombre });
        }
        guardarCategorias(categorias);
        formCat.reset();
        renderizarCategorias();
      });
    }

    const formProd = document.getElementById('form-producto');
    if(formProd){
      formProd.addEventListener('submit', function(e){
        e.preventDefault();
        const datos = {
          nombre: formProd.nombre.value.trim(),
          precio: parseFloat(formProd.precio.value) || 0,
          categoriaId: formProd.categoria.value
        };
        if(productoEditando){
          productos = productos.map(p => p.id === productoEditando ? { ...p, ...datos } : p);
          productoEditando = null;
        } else {
          productos.push({ id: 'prod_' + Date.now(), ...datos });
        }
        guardarProductos(productos);
        formProd.reset();
        renderizarProductos();
      });
    }
  });

  window.editarCategoria = function(id){
    const cat = categorias.find(c => c.id === id);
    if(!cat) return;
    categoriaEditando = id;
    const formCat = document.getElementById('form-categoria');
    formCat.nombre.value = cat.nombre;
  };

  window.eliminarCategoria = function(id){
    if(!confirm('¿Eliminar categoría?')) return;
    categorias = categorias.filter(c => c.id !== id);
    guardarCategorias(categorias);
    renderizarCategorias();
  };

  window.editarProducto = function(id){
    const prod = productos.find(p => p.id === id);
    if(!prod) return;
    productoEditando = id;
    const formProd = document.getElementById('form-producto');
    formProd.nombre.value = prod.nombre;
    formProd.precio.value = prod.precio;
    formProd.categoria.value = prod.categoriaId;
  };

  window.eliminarProducto = function(id){
    if(!confirm('¿Eliminar producto?')) return;
    productos = productos.filter(p => p.id !== id);
    guardarProductos(productos);
    renderizarProductos();
  };
})();
