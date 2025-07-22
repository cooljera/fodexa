// Exporta el dashboard de reportes a PDF usando html2pdf.js
// Requiere que html2pdf.js esté cargado en la página
export function exportarReportesPDF({logoUrl, mes, anio, nombreRestaurante}) {
    const element = document.querySelector('.reportes-container');
    if (!element) return;
    const fecha = new Date();
    const fechaStr = fecha.toLocaleDateString();
    const opt = {
        margin:       0.5,
        filename:     `Reporte_FODEXA_${mes}_${anio}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 },
        jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
    };
    // Agregar cabecera personalizada
    const original = element.cloneNode(true);
    const cabecera = document.createElement('div');
    cabecera.style.display = 'flex';
    cabecera.style.alignItems = 'center';
    cabecera.style.justifyContent = 'space-between';
    cabecera.style.marginBottom = '1rem';
    cabecera.innerHTML = `
        <img src="${logoUrl}" alt="Logo" style="height:48px;"> 
        <div style="font-size:1.3rem;font-weight:bold;">${nombreRestaurante} - Reporte Mensual</div>
        <div style="font-size:1rem;">${mes} ${anio}</div>
    `;
    original.prepend(cabecera);
    // Pie de página
    const pie = document.createElement('div');
    pie.style.textAlign = 'center';
    pie.style.marginTop = '2rem';
    pie.style.fontSize = '0.9rem';
    pie.innerHTML = `Exportado el ${fechaStr} con FODEXA`;
    original.appendChild(pie);
    html2pdf().from(original).set(opt).save();
}
