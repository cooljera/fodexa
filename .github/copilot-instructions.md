# Copilot Instructions for FODEXA

## Project Overview
FODEXA is a modular, pure frontend restaurant management system. It is organized by business domains (ventas, productos, clientes, reportes, domicilios, etc.) with each module having its own HTML, JS, and CSS. The system is designed for local/offline use but supports running via a local server for full functionality (e.g., fetch for JSON data).

## Architecture & Patterns
- **Modules:** Each business area (e.g., ventas, productos) is a folder under `modulos/` with its own HTML, JS, and CSS. Example: `modulos/ventas/ventas.html`, `ventas.js`, `ventas.css`.
- **Data:** Data is stored in JSON files under `data/` (e.g., `clientes.json`, `productos.json`). These are loaded via fetch or localStorage/IndexedDB.
- **UI:** All UI is rendered with vanilla JS and HTML. No frameworks are used. Modals, selectors, and dynamic blocks are built with pure JS and styled via CSS.
- **No ES6 Imports:** All scripts are loaded via `<script>` tags. Do not use `import`/`export`.
- **Global Functions:** Functions that need to be called from HTML (e.g., button handlers) must be attached to `window` or declared globally.
- **State:** Transient UI state (e.g., clienteSeleccionado) is managed in JS variables, not in the DOM or via frameworks.

## Developer Workflows
- **Run Locally (no server):** Open `index.html` or any module HTML directly in a browser. Some features (fetching JSON) may not work due to browser security.
- **Run with Local Server:** Use the batch file `INICIAR_FODEXA.bat` to launch a Python or Node.js server for full functionality. Example: `python -m http.server 8000`.
- **Entry Points:**
  - Main: `index.html`
  - Sales: `modulos/ventas/ventas.html`
  - Products: `modulos/ventas/productos.html`
  - Reports: `src/pages/reportes.html`
- **Launcher:** Use `INICIAR_FODEXA.bat` for menu-driven startup in various browsers or with a local server.

## Project Conventions
- **File Naming:** Use lowercase, hyphen-separated for files. Keep related files together by module.
- **No Frameworks:** Do not introduce React, Vue, Angular, etc.
- **No Build Step:** All code is plain JS/CSS/HTML. No transpilation or bundling.
- **CSS:** Prefer modular CSS per module. Use BEM-like or descriptive class names.
- **Data Access:** Always use fetch/localStorage/IndexedDB for data. Do not hardcode data in JS files.
- **UI Updates:** Always update the DOM directly. Do not use virtual DOM or templating libraries.

## Examples
- To add a new button to ventas, edit `ventas.html` and add the handler in `ventas.js` as a global function.
- To add a new report, create a new JS file in `utils/` or `components/reportes/` and link it in the relevant HTML.

## Key Files & Directories
- `INICIAR_FODEXA.bat`: Main launcher for all workflows
- `modulos/ventas/ventas.html`, `ventas.js`, `ventas.css`: Sales module
- `modulos/ventas/productos.html`, `productos.js`, `productos.css`: Product management
- `data/`: All persistent data (JSON)
- `assets/`: Shared static assets (CSS, JS, images)
- `utils/`, `components/`: Shared JS utilities and components

## Integration Points
- **Export:** Reporting modules use `exportPDF.js` and `exportExcel.js` for exporting data.
- **Charts:** Uses Chart.js (linked via CDN) for report visualizations.

## Special Notes
- If you see errors about duplicate variable declarations, check for multiple `let`/`var`/`const` of the same name in the same scope.
- Always ensure global functions are accessible from HTML event handlers.
- Do not use ES6 modules or import/export syntax.

---
If any convention or workflow is unclear, ask the user for clarification before proceeding with major changes.
