# FODEXA

FODEXA es un sistema de gestión para restaurantes construido como una aplicación web modular. Cada módulo (ventas, productos, clientes, reportes, etc.) tiene su propio HTML, CSS y JavaScript sin depender de frameworks. Puede abrirse de forma local en un navegador o ejecutarse mediante un servidor sencillo para habilitar todas sus funciones.

## Ejecución rápida

1. **Abrir directamente un HTML**: abre `index.html` o cualquier página del directorio `modulos/` o `src/pages/` en tu navegador. Algunas operaciones que usan `fetch` pueden requerir ejecutarse desde un servidor local.
2. **Iniciar servidor local**:
   - Con Python:
     ```bash
     python -m http.server 8000
     ```
     Luego visita `http://localhost:8000/index.html` en el navegador.
   - Con Node.js (requiere instalar `http-server` si no lo tienes):
     ```bash
     npx http-server -p 8080
     ```
     Visita `http://localhost:8080/index.html`.
   - También puedes usar los archivos `INICIAR_FODEXA.bat` o `INICIAR_SERVIDOR_FODEXA.bat` que automatizan estos pasos en Windows.

## Dependencias principales

El proyecto utiliza las siguientes dependencias de npm:

- `@supabase/supabase-js`
- `xlsx`

Instálalas ejecutando:

```bash
npm install
```

