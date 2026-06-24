// ============================================
// APP.JS - Núcleo del CRM Inmobiliario
// ============================================

// ===== DATOS GLOBALES =====
const APP = {
    version: '1.0.0',
    nombre: 'Ober CRM',
    datos: {
        leads: [],
        propiedades: [],
        tareas: [],
        config: {
            nombre: 'Ober',
            email: 'oberpizarro@gmail.com',
            telefono: '+51 978300275',
            whatsappMensaje: 'Hola! Soy Ober, agente inmobiliario. ¿Cómo puedo ayudarte con tu búsqueda de propiedad?'
        }
    }
};

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', function() {
    console.log(`🚀 ${APP.nombre} v${APP.version} iniciado`);
    
    // Cargar datos desde localStorage
    cargarDatos();
    
    // Inicializar menú móvil
    initMenu();
    
    // Configurar fecha
    actualizarFecha();
    
    // Cerrar modal con click fuera
    cerrarModalClickFuera();
    
    // ===== NUEVO: Solicitar permisos de notificación =====
    setTimeout(solicitarPermisoNotificaciones, 1000);
});

// ===== LOCALSTORAGE =====
function cargarDatos() {
    try {
        const stored = localStorage.getItem('oberCRM');
        if (stored) {
            const parsed = JSON.parse(stored);
            APP.datos = parsed;
        } else {
            // Datos de ejemplo
            cargarDatosEjemplo();
        }
    } catch (e) {
        console.error('Error cargando datos:', e);
        cargarDatosEjemplo();
    }
}

function guardarDatos() {
    try {
        localStorage.setItem('oberCRM', JSON.stringify(APP.datos));
    } catch (e) {
        console.error('Error guardando datos:', e);
    }
}

function cargarDatosEjemplo() {
    APP.datos.leads = [
        {
            id: 1,
            nombre: 'María González',
            telefono: '+56 9 8765 4321',
            email: 'maria@email.com',
            interes: 'venta-casa',
            etapa: 'contacto',
            notas: 'Busca casa en Las Condes, presupuesto hasta $200M',
            fecha: '2026-06-20'
        },
        {
            id: 2,
            nombre: 'Juan Pérez',
            telefono: '+56 9 7123 4567',
            email: 'juan@email.com',
            interes: 'alquiler-depto',
            etapa: 'visita',
            notas: 'Necesita departamento amoblado para 2 personas',
            fecha: '2026-06-18'
        },
        {
            id: 3,
            nombre: 'Carlos Rodríguez',
            telefono: '+56 9 6345 7890',
            email: 'carlos@email.com',
            interes: 'terreno',
            etapa: 'negociacion',
            notas: 'Busca terreno para construcción en Lo Barnechea',
            fecha: '2026-06-15'
        }
    ];
    
    APP.datos.propiedades = [
        {
            id: 1,
            titulo: 'Casa en Las Condes',
            tipo: 'venta-casa',
            precio: 180000000,
            habitaciones: 4,
            banos: 3,
            metros: 200,
            ubicacion: 'Las Condes, Santiago',
            descripcion: 'Hermosa casa en exclusivo sector, con piscina y jardín.',
            estado: 'disponible',
            fecha: '2026-06-10'
        },
        {
            id: 2,
            titulo: 'Departamento Providencia',
            tipo: 'venta-depto',
            precio: 95000000,
            habitaciones: 2,
            banos: 1,
            metros: 65,
            ubicacion: 'Providencia, Santiago',
            descripcion: 'Departamento en pleno barrio Lastarria, cerca de todo.',
            estado: 'disponible',
            fecha: '2026-06-12'
        },
        {
            id: 3,
            titulo: 'Terreno en Lo Barnechea',
            tipo: 'terreno',
            precio: 45000000,
            habitaciones: 0,
            banos: 0,
            metros: 500,
            ubicacion: 'Lo Barnechea, Santiago',
            descripcion: 'Terreno con vista a la cordillera, ideal para construcción.',
            estado: 'disponible',
            fecha: '2026-06-14'
        }
    ];
    
    APP.datos.tareas = [
        {
            id: 1,
            titulo: 'Llamar a María González',
            descripcion: 'Confirmar visita a la propiedad',
            fecha: '2026-06-23',
            hora: '15:00',
            prioridad: 'alta',
            completada: false
        },
        {
            id: 2,
            titulo: 'Enviar cotización a Juan Pérez',
            descripcion: 'Incluir opciones de financiamiento',
            fecha: '2026-06-24',
            hora: '10:00',
            prioridad: 'media',
            completada: false
        }
    ];
    
    guardarDatos();
}

// ===== MENÚ MÓVIL =====
function initMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
    
    function toggleMenu() {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('active');
        document.body.style.overflow = sidebar.classList.contains('open') ? 'hidden' : '';
    }
    
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleMenu);
    }
    
    overlay.addEventListener('click', toggleMenu);
    
    // Cerrar menú al hacer click en un enlace
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                toggleMenu();
            }
        });
    });
}

// ===== FECHA =====
function actualizarFecha() {
    const dateDisplay = document.getElementById('dateDisplay');
    if (dateDisplay) {
        const now = new Date();
        const opciones = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateDisplay.textContent = now.toLocaleDateString('es-CL', opciones);
    }
}

// ===== MODALES =====
function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function cerrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function cerrarModalClickFuera() {
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            e.target.classList.remove('active');
            document.body.style.overflow = '';
        }
    });
}

// ===== WHATSAPP =====
function abrirWhatsApp(telefono, mensaje) {
    if (!telefono) {
        alert('⚠️ No hay número de teléfono registrado');
        return;
    }
    
    // Limpiar número: solo dígitos
    const numero = telefono.replace(/\D/g, '');
    
    // Si no tiene código de país, agregar +56 (Chile)
    let numeroCompleto = numero;
    if (numero.length <= 9) {
        numeroCompleto = '56' + numero;
    }
    
    const url = `https://wa.me/${numeroCompleto}?text=${encodeURIComponent(mensaje || 'Hola! Soy Ober, agente inmobiliario. ¿Cómo puedo ayudarte?')}`;
    
    window.open(url, '_blank');
}

// ===== UTILIDADES =====
function generarId() {
    return Date.now() + Math.floor(Math.random() * 1000);
}

function formatearPrecio(precio) {
    return '$' + Number(precio).toLocaleString('es-CL');
}

function obtenerEtapaNombre(etapa) {
    const etapas = {
        'nuevo': 'Nuevo',
        'contacto': 'Contacto',
        'visita': 'Visita',
        'negociacion': 'Negociación',
        'oferta': 'Oferta',
        'cierre': 'Cierre',
        'postventa': 'Post-venta'
    };
    return etapas[etapa] || etapa;
}

function obtenerTipoPropiedad(tipo) {
    const tipos = {
        'venta-casa': '🏠 Casa Venta',
        'venta-depto': '🏢 Depto Venta',
        'alquiler-casa': '🏠 Casa Alquiler',
        'alquiler-depto': '🏢 Depto Alquiler',
        'terreno': '🌳 Terreno',
        'local': '🏪 Local comercial',
        'proyecto': '🏗️ Proyecto nuevo'
    };
    return tipos[tipo] || tipo;
}

// ============================================
// NOTIFICACIONES MEJORADAS (TOAST)
// ============================================

// ===== NOTIFICACIONES EN PANTALLA =====
function mostrarNotificacion(mensaje, tipo = 'info', duracion = 4000) {
    // Eliminar notificaciones anteriores
    const notificacionesAnteriores = document.querySelectorAll('.custom-toast');
    notificacionesAnteriores.forEach(n => n.remove());
    
    // Crear contenedor si no existe
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.style.cssText = `
            position: fixed;
            top: 70px;
            right: 16px;
            z-index: 99999;
            display: flex;
            flex-direction: column;
            gap: 10px;
            max-width: 90%;
            pointer-events: none;
        `;
        document.body.appendChild(container);
    }
    
    // Definir colores según tipo
    const colores = {
        'success': '#27ae60',
        'error': '#e74c3c',
        'warning': '#f39c12',
        'info': '#2d6a9f'
    };
    
    const color = colores[tipo] || colores.info;
    
    // Crear notificación
    const toast = document.createElement('div');
    toast.className = 'custom-toast';
    toast.style.cssText = `
        background: white;
        color: #2c3e50;
        padding: 14px 20px;
        border-radius: 12px;
        box-shadow: 0 8px 30px rgba(0,0,0,0.2);
        border-left: 5px solid ${color};
        font-weight: 500;
        font-size: 14px;
        pointer-events: auto;
        animation: toastSlideIn 0.4s ease;
        max-width: 400px;
        display: flex;
        align-items: center;
        gap: 12px;
    `;
    
    // Ícono según tipo
    const iconos = {
        'success': '✅',
        'error': '❌',
        'warning': '⚠️',
        'info': 'ℹ️'
    };
    
    toast.innerHTML = `
        <span style="font-size:20px;">${iconos[tipo] || 'ℹ️'}</span>
        <span style="flex:1;">${mensaje}</span>
        <button onclick="this.parentElement.remove()" style="
            background:none;
            border:none;
            font-size:18px;
            cursor:pointer;
            color:#999;
            padding:0 4px;
        ">✕</button>
    `;
    
    container.appendChild(toast);
    
    // Auto-eliminar después de la duración
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'toastSlideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }
    }, duracion);
    
    // También mostrar en consola
    console.log(`📢 ${mensaje}`);
}

// ===== AGREGAR ESTILOS DE ANIMACIÓN =====
function agregarEstilosToast() {
    // Verificar si ya existen
    if (document.getElementById('toastStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'toastStyles';
    style.textContent = `
        @keyframes toastSlideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes toastSlideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// Llamar al iniciar
agregarEstilosToast();

// ===== SOLICITAR PERMISO DE NOTIFICACIONES =====
function solicitarPermisoNotificaciones() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    console.log('✅ Notificaciones permitidas');
                    mostrarNotificacion('🔔 Notificaciones activadas', 'success', 3000);
                } else {
                    console.log('❌ Notificaciones denegadas');
                    mostrarNotificacion('⚠️ Permiso de notificaciones denegado', 'warning', 3000);
                }
            });
        } else if (Notification.permission === 'granted') {
            console.log('✅ Notificaciones ya permitidas');
        } else {
            console.log('❌ Notificaciones denegadas previamente');
        }
    } else {
        console.log('❌ Este navegador no soporta notificaciones');
    }
}

// ===== EXPORTAR =====
window.APP = APP;
window.abrirWhatsApp = abrirWhatsApp;
window.abrirModal = abrirModal;
window.cerrarModal = cerrarModal;
window.guardarDatos = guardarDatos;
window.generarId = generarId;
window.formatearPrecio = formatearPrecio;
window.obtenerEtapaNombre = obtenerEtapaNombre;
window.obtenerTipoPropiedad = obtenerTipoPropiedad;
window.mostrarNotificacion = mostrarNotificacion;  // <--- NUEVO
window.solicitarPermisoNotificaciones = solicitarPermisoNotificaciones;  // <--- NUEVO