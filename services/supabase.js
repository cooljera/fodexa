// services/supabase.js
// Asegúrate de incluir el CDN de supabase-js en tu HTML antes de este script
// <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js"></script>

// Conexión a Supabase para FODEXA (sin import/export, compatible con scripts por <script> tag)
// NOTA: Reemplaza los valores por los de tu proyecto real
const supabaseUrl = 'https://lryhbyltkdvijkvpvuch.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyeWhieWx0a2R2aWprdnB2dWNoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI1MDczNDgsImV4cCI6MjA2ODA4MzM0OH0.onRaOZnOIaiZqMjF9yMsWCu2kOP2JlCr-Bw3lFVxrhQ';

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

