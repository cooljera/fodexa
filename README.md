# FODEXA

Este proyecto utiliza Supabase para almacenar datos. Antes de ejecutar la aplicación debes definir las siguientes variables de entorno para indicar tu instancia de Supabase:

```bash
export SUPABASE_URL="https://tu-proyecto.supabase.co"
export SUPABASE_KEY="<tu-clave>"
```

El archivo `config.js` lee estas variables y `services/supabase.js` las utiliza para inicializar el cliente de Supabase.
