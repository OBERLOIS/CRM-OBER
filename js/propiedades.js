// ============================================
// PROPIEDADES.JS - Gestión de Propiedades
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    renderPropiedades();
    setupPropiedadFilters();
    setupPropiedadForm();
    setupPropertyTabs();
});

// ===== RENDER PROPIEDADES =====
function renderPropiedades(tipo = 'all', busqueda = '', estado = 'all') {
    const grid = document.getElementById('propertiesGrid');
    if (!grid) return;
    
    let props = APP.datos.propiedades;
    
    // Filtro por tipo
    if (tipo !== 'all') {
        props = props.filter(p => p.tipo === tipo);
    }
    
    // Filtro por estado
    if (estado !== 'all') {
        props = props.filter(p => p.estado === estado);
    }
    
    // Búsqueda
    if (busqueda) {
        const q = busqueda.toLowerCase();
        props = props.filter(p => 
            p.titulo.toLowerCase().includes(q) ||
            p.ubicacion.toLowerCase().includes(q) ||
            p.descripcion.toLowerCase().includes(q)
        );
    }
    
    if (props.length === 0) {
        grid.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <i class="fas fa-home" style="font-size: 48px; color: #ddd;"></i>
                    <h3 style="margin: 16px 0 8px;">No hay propiedades</h3>
                    <p style="color: var(--text-gray);">Haz clic en "Nueva Propiedad" para agregar una</p>
                </div>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = props.map(prop => `
        <div class="property-card">
            <div class="property-image">
                <i class="fas fa-${getIconoTipo(prop.tipo)}"></i>
                <span class="property-badge">${prop.estado.toUpperCase()}</span>
            </div>
            <div class="property-body">
                <div class="property-title">${prop.titulo}</div>
                <div class="property-location"><i class="fas fa-map-marker-alt"></i> ${prop.ubicacion}</div>
                <div class="property-features">
                    ${prop.habitaciones > 0 ? `<span><i class="fas fa-bed"></i> ${prop.habitaciones}</span>` : ''}
                    ${prop.banos > 0 ? `<span><i class="fas fa-bath"></i> ${prop.banos}</span>` : ''}
                    ${prop.metros > 0 ? `<span><i class="fas fa-ruler-combined"></i> ${prop.metros}m²</span>` : ''}
                </div>
                <div class="flex-between">
                    <span class="property-price">${formatearPrecio(prop.precio)}</span>
                    <div style="display: flex; gap: 8px;">
                        <button onclick="editarPropiedad(${prop.id})" class="btn-edit" style="background: none; border: none; font-size: 18px; cursor: pointer;">
                            <i class="fas fa-edit" style="color: var(--primary);"></i>
                        </button>
                        <button onclick="eliminarPropiedad(${prop.id})" class="btn-delete" style="background: none; border: none; font-size: 18px; cursor: pointer;">
                            <i class="fas fa-trash" style="color: var(--danger);"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getIconoTipo(tipo) {
    const icons = {
        'venta-casa': 'house',
        'venta-depto': 'building',
        'alquiler-casa': 'house',
        'alquiler-depto': 'building',
        'terreno': 'mountain',
        'local': 'store',
        'proyecto': 'hard-hat'
    };
    return icons[tipo] || 'home';
}

// ===== TABS =====
function setupPropertyTabs() {
    const tabs = document.querySelectorAll('.tab-btn');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            tabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            
            const tipo = this.dataset.tipo;
            const busqueda = document.getElementById('searchPropiedad')?.value || '';
            const estado = document.getElementById('filterEstado')?.value || 'all';
            
            renderPropiedades(tipo, busqueda, estado);
        });
    });
}

// ===== FILTROS =====
function setupPropiedadFilters() {
    const searchInput = document.getElementById('searchPropiedad');
    const filterEstado = document.getElementById('filterEstado');
    
    function aplicarFiltros() {
        const tipo = document.querySelector('.tab-btn.active')?.dataset.tipo || 'all';
        const busqueda = searchInput ? searchInput.value : '';
        const estado = filterEstado ? filterEstado.value : 'all';
        renderPropiedades(tipo, busqueda, estado);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', aplicarFiltros);
    }
    
    if (filterEstado) {
        filterEstado.addEventListener('change', aplicarFiltros);
    }
}

// ===== FORMULARIO NUEVA PROPIEDAD =====
function setupPropiedadForm() {
    const form = document.getElementById('propiedadForm');
    const addBtn = document.getElementById('addPropiedadBtn');
    const closeBtn = document.getElementById('closeModal');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('propiedadForm').reset();
            document.querySelector('#propiedadModal h3').textContent = 'Nueva Propiedad';
            document.getElementById('propiedadModal').dataset.editId = '';
            abrirModal('propiedadModal');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => cerrarModal('propiedadModal'));
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = this.dataset.editId ? parseInt(this.dataset.editId) : generarId();
            const editando = !!this.dataset.editId;
            
            const propiedad = {
                id: id,
                titulo: document.getElementById('propTitulo').value.trim(),
                tipo: document.getElementById('propTipo').value,
                precio: parseFloat(document.getElementById('propPrecio').value) || 0,
                habitaciones: parseInt(document.getElementById('propHabitaciones').value) || 0,
                banos: parseInt(document.getElementById('propBanos').value) || 0,
                metros: parseInt(document.getElementById('propMetros').value) || 0,
                ubicacion: document.getElementById('propUbicacion').value.trim(),
                descripcion: document.getElementById('propDescripcion').value.trim(),
                estado: document.getElementById('propEstado').value,
                fecha: new Date().toISOString().split('T')[0]
            };
            
            if (editando) {
                const index = APP.datos.propiedades.findIndex(p => p.id === id);
                if (index !== -1) {
                    APP.datos.propiedades[index] = propiedad;
                }
            } else {
                APP.datos.propiedades.push(propiedad);
            }
            
            guardarDatos();
            renderPropiedades();
            cerrarModal('propiedadModal');
            form.reset();
            form.dataset.editId = '';
            
            mostrarNotificacion(editando ? '✅ Propiedad actualizada' : '✅ Propiedad agregada');
        });
    }
}

// ===== EDITAR PROPIEDAD =====
function editarPropiedad(id) {
    const prop = APP.datos.propiedades.find(p => p.id === id);
    if (!prop) return;
    
    const modal = document.getElementById('propiedadModal');
    const form = document.getElementById('propiedadForm');
    
    document.querySelector('#propiedadModal h3').textContent = 'Editar Propiedad';
    modal.dataset.editId = id;
    form.dataset.editId = id;
    
    document.getElementById('propTitulo').value = prop.titulo;
    document.getElementById('propTipo').value = prop.tipo;
    document.getElementById('propPrecio').value = prop.precio;
    document.getElementById('propHabitaciones').value = prop.habitaciones || '';
    document.getElementById('propBanos').value = prop.banos || '';
    document.getElementById('propMetros').value = prop.metros || '';
    document.getElementById('propUbicacion').value = prop.ubicacion;
    document.getElementById('propDescripcion').value = prop.descripcion || '';
    document.getElementById('propEstado').value = prop.estado;
    
    abrirModal('propiedadModal');
}

// ===== ELIMINAR PROPIEDAD =====
function eliminarPropiedad(id) {
    if (!confirm('¿Estás seguro de eliminar esta propiedad?')) return;
    
    APP.datos.propiedades = APP.datos.propiedades.filter(p => p.id !== id);
    guardarDatos();
    renderPropiedades();
    mostrarNotificacion('🗑️ Propiedad eliminada');
}

// ===== EXPORTAR =====
window.editarPropiedad = editarPropiedad;
window.eliminarPropiedad = eliminarPropiedad;
window.renderPropiedades = renderPropiedades;