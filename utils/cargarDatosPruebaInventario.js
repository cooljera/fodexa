// Ejecuta esto en la consola del navegador para poblar datos de prueba en FODEXA
(function(){
  // Proveedores de ejemplo
  var proveedores = [
    { id: 'prov_001', nombre: 'Distribuidora FODEXA' },
    { id: 'prov_002', nombre: 'Alimentos La Huerta' },
    { id: 'prov_003', nombre: 'Frutas y Verduras S.A.' }
  ];
  localStorage.setItem('fodexa_proveedores', JSON.stringify(proveedores));

  // Ingredientes de ejemplo, cada uno con proveedorId
  var ingredientes = [
    { nombre: 'Tomate', proveedorId: 'prov_003', tipoMedida: 'Unidades' },
    { nombre: 'Lechuga', proveedorId: 'prov_003', tipoMedida: 'Unidades' },
    { nombre: 'Queso', proveedorId: 'prov_001', tipoMedida: 'Gramos' },
    { nombre: 'Pan', proveedorId: 'prov_002', tipoMedida: 'Unidades' }
  ];
  localStorage.setItem('ingredientesFodexa', JSON.stringify(ingredientes));

  alert('¡Datos de prueba cargados! Recarga la página para ver los proveedores en el selector.');
})();
