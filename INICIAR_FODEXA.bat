@echo off
title FODEXA - Sistema de Gestión para Restaurantes
color 0b

echo.
echo ████████╗ ████████╗ ████████╗ ████████╗ ██╗  ██╗ █████╗ 
echo ██╔════╝ ██╔═══██╗ ██╔══██║ ██╔════╝ ╚██╗██╔╝██╔══██╗
echo ██║      ██║   ██║ ██║  ██║ ██████╗   ╚███╔╝ ███████║
echo ██║      ██║   ██║ ██║  ██║ ██╔══╝   ██╔██╗  ██╔══██║
echo ╚██████╗ ╚██████╔╝ ██████╔╝ ████████╗██╔╝ ██╗ ██║  ██║
echo  ╚═════╝  ╚═════╝  ╚═════╝  ╚═══════╝╚═╝  ╚═╝ ╚═╝  ╚═╝
echo.
echo =====================================================
echo    Sistema de Gestión para Restaurantes
echo    Version 2.0 - Frontend Modular Puro
echo =====================================================
echo.



echo [1] Abrir FODEXA en Chrome
echo [2] Abrir FODEXA en Firefox  
echo [3] Abrir FODEXA en Edge
echo [12] Gestionar Productos en Chrome
echo [13] Gestionar Productos en Firefox
echo [14] Gestionar Productos en Edge
echo [4] Abrir Reportes Mensuales en Chrome
echo [5] Abrir Reportes Mensuales en Firefox
echo [6] Abrir Reportes Mensuales en Edge

echo [7] Abrir con servidor local (Python)
echo [8] Abrir con servidor local (Node.js)
echo [15] Gestionar Productos con servidor local (Python)
echo [16] Gestionar Productos con servidor local (Node.js)
echo [10] Abrir Reportes Mensuales con servidor local (Python)
echo [11] Abrir Reportes Mensuales con servidor local (Node.js)
echo [9] Ver documentación (README)
echo [0] Salir
echo.





set /p choice="Selecciona una opción (0-16): "
if "%choice%"=="15" (
    echo Iniciando servidor Python en puerto 8000 para Gestión de Productos...
    echo Abriendo navegador en: http://localhost:8000/modulos/ventas/productos.html
    start "" "http://localhost:8000/modulos/ventas/productos.html"
    python -m http.server 8000
    goto end
)
if "%choice%"=="16" (
    echo Iniciando servidor Node.js para Gestión de Productos...
    echo Abre tu navegador en: http://localhost:8080/modulos/ventas/productos.html
    npx http-server -p 8080
    goto end
)


if "%choice%"=="1" (
    echo Abriendo FODEXA en Chrome...
    start chrome "file:///%CD%/index.html"
    goto end
)
if "%choice%"=="2" (
    echo Abriendo FODEXA en Firefox...
    start firefox "file:///%CD%/index.html"
    goto end
)
if "%choice%"=="3" (
    echo Abriendo FODEXA en Edge...
    start msedge "file:///%CD%/index.html"
    goto end
)
if "%choice%"=="12" (
    echo Abriendo Gestión de Productos en Chrome...
    start chrome "file:///%CD%/modulos/ventas/productos.html"
    goto end
)
if "%choice%"=="13" (
    echo Abriendo Gestión de Productos en Firefox...
    start firefox "file:///%CD%/modulos/ventas/productos.html"
    goto end
)
if "%choice%"=="14" (
    echo Abriendo Gestión de Productos en Edge...
    start msedge "file:///%CD%/modulos/ventas/productos.html"
    goto end
)
if "%choice%"=="4" (
    echo Abriendo Reportes Mensuales en Chrome...
    start chrome "file:///%CD%/src/pages/reportes.html"
    goto end
)
if "%choice%"=="5" (
    echo Abriendo Reportes Mensuales en Firefox...
    start firefox "file:///%CD%/src/pages/reportes.html"
    goto end
)
if "%choice%"=="6" (
    echo Abriendo Reportes Mensuales en Edge...
    start msedge "file:///%CD%/src/pages/reportes.html"
    goto end
)
if "%choice%"=="7" (
    echo Iniciando servidor Python en puerto 8000...
    echo Abriendo navegador en: http://localhost:8000
    start "" "http://localhost:8000"
    python -m http.server 8000
    goto end
)
if "%choice%"=="8" (
    echo Iniciando servidor Node.js...
    echo Abre tu navegador en: http://localhost:8080
    npx http-server -p 8080
    goto end
)
if "%choice%"=="10" (
    echo Iniciando servidor Python en puerto 8000 para Reportes...
    echo Abriendo navegador en: http://localhost:8000/src/pages/reportes.html
    start "" "http://localhost:8000/src/pages/reportes.html"
    python -m http.server 8000
    goto end
)
if "%choice%"=="11" (
    echo Iniciando servidor Node.js para Reportes...
    echo Abre tu navegador en: http://localhost:8080/src/pages/reportes.html
    npx http-server -p 8080
    goto end
)
if "%choice%"=="9" (
    echo Abriendo documentación...
    start README.md
    goto end
)
if "%choice%"=="0" (
    echo Saliendo...
    goto end
)

echo Opción no válida. Intenta de nuevo.
pause
goto start

:end
echo.
echo ¡Gracias por usar FODEXA!
echo.
pause
