// utils/migrarClientesLocalesASupabase.js
// Requiere que supabase.js esté cargado y window.supabase disponible

async function migrarClientesLocalesASupabase() {
    if (!window.supabase) {
        alert('Supabase no está inicializado.');
        return;
    }
    const clientesLocal = JSON.parse(localStorage.getItem('clientes') || '[]');
    if (!Array.isArray(clientesLocal) || clientesLocal.length === 0) {
        alert('No hay clientes locales para migrar.');
        return;
    }
    // Obtener clientes existentes en Supabase (solo nombre y telefono para comparar)
    const { data: existentes, error } = await supabase
        .from('clientes')
        .select('nombre, telefono');
    if (error) {
        alert('Error consultando Supabase: ' + error.message);
        return;
    }
    // Filtrar clientes que no estén ya en Supabase
    const nuevos = clientesLocal.filter(local => {
        return !existentes.some(remoto =>
            (remoto.telefono && remoto.telefono === local.telefono) ||
            (remoto.nombre && remoto.nombre === local.nombre)
        );
    });
    if (nuevos.length === 0) {
        alert('Todos los clientes locales ya existen en Supabase.');
        return;
    }
    // Insertar los nuevos clientes
    const { error: insertError } = await supabase
        .from('clientes')
        .insert(nuevos);
    if (insertError) {
        alert('Error insertando clientes: ' + insertError.message);
    } else {
        alert('Migración completada: ' + nuevos.length + ' clientes subidos a Supabase.');
    }
}
// Hacer global para poder llamarla desde consola o botones
window.migrarClientesLocalesASupabase = migrarClientesLocalesASupabase;
