console.log('🚀 Script migracionAuto.js cargado correctamente');
// utils/migracionAuto.js
// Migración automática de clientes locales a Supabase al cargar la sección de clientes (solo si modoDev === true)

document.addEventListener('DOMContentLoaded', function() {
  if (typeof modoDev !== 'undefined' && modoDev && typeof migrarClientesLocalesASupabase === 'function' && !localStorage.getItem('clientesMigrados')) {
    console.log('🔄 Iniciando migración automática...');
    migrarClientesLocalesASupabase()
      .then(() => {
        console.log('✅ Clientes migrados automáticamente a Supabase.');
        alert('✅ Clientes migrados automáticamente a Supabase.');
        localStorage.setItem('clientesMigrados', 'true');
      })
      .catch((error) => {
        console.error('❌ Error en la migración automática:', error);
      });
  }
});
