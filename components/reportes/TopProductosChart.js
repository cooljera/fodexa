// Componente de gráfico de productos más vendidos (barras) usando Chart.js
export function renderTopProductosChart(ctx, productos) {
    if (!window.Chart) return;
    if (window.topProductosChart) window.topProductosChart.destroy();
    window.topProductosChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: productos.map(p=>p.nombre),
            datasets: [{
                label: 'Cantidad Vendida',
                data: productos.map(p=>p.cantidad),
                backgroundColor: '#10b981',
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Top 5 Productos Más Vendidos' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
