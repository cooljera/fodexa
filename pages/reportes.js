// Módulo principal de Reportes Mensuales FODEXA
// Integra todos los componentes de gráficos y helpers
import { obtenerVentasPorMes, obtenerTopProductos, obtenerClientesFrecuentes, obtenerGastosPorCategoria, obtenerMargenPorProducto } from '../utils/reportesHelper.js';
import { renderVentasPorMesChart } from '../components/reportes/VentasPorMesChart.js';
import { renderTopProductosChart } from '../components/reportes/TopProductosChart.js';
import { renderClientesFrecuentesChart } from '../components/reportes/ClientesFrecuentesChart.js';
import { renderGastosPorCategoriaChart } from '../components/reportes/GastosPorCategoriaChart.js';
import { renderMargenGananciaChart } from '../components/reportes/MargenGananciaChart.js';
import { exportarReportesPDF } from '../utils/exportPDF.js';
import { exportarReportesExcel } from '../utils/exportExcel.js';
// --- Parámetros de branding ---
const logoUrl = '../../assets/images/logo.png'; // Cambia si tu logo está en otra ruta
const nombreRestaurante = 'FODEXA';
// --- Exportar a PDF ---
document.getElementById('btn-export-pdf').addEventListener('click', () => {
    const filtro = getFiltro();
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const mesNombre = filtro.mes ? meses[parseInt(filtro.mes)-1] : 'Todos';
    exportarReportesPDF({
        logoUrl,
        mes: mesNombre,
        anio: filtro.anio || new Date().getFullYear(),
        nombreRestaurante
    });
});

// --- Exportar a Excel ---
document.getElementById('btn-export-excel').addEventListener('click', () => {
    const filtro = getFiltro();
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const mesNombre = filtro.mes ? meses[parseInt(filtro.mes)-1] : 'Todos';
    exportarReportesExcel({
        ventasPorMes: obtenerVentasPorMes(ventas, filtro),
        topProductos: obtenerTopProductos(ventas, productos, filtro),
        clientesFrecuentes: obtenerClientesFrecuentes(ventas, clientes, filtro),
        gastosPorCategoria: obtenerGastosPorCategoria(gastos, filtro),
        margenPorProducto: obtenerMargenPorProducto(ventas, productos, filtro),
        mes: mesNombre,
        anio: filtro.anio || new Date().getFullYear()
    });
});

// --- Configuración inicial ---
const ventas = JSON.parse(localStorage.getItem('ventas') || '[]');
const productos = JSON.parse(localStorage.getItem('productos') || '[]');
const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
const gastos = JSON.parse(localStorage.getItem('gastos') || '[]');

// --- Filtros ---
const filtroMes = document.getElementById('filtro-mes');
const filtroAnio = document.getElementById('filtro-anio');
const filtroTipo = document.getElementById('filtro-tipo');

function getFiltro() {
    return {
        mes: filtroMes.value,
        anio: filtroAnio.value,
        tipo: filtroTipo.value
    };
}

function cargarFiltros() {
    // Meses
    const meses = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    filtroMes.innerHTML = '<option value="">Todos</option>' + meses.map((m,i)=>`<option value="${i+1}">${m}</option>`).join('');
    // Años
    const anios = [...new Set(ventas.map(v=>new Date(v.fecha).getFullYear()))];
    filtroAnio.innerHTML = '<option value="">Todos</option>' + anios.map(a=>`<option value="${a}">${a}</option>`).join('');
    // Tipos
    filtroTipo.innerHTML = '<option value="">Todos</option>' +
        '<option value="ventas">Ventas</option>' +
        '<option value="gastos">Gastos</option>';
}

// --- Renderizado de gráficos ---
function renderizarReportes() {
    const filtro = getFiltro();
    // Ventas por mes
    const ventasPorMes = obtenerVentasPorMes(ventas, filtro);
    renderVentasPorMesChart(document.getElementById('chart-ventas-mes'), ventasPorMes);
    // Top productos
    const topProductos = obtenerTopProductos(ventas, productos, filtro);
    renderTopProductosChart(document.getElementById('chart-top-productos'), topProductos);
    // Clientes frecuentes
    const clientesFrecuentes = obtenerClientesFrecuentes(ventas, clientes, filtro);
    renderClientesFrecuentesChart(document.getElementById('chart-clientes-frecuentes'), clientesFrecuentes);
    // Gastos por categoría
    const gastosPorCat = obtenerGastosPorCategoria(gastos, filtro);
    renderGastosPorCategoriaChart(document.getElementById('chart-gastos-categoria'), gastosPorCat);
    // Margen de ganancia por producto
    const margenPorProducto = obtenerMargenPorProducto(ventas, productos, filtro);
    renderMargenGananciaChart(document.getElementById('chart-margen-ganancia'), margenPorProducto);
}

// --- Eventos de filtros ---
[filtroMes, filtroAnio, filtroTipo].forEach(filtro => {
    filtro.addEventListener('change', renderizarReportes);
});

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    cargarFiltros();
    renderizarReportes();
});
