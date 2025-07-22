# 📦 Proceso de Build para Componentes de Ventas

Los componentes ubicados en `src/components/ventas` se mantienen en React. Para utilizarlos dentro del proyecto sin cargar Babel en el navegador se incorpora un sencillo proceso de compilación.

## 🚀 Pasos para generar los archivos JavaScript

1. Instalar dependencias (solo la primera vez):
   ```bash
   npm install
   ```
2. Ejecutar la tarea de build:
   ```bash
   npm run build
   ```
   Esto compilará los archivos JSX y generará la versión final en `dist/components/ventas`.

## 📂 Archivos generados
- `dist/components/ventas/ClienteCard.js`
- `dist/components/ventas/BuscadorClientes.js`
- `dist/components/ventas/Ventas.js`

Estos scripts utilizan formato UMD, por lo que pueden incluirse con etiquetas `<script>` después de cargar React.

