// Componente de gráfico de ventas por mes usando Chart.js
export function renderVentasPorMesChart(ctx, data) {
    if (!window.Chart) return;
    if (window.ventasPorMesChart) window.ventasPorMesChart.destroy();
    window.ventasPorMesChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(data),
            datasets: [{
                label: 'Total Ventas',
                data: Object.values(data),
                borderColor: '#2563eb',
                backgroundColor: 'rgba(37,99,235,0.1)',
                fill: true,
                tension: 0.3
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Ventas por Mes' }
            },
            scales: {
                y: { beginAtZero: true }
            }
        }
    });
}
