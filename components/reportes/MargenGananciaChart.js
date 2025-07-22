// Componente de gráfico de margen de ganancia por producto (barras) usando Chart.js
export function renderMargenGananciaChart(ctx, productos) {
    if (!window.Chart) return;
    if (window.margenGananciaChart) window.margenGananciaChart.destroy();
    window.margenGananciaChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productos.map(p=>p.nombre),
            datasets: [{
                label: 'Margen Promedio ($)',
                data: productos.map(p=>p.margen),
                backgroundColor: '#6366f1',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Margen de Ganancia Estimado por Producto' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
