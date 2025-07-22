const { indexedDB, IDBKeyRange } = require('fake-indexeddb');
const { LocalStorage } = require('node-localstorage');

global.indexedDB = indexedDB;
global.IDBKeyRange = IDBKeyRange;
global.localStorage = new LocalStorage('./tmp_local');
global.window = { indexedDB: global.indexedDB, localStorage: global.localStorage, addEventListener: () => {} };

(async () => {
  const { default: clientesService } = await import('../src/services/clientesService.js');

  // Limpiar base de datos
  await new Promise((res) => {
    const req = indexedDB.deleteDatabase('FodexaClientesDB');
    req.onsuccess = () => res();
    req.onerror = () => res();
  });
  global.localStorage.clear();

  await clientesService.init();

  // Crear
  const nuevo = await clientesService.guardarCliente({ nombre: 'Test', telefonoWhatsapp: '12345' });
  console.log('Creado', nuevo);

  // Leer
  let todos = await clientesService.obtenerTodosLosClientes();
  console.log('Total tras crear:', todos.length);

  // Actualizar
  const actualizado = await clientesService.actualizarCliente(nuevo.id, { nombre: 'Actualizado' });
  console.log('Nombre actualizado:', actualizado.nombre);

  // Eliminar
  await clientesService.eliminarCliente(nuevo.id);
  todos = await clientesService.obtenerTodosLosClientes();
  console.log('Total final:', todos.length);
})();
