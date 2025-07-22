// Componente de gráfico de clientes más frecuentes (barras horizontales) usando Chart.js
export function renderClientesFrecuentesChart(ctx, clientes) {
    if (!window.Chart) return;
    if (window.clientesFrecuentesChart) window.clientesFrecuentesChart.destroy();
    window.clientesFrecuentesChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: clientes.map(c=>c.nombre),
            datasets: [{
                label: 'Compras',
                data: clientes.map(c=>c.compras),
                backgroundColor: '#f59e42',
                borderRadius: 8
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            plugins: {
                legend: { display: false },
                title: { display: true, text: 'Clientes Más Frecuentes' }
            },
            scales: {
                x: { beginAtZero: true }
            }
        }
    });
}
