// services/supabase.js
// Asegúrate de incluir el CDN de supabase-js en tu HTML antes de este script
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

// Conexión a Supabase para FODEXA (sin import/export, compatible con scripts por <script> tag)
// Obtiene las credenciales desde config.js
let config;
if (typeof module !== 'undefined' && module.exports) {
    config = require('../config.js');
} else {
    config = { supabaseUrl: window.supabaseUrl, supabaseKey: window.supabaseKey };
}

const { supabaseUrl, supabaseKey } = config;

// Carga el cliente de Supabase desde CDN si no está presente
if (typeof window.supabase === 'undefined') {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';
    script.onload = function() {
        window.supabase = window.supabase || window.supabase.createClient(supabaseUrl, supabaseKey);
    };
    document.head.appendChild(script);
} else {
    window.supabase = window.supabase || window.supabase.createClient(supabaseUrl, supabaseKey);
}

// Ahora puedes usar window.supabase en cualquier script global

