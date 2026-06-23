// ============================================
// PIPELINE.JS - Pipeline de Ventas (Kanban)
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    renderPipeline();
});

// ===== ETAPAS =====
const ETAPAS = [
    { id: 'nuevo', nombre: 'Nuevo', color: '#e3f2fd' },
    { id: 'contacto', nombre: 'Contacto', color: '#e8f5e9' },
    { id: 'visita', nombre: 'Visita', color: '#fff3e0' },
    { id: 'negociacion', nombre: 'Negociación', color: '#fce4ec' },
    { id: 'oferta', nombre: 'Oferta', color: '#f3e5f5' },
    { id: 'cierre', nombre: 'Cierre', color: '#e0f7fa' },
    { id: 'postventa', nombre: 'Post-venta', color: '#e8eaf6' }
];

// ===== RENDER PIPELINE =====
function renderPipeline() {
    const board = document.getElementById('kanbanBoard');
    if (!board) return;
    
    let html = '';
    let total = 0;
    
    ETAPAS.forEach(etapa => {
        const leads = APP.datos.leads.filter(l => l.etapa === etapa.id);
        total += leads.length;
        
        html += `
            <div class="kanban-column">
                <div class="kanban-header">
                    <div class="kanban-title">
                        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${etapa.color};"></span>
                        ${etapa.nombre}
                    </div>
                    <span class="kanban-count">${leads.length}</span>
                </div>
                ${leads.map(lead => `
                    <div class="kanban-card" onclick="verDetalleLead(${lead.id})">
                        <div class="kanban-card-name">${lead.nombre}</div>
                        <div class="kanban-card-detail">
                            ${obtenerTipoPropiedad(lead.interes)} • ${lead.telefono}
                        </div>
                    </div>
                `).join('')}
                ${leads.length === 0 ? `
                    <div style="text-align:center;padding:20px;color:var(--text-gray);font-size:13px;">
                        <i class="fas fa-inbox"></i> Vacío
                    </div>
                ` : ''}
            </div>
        `;
    });
    
    board.innerHTML = html;
    
    // Actualizar total
    const totalEl = document.getElementById('pipelineTotal');
    if (totalEl) totalEl.textContent = `${total} leads`;
}

// ===== VER DETALLE LEAD =====
function verDetalleLead(id) {
    const lead = APP.datos.leads.find(l => l.id === id);
    if (!lead) return;
    
    const modal = document.getElementById('leadDetailModal');
    const content = document.getElementById('leadDetailContent');
    
    // Encontrar propiedad asociada (si existe)
    const propiedad = APP.datos.propiedades.find(p => p.id === lead.propiedadId);
    
    content.innerHTML = `
        <div style="padding:20px;">
            <h3 style="font-size:20px;margin-bottom:4px;">${lead.nombre}</h3>
            <p style="color:var(--text-gray);margin-bottom:16px;">
                <span class="lead-stage-badge stage-${lead.etapa}">${obtenerEtapaNombre(lead.etapa)}</span>
            </p>
            
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
                <div><strong>📱 Teléfono</strong><br>${lead.telefono}</div>
                <div><strong>✉️ Email</strong><br>${lead.email || 'No registrado'}</div>
                <div><strong>🏷️ Interés</strong><br>${obtenerTipoPropiedad(lead.interes)}</div>
                <div><strong>📅 Fecha</strong><br>${lead.fecha || 'No registrada'}</div>
            </div>
            
            ${lead.notas ? `
                <div style="margin-bottom:16px;">
                    <strong>📝 Notas</strong>
                    <p style="background:var(--bg-light);padding:12px;border-radius:8px;margin-top:4px;">${lead.notas}</p>
                </div>
            ` : ''}
            
            ${propiedad ? `
                <div style="margin-bottom:16px;background:var(--bg-light);padding:12px;border-radius:8px;">
                    <strong>🏠 Propiedad asociada</strong>
                    <p style="margin-top:4px;">${propiedad.titulo} - ${formatearPrecio(propiedad.precio)}</p>
                    <p style="font-size:13px;color:var(--text-gray);">${propiedad.ubicacion}</p>
                </div>
            ` : ''}
            
            <div style="display:flex;gap:12px;flex-wrap:wrap;">
                <button onclick="abrirWhatsApp('${lead.telefono}')" class="btn-primary" style="background:#25d366;">
                    <i class="fab fa-whatsapp"></i> WhatsApp
                </button>
                <button onclick="cambiarEtapaLead(${lead.id})" class="btn-secondary">
                    <i class="fas fa-arrow-right"></i> Cambiar etapa
                </button>
                <button onclick="cerrarModal('leadDetailModal')" class="btn-secondary">
                    Cerrar
                </button>
            </div>
        </div>
    `;
    
    abrirModal('leadDetailModal');
}

// ===== CAMBIAR ETAPA =====
function cambiarEtapaLead(id) {
    const lead = APP.datos.leads.find(l => l.id === id);
    if (!lead) return;
    
    const etapas = ['nuevo', 'contacto', 'visita', 'negociacion', 'oferta', 'cierre', 'postventa'];
    const currentIndex = etapas.indexOf(lead.etapa);
    const nextIndex = (currentIndex + 1) % etapas.length;
    const nuevaEtapa = etapas[nextIndex];
    
    lead.etapa = nuevaEtapa;
    guardarDatos();
    
    // Cerrar modal detalle y actualizar
    cerrarModal('leadDetailModal');
    renderPipeline();
    renderLeads();
    mostrarNotificacion(`🔄 Etapa actualizada a: ${obtenerEtapaNombre(nuevaEtapa)}`);
}

// ===== EXPORTAR =====
window.verDetalleLead = verDetalleLead;
window.cambiarEtapaLead = cambiarEtapaLead;
window.renderPipeline = renderPipeline;