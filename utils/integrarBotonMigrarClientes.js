// utils/integrarBotonMigrarClientes.js
// Inserta el botón de migración en la interfaz profesional generada por JS
(function(){
    function crearBotonMigrar() {
        if (document.getElementById('btn-migrar-clientes')) return; // No duplicar
        var btn = document.createElement('button');
        btn.id = 'btn-migrar-clientes';
        btn.className = 'btn btn-primary btn-migrar-clientes';
        btn.innerHTML = '<i class="fas fa-sync"></i> Migrar clientes locales a Supabase';
        btn.style.marginLeft = '8px';
        btn.onclick = function() {
            migrarClientesLocalesASupabase().then(function(){
                alert('✅ Clientes migrados exitosamente a Supabase.');
            });
        };
        // Buscar barra de acciones profesional
        var panel = document.querySelector('.panel-actions, .acciones-panel, .acciones, .panel-header .acciones');
        if (panel) {
            panel.appendChild(btn);
        } else {
            // Si no existe, intentar en el header profesional
            var header = document.querySelector('.panel-header, .header-panel, .header');
            if (header) header.appendChild(btn);
        }
    }
    // Esperar a que la interfaz profesional esté lista
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(crearBotonMigrar, 1200); // Espera a que el render JS termine
    });
    // También exponer función global por si se necesita reintentar
    window.insertarBotonMigrarClientes = crearBotonMigrar;
})();
