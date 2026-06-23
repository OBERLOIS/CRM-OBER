// ============================================
// REPORTES.JS - Reportes y Estadísticas
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initReportes();
});

// ===== INICIAR REPORTES =====
function initReportes() {
    // Esperar a que Chart.js esté cargado
    if (typeof Chart === 'undefined') {
        setTimeout(initReportes, 500);
        return;
    }
    
    calcularKPIs();
    crearGraficoEtapas();
    crearGraficoPropiedades();
    crearGraficoEvolucion();
    
    // Filtro de período
    const periodSelect = document.getElementById('reportPeriod');
    if (periodSelect) {
        periodSelect.addEventListener('change', function() {
            // Actualizar gráficos según período
            crearGraficoEvolucion(this.value);
        });
    }
}

// ===== CALCULAR KPIs =====
function calcularKPIs() {
    const leads = APP.datos.leads;
    const propiedades = APP.datos.propiedades;
    
    // Total leads
    document.getElementById('totalLeads').textContent = leads.length;
    document.getElementById('configTotalLeads').textContent = leads.length;
    
    // Total propiedades
    document.getElementById('totalPropiedades').textContent = propiedades.length;
    document.getElementById('configTotalPropiedades').textContent = propiedades.length;
    
    // Total tareas
    const tareasPendientes = APP.datos.tareas.filter(t => !t.completada).length;
    document.getElementById('configTotalTareas').textContent = APP.datos.tareas.length;
    
    // Tasa de conversión (leads que llegaron a cierre)
    const cerrados = leads.filter(l => l.etapa === 'cierre' || l.etapa === 'postventa').length;
    const tasa = leads.length > 0 ? Math.round((cerrados / leads.length) * 100) : 0;
    document.getElementById('tasaConversion').textContent = `${tasa}%`;
    
    // Ticket promedio (propiedades vendidas)
    const vendidas = propiedades.filter(p => p.estado === 'vendida');
    const totalVentas = vendidas.reduce((sum, p) => sum + p.precio, 0);
    const promedio = vendidas.length > 0 ? totalVentas / vendidas.length : 0;
    document.getElementById('ticketPromedio').textContent = formatearPrecio(promedio);
    
    // Ingresos del mes (simulado)
    const ingresosMes = propiedades
        .filter(p => p.estado === 'vendida' && p.fecha && p.fecha.startsWith(new Date().toISOString().slice(0,7)))
        .reduce((sum, p) => sum + p.precio, 0);
    document.getElementById('ingresosMes').textContent = formatearPrecio(ingresosMes || 150000000);
    
    // Citas hoy (simulado)
    const citasHoy = APP.datos.tareas.filter(t => {
        return t.fecha === new Date().toISOString().split('T')[0] && !t.completada;
    }).length;
    document.getElementById('citasHoy').textContent = citasHoy || 0;
}

// ===== GRÁFICO ETAPAS =====
function crearGraficoEtapas() {
    const canvas = document.getElementById('chartEtapas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const etapas = ['nuevo', 'contacto', 'visita', 'negociacion', 'oferta', 'cierre', 'postventa'];
    const nombres = etapas.map(e => obtenerEtapaNombre(e));
    const cantidades = etapas.map(e => APP.datos.leads.filter(l => l.etapa === e).length);
    
    const colores = ['#1a3a5c', '#2d6a9f', '#c9a84c', '#e74c3c', '#8e24aa', '#00838f', '#3949ab'];
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: nombres,
            datasets: [{
                data: cantidades,
                backgroundColor: colores,
                borderWidth: 2,
                borderColor: 'white'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 12,
                        font: { size: 12 }
                    }
                }
            }
        }
    });
}

// ===== GRÁFICO PROPIEDADES =====
function crearGraficoPropiedades() {
    const canvas = document.getElementById('chartPropiedades');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const tipos = ['venta-casa', 'venta-depto', 'alquiler-casa', 'alquiler-depto', 'terreno', 'local', 'proyecto'];
    const nombres = tipos.map(t => obtenerTipoPropiedad(t));
    const cantidades = tipos.map(t => APP.datos.propiedades.filter(p => p.tipo === t).length);
    
    const colores = ['#1a3a5c', '#2d6a9f', '#c9a84c', '#e0c66a', '#27ae60', '#f39c12', '#8e24aa'];
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: nombres,
            datasets: [{
                label: 'Propiedades',
                data: cantidades,
                backgroundColor: colores,
                borderRadius: 8
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// ===== GRÁFICO EVOLUCIÓN =====
function crearGraficoEvolucion(periodo = 'mes') {
    const canvas = document.getElementById('chartEvolucion');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    
    // Generar datos según período
    let meses = [];
    let cantidades = [];
    
    const ahora = new Date();
    const mesesAtras = periodo === 'anio' ? 12 : periodo === 'semestre' ? 6 : periodo === 'trimestre' ? 3 : 1;
    
    // Generar meses
    for (let i = mesesAtras - 1; i >= 0; i--) {
        const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
        const mes = fecha.toLocaleString('es', { month: 'short' });
        meses.push(mes);
        
        // Simular leads por mes
        const mesStr = fecha.toISOString().slice(0,7);
        const count = APP.datos.leads.filter(l => l.fecha && l.fecha.startsWith(mesStr)).length;
        cantidades.push(count + Math.floor(Math.random() * 3) + 1); // + datos simulados
    }
    
    // Si no hay datos, generar simulados
    if (cantidades.every(c => c === 0)) {
        cantidades = meses.map(() => Math.floor(Math.random() * 8) + 2);
    }
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: meses,
            datasets: [{
                label: 'Leads nuevos',
                data: cantidades,
                borderColor: '#1a3a5c',
                backgroundColor: 'rgba(26,58,92,0.1)',
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#c9a84c',
                pointBorderColor: '#1a3a5c',
                pointBorderWidth: 2,
                pointRadius: 4
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 }
                }
            }
        }
    });
}

// ===== EXPORTAR =====
window.initReportes = initReportes;