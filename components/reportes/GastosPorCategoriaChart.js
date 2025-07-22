// Componente de gráfico de gastos por categoría (pie chart) usando Chart.js
export function renderGastosPorCategoriaChart(ctx, data) {
    if (!window.Chart) return;
    if (window.gastosPorCategoriaChart) window.gastosPorCategoriaChart.destroy();
    const categorias = Object.keys(data);
    const valores = Object.values(data);
    window.gastosPorCategoriaChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: categorias,
            datasets: [{
                label: 'Gastos',
                data: valores,
                backgroundColor: [
                    '#2563eb','#10b981','#f59e42','#e74c3c','#a78bfa','#fbbf24','#6366f1','#f472b6'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                title: { display: true, text: 'Gastos por Categoría' }
            }
        }
    });
}
