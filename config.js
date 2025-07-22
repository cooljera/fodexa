// config.js
// Leer variables de entorno para Supabase
const supabaseUrl = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_URL) ? process.env.SUPABASE_URL : '';
const supabaseKey = (typeof process !== 'undefined' && process.env && process.env.SUPABASE_KEY) ? process.env.SUPABASE_KEY : '';

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { supabaseUrl, supabaseKey };
} else {
  window.supabaseUrl = supabaseUrl;
  window.supabaseKey = supabaseKey;
}
