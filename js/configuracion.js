// ============================================
// CONFIGURACION.JS - Configuración del CRM
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    cargarConfiguracion();
    setupConfigForm();
});

// ===== CARGAR CONFIGURACIÓN =====
function cargarConfiguracion() {
    const config = APP.datos.config;
    
    document.getElementById('configNombre').value = config.nombre || '';
    document.getElementById('configEmail').value = config.email || '';
    document.getElementById('configTelefono').value = config.telefono || '';
    document.getElementById('whatsappMensaje').value = config.whatsappMensaje || '';
}

// ===== FORMULARIO CONFIGURACIÓN =====
function setupConfigForm() {
    const form = document.getElementById('profileForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            APP.datos.config.nombre = document.getElementById('configNombre').value.trim();
            APP.datos.config.email = document.getElementById('configEmail').value.trim();
            APP.datos.config.telefono = document.getElementById('configTelefono').value.trim();
            APP.datos.config.whatsappMensaje = document.getElementById('whatsappMensaje').value.trim();
            
            guardarDatos();
            mostrarNotificacion('✅ Configuración guardada');
        });
    }
}

// ===== PROBAR WHATSAPP =====
function testWhatsApp() {
    const telefono = APP.datos.config.telefono || '+56 9 1234 5678';
    const mensaje = APP.datos.config.whatsappMensaje || 'Hola! Soy Ober, agente inmobiliario. ¿Cómo puedo ayudarte?';
    abrirWhatsApp(telefono, mensaje);
}

// ===== EXPORTAR DATOS =====
function exportarDatos() {
    const datos = JSON.stringify(APP.datos, null, 2);
    const blob = new Blob([datos], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oberCRM_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    mostrarNotificacion('📥 Datos exportados');
}

// ===== BORRAR DATOS =====
function borrarDatos() {
    if (!confirm('⚠️ ¿Estás SEGURO de borrar TODOS los datos? Esta acción no se puede deshacer.')) return;
    if (!confirm('¿REALMENTE quieres borrar todo?')) return;
    
    APP.datos.leads = [];
    APP.datos.propiedades = [];
    APP.datos.tareas = [];
    guardarDatos();
    
    // Recargar página para actualizar todo
    location.reload();
}

// ===== EXPORTAR =====
window.testWhatsApp = testWhatsApp;
window.exportarDatos = exportarDatos;
window.borrarDatos = borrarDatos;