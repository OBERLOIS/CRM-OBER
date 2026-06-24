// ============================================
// TAREAS.JS - Gestión de Tareas
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    renderTareas();
    setupTaskFilters();
    setupTaskForm();
});

// ===== RENDER TAREAS =====
function renderTareas(filtro = 'all') {
    const list = document.getElementById('tasksList');
    if (!list) return;
    
    let tareas = APP.datos.tareas;
    
    // Ordenar: primero no completadas, luego por fecha
    tareas.sort((a, b) => {
        if (a.completada !== b.completada) return a.completada ? 1 : -1;
        return new Date(a.fecha) - new Date(b.fecha);
    });
    
    // Filtros
    if (filtro === 'pendiente') {
        tareas = tareas.filter(t => !t.completada);
    } else if (filtro === 'completada') {
        tareas = tareas.filter(t => t.completada);
    } else if (filtro === 'hoy') {
        const hoy = new Date().toISOString().split('T')[0];
        tareas = tareas.filter(t => t.fecha === hoy);
    } else if (filtro === 'semana') {
        const hoy = new Date();
        const finSemana = new Date(hoy);
        finSemana.setDate(hoy.getDate() + 7);
        tareas = tareas.filter(t => {
            const fecha = new Date(t.fecha);
            return fecha >= hoy && fecha <= finSemana;
        });
    }
    
    if (tareas.length === 0) {
        list.innerHTML = `
            <div class="card">
                <div class="card-body text-center" style="padding: 40px;">
                    <i class="fas fa-check-circle" style="font-size: 48px; color: #ddd;"></i>
                    <h3 style="margin: 16px 0 8px;">¡Todas las tareas completadas!</h3>
                    <p style="color: var(--text-gray);">Buen trabajo! 🎉</p>
                </div>
            </div>
        `;
        return;
    }
    
    list.innerHTML = tareas.map(tarea => `
        <div class="task-item" data-id="${tarea.id}">
            <input type="checkbox" class="task-check" ${tarea.completada ? 'checked' : ''} 
                   onchange="toggleTarea(${tarea.id})">
            <span class="task-text ${tarea.completada ? 'completed' : ''}">${tarea.titulo}</span>
            <span class="task-date">
                ${tarea.fecha} ${tarea.hora ? tarea.hora : ''}
                ${tarea.prioridad === 'alta' ? '🔴' : tarea.prioridad === 'media' ? '🟡' : '🟢'}
            </span>
            <button onclick="eliminarTarea(${tarea.id})" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:16px;">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `).join('');
}

// ===== FILTROS =====
function setupTaskFilters() {
    const filter = document.getElementById('taskFilter');
    if (filter) {
        filter.addEventListener('change', function() {
            renderTareas(this.value);
        });
    }
}

// ===== FORMULARIO NUEVA TAREA =====
function setupTaskForm() {
    const form = document.getElementById('taskForm');
    const addBtn = document.getElementById('addTaskBtn');
    const closeBtn = document.getElementById('closeTaskModal');
    
    // Fecha por defecto: hoy
    const fechaInput = document.getElementById('taskDate');
    if (fechaInput) {
        fechaInput.value = new Date().toISOString().split('T')[0];
    }
    
    if (addBtn) {
        addBtn.addEventListener('click', () => {
            document.getElementById('taskForm').reset();
            if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];
            document.querySelector('#taskModal h3').textContent = 'Nueva Tarea';
            document.getElementById('taskModal').dataset.editId = '';
            abrirModal('taskModal');
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', () => cerrarModal('taskModal'));
    }
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const id = this.dataset.editId ? parseInt(this.dataset.editId) : generarId();
            const editando = !!this.dataset.editId;
            
            const tarea = {
                id: id,
                titulo: document.getElementById('taskTitle').value.trim(),
                descripcion: document.getElementById('taskDesc').value.trim(),
                fecha: document.getElementById('taskDate').value,
                hora: document.getElementById('taskTime').value || '',
                prioridad: document.getElementById('taskPriority').value,
                completada: false
            };
            
            if (editando) {
                const index = APP.datos.tareas.findIndex(t => t.id === id);
                if (index !== -1) {
                    // Mantener estado de completada
                    tarea.completada = APP.datos.tareas[index].completada;
                    APP.datos.tareas[index] = tarea;
                }
            } else {
                APP.datos.tareas.push(tarea);
            }
            
            guardarDatos();
            renderTareas();
            cerrarModal('taskModal');
            form.reset();
            form.dataset.editId = '';
            if (fechaInput) fechaInput.value = new Date().toISOString().split('T')[0];
            
            mostrarNotificacion(editando ? '✅ Tarea actualizada' : '✅ Tarea agregada');
            
            // Programar recordatorio si tiene hora
            if (tarea.hora) {
                programarRecordatorio(tarea);
            }
        });
    }
}

// ===== TOGGLE TAREA =====
function toggleTarea(id) {
    const tarea = APP.datos.tareas.find(t => t.id === id);
    if (tarea) {
        tarea.completada = !tarea.completada;
        guardarDatos();
        renderTareas();
        
        if (tarea.completada) {
            mostrarNotificacion(`✅ "${tarea.titulo}" completada`);
        }
    }
}

// ===== ELIMINAR TAREA =====
function eliminarTarea(id) {
    if (!confirm('¿Eliminar esta tarea?')) return;
    
    APP.datos.tareas = APP.datos.tareas.filter(t => t.id !== id);
    guardarDatos();
    renderTareas();
    mostrarNotificacion('🗑️ Tarea eliminada');
}

// ===== PROGRAMAR RECORDATORIO =====
function programarRecordatorio(tarea) {
    // Verificar si la tarea es para hoy
    const hoy = new Date().toISOString().split('T')[0];
    if (tarea.fecha !== hoy) return;
    
    // Verificar si tiene hora
    if (!tarea.hora) return;
    
    // Calcular tiempo hasta la hora programada
    const [horas, minutos] = tarea.hora.split(':').map(Number);
    const ahora = new Date();
    const horaTarea = new Date();
    horaTarea.setHours(horas, minutos, 0, 0);
    
    const diferencia = horaTarea - ahora;
    
    // Si es en el futuro (máximo 12 horas)
    if (diferencia > 0 && diferencia < 43200000) {
        setTimeout(() => {
            // Verificar si la tarea sigue pendiente
            const tareaActual = APP.datos.tareas.find(t => t.id === tarea.id);
            if (tareaActual && !tareaActual.completada) {
                
                // ====== CAMBIO 1: NOTIFICACIÓN MEJORADA ======
                mostrarNotificacion(`⏰ RECORDATORIO: "${tarea.titulo}" a las ${tarea.hora}`, 'success', 7000);
                
                // ====== CAMBIO 2: NOTIFICACIÓN CON MÁS OPCIONES ======
                if ('Notification' in window && Notification.permission === 'granted') {
                    const notificacion = new Notification('🏠 Ober CRM - Recordatorio', {
                        body: `${tarea.titulo} a las ${tarea.hora}`,
                        icon: 'img/icon-512.png',
                        tag: `tarea-${tarea.id}`,
                        requireInteraction: true,  // 🔴 NO SE CIERRA AUTOMÁTICAMENTE
                        vibrate: [200, 100, 200, 100, 200],  // 📳 VIBRACIÓN
                        silent: false  // 🔊 CON SONIDO
                    });
                    
                    // ====== CAMBIO 3: AL HACER CLICK EN NOTIFICACIÓN ======
                    notificacion.onclick = function() {
                        window.focus();  // Trae la app al frente
                        this.close();    // Cierra la notificación
                    };
                }
                
                // ====== CAMBIO 4: SONIDO DE ALERTA ======
                try {
                    const audio = new Audio('data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoAAACBhYqOhIWBhYaHh4aHiYmJh4eJiYqJh4eKi4uKh4eLjI6Lh4eNkZCOiIqNkpaTjoyOk5iZlo6Qk5qcnpCQlJ2foZOVl56io5iXnKGmpZmXn6OorKCanqWpq62am6Oorq+cnKOpra+wnaCmq7GztKGnrLK1tqOosLO3uKSqsba6u6Wrs7e8vaass7e9v7+ttLm/wcGvt7vCxMOyuLzFxsezu8DGycu0usLJzM61usPKz9DVu8TM0dPXvcTO0tfa');
                    audio.play().catch(function(error) {
                        // Si no puede reproducir, ignora el error
                        console.log('🔇 Sonido no disponible');
                    });
                } catch(e) {
                    console.log('🔇 Error con sonido');
                }
                
                // ====== CAMBIO 5: LOG EN CONSOLA ======
                console.log(`🔔 Recordatorio ejecutado: "${tarea.titulo}" a las ${tarea.hora}`);
            }
        }, diferencia);
        
        // ====== CAMBIO 6: LOG DE PROGRAMACIÓN ======
        console.log(`⏰ Recordatorio programado para "${tarea.titulo}" a las ${tarea.hora} (en ${Math.round(diferencia/60000)} minutos)`);
    }
}
// ===== SOLICITAR PERMISO DE NOTIFICACIONES AL INICIAR =====
function solicitarPermisoNotificaciones() {
    if ('Notification' in window) {
        if (Notification.permission === 'default') {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    console.log('✅ Notificaciones permitidas');
                    mostrarNotificacion('🔔 Notificaciones activadas');
                } else {
                    console.log('❌ Notificaciones denegadas');
                }
            });
        } else if (Notification.permission === 'granted') {
            console.log('✅ Notificaciones ya permitidas');
        }
    } else {
        console.log('❌ Este navegador no soporta notificaciones');
    }
}

// Llamar al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    // ... código existente ...
    solicitarPermisoNotificaciones();
});

// ===== SOLICITAR PERMISO NOTIFICACIONES =====
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// ===== EXPORTAR =====
window.toggleTarea = toggleTarea;
window.eliminarTarea = eliminarTarea;
window.renderTareas = renderTareas;