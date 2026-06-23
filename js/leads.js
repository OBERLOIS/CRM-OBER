// ============================================
// LEADS.JS - Gestión de Leads
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    renderLeads();
    setupLeadFilters();
    setupLeadForm();
});

// ===== RENDER LEADS =====
function renderLeads(filtro = 'all', busqueda = '') {
    const grid = document.getElementById('leadsGrid');
    if (!grid) return;
    
    let leads = APP.datos.leads;
    
    // Filtro por etapa
    if (filtro !== 'all') {
        leads = leads.filter(l => l.etapa === filtro);
    }
    
    // Filtro por interés
    const interesFilter = document.getElementById('filterInteres');
    if (interesFilter && interesFilter.value !== 'all') {
        leads = leads.filter(l => l.interes === interesFilter.value);
    }
    
    // Búsqueda
    if (busqueda) {
        const q = busqueda.toLowerCase();
        leads = leads.filter(l => 
            l.nombre.toLowerCase().includes(q) ||
            l.telefono.includes(q) ||
            (l.email && l.email.toLowerCase().includes(q))
        );
    }
    
    if (leads.length === 0) {
        grid.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <i class="fas fa-users" style="font-size: 48px; color: #ddd;"></i>
                    <h3 style="margin: 16px 0 8px;">No hay leads</h3>
                    <p style="color: var(--text-gray);">Haz clic en "Nuevo Lead" para agregar uno</p>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = leads.map(lead => `
        <div class="lead-card" data-id="${lead.id}">
            <div class="lead-info">
                <div class="lead-name">${lead.nombre}</div>
                <div class="lead-detail">
                    <span>${lead.telefono}</span>
                    <span>${obtenerTipoPropiedad(lead.interes)}</span>
                    <span class="lead-stage-badge stage-${lead.etapa}">${obtenerEtapaNombre(lead.etapa)}</span>
                </div>
            </div>
            <div class="lead-actions">
                <button onclick="abrirWhatsApp('${lead.telefono}')" class="btn-whatsapp" title="WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </button>
                <button onclick="editarLead(${lead.id})" class="btn-edit" title="Editar">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="eliminarLead(${lead.id})" class="btn-delete" title="Eliminar">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
    
    // Actualizar contador en pipeline
    actualizarContadoresLeads();
}

// ===== FILTROS =====
function setupLeadFilters() {
    const searchInput = document.getElementById('searchLead');
    const filterStage = document.getElementById('filterStage');
    const filterInteres = document.getElementById('filterInteres');
    
    function aplicarFiltros() {
        const etapa = filterStage ? filterStage.value : 'all';
        const busqueda = searchInput ? searchInput.value : '';
        renderLeads(etapa, busqueda);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }
    
    if (filterStage) {
        filterStage.addEventListener('change', aplicarFiltros);
    }
    
    if (filterInteres) {
        filterInteres.addEventListener('change', aplicarFiltros);
    }
}

// ===== FORMULARIO NUEVO LEAD =====
function setupLeadForm() {
    const form = document.getElementById('leadForm');
    const addBtn = document.getElementById('addLeadBtn');
    const closeBtn = document.getElementById('closeModal');
    const modal = document.getElementById('leadModal');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('leadForm').reset();
            document.querySelector('#leadModal h3').textContent = 'Nuevo Lead';
            document.getElementById('leadModal').dataset.editId = '';
            abrirModal('leadModal');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => cerrarModal('leadModal'));
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = this.dataset.editId ? parseInt(this.dataset.editId) : generarId();
            const editando = !!this.dataset.editId;
            
            const lead = {
                id: id,
                nombre: document.getElementById('leadNombre').value.trim(),
                telefono: document.getElementById('leadTelefono').value.trim(),
                email: document.getElementById('leadEmail').value.trim(),
                interes: document.getElementById('leadInteres').value,
                etapa: document.getElementById('leadStage').value,
                notas: document.getElementById('leadNotas').value.trim(),
                fecha: new Date().toISOString().split('T')[0]
            };
            
            if (editando) {
                const index = APP.datos.leads.findIndex(l => l.id === id);
                if (index !== -1) {
                    APP.datos.leads[index] = lead;
                }
            } else {
                APP.datos.leads.push(lead);
            }
            
            guardarDatos();
            renderLeads();
            cerrarModal('leadModal');
            form.reset();
            form.dataset.editId = '';
            
            // Mostrar notificación
            mostrarNotificacion(editando ? '✅ Lead actualizado' : '✅ Lead agregado');
        });
    }
}

// ===== EDITAR LEAD =====
function editarLead(id) {
    const lead = APP.datos.leads.find(l => l.id === id);
    if (!lead) return;
    
    const modal = document.getElementById('leadModal');
    const form = document.getElementById('leadForm');
    
    document.querySelector('#leadModal h3').textContent = 'Editar Lead';
    modal.dataset.editId = id;
    form.dataset.editId = id;
    
    document.getElementById('leadNombre').value = lead.nombre;
    document.getElementById('leadTelefono').value = lead.telefono;
    document.getElementById('leadEmail').value = lead.email || '';
    document.getElementById('leadInteres').value = lead.interes;
    document.getElementById('leadStage').value = lead.etapa;
    document.getElementById('leadNotas').value = lead.notas || '';
    
    abrirModal('leadModal');
}

// ===== ELIMINAR LEAD =====
function eliminarLead(id) {
    if (!confirm('¿Estás seguro de eliminar este lead?')) return;
    
    APP.datos.leads = APP.datos.leads.filter(l => l.id !== id);
    guardarDatos();
    renderLeads();
    mostrarNotificacion('🗑️ Lead eliminado');
}

// ===== CONTADORES PIPELINE =====
function actualizarContadoresLeads() {
    const etapas = ['nuevo', 'contacto', 'visita', 'negociacion', 'oferta', 'cierre', 'postventa'];
    const contadores = {};
    
    etapas.forEach(e => {
        contadores[e] = APP.datos.leads.filter(l => l.etapa === e).length;
    });
    
    // Actualizar en dashboard si existe
    Object.keys(contadores).forEach(key => {
        const el = document.getElementById(`stage${key.charAt(0).toUpperCase() + key.slice(1)}`);
        if (el) el.textContent = contadores[key];
    });
}

// ===== NOTIFICACIONES =====
function mostrarNotificacion(mensaje) {
    const notif = document.createElement('div');
    notif.style.cssText = `
        position: fixed;
        bottom: 80px;
        left: 50%;
        transform: translateX(-50%);
        background: #2c3e50;
        color: white;
        padding: 12px 24px;
        border-radius: 12px;
        font-weight: 500;
        z-index: 9999;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: slideUp 0.3s ease;
        max-width: 90%;
        text-align: center;
    `;
    notif.textContent = mensaje;
    document.body.appendChild(notif);
    
    setTimeout(() => {
        notif.style.animation = 'slideDown 0.3s ease';
        setTimeout(() => notif.remove(), 300);
    }, 3000);
}

// ===== EXPORTAR =====
window.editarLead = editarLead;
window.eliminarLead = eliminarLead;
window.renderLeads = renderLeads;