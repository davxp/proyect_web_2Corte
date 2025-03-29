// Configuración
const API_BASE_URL = 'http://localhost:8000';

console.log("dash_user.js cargado correctamente");
console.log("Formulario encontrado:", document.getElementById('newTurnForm') !== null);
   
// Cargar datos del usuario y turnos
async function initializeDashboard() {
    // Verificar autenticación
    const userData = await getUserData();
    if (!userData) {
        window.location.href = '../html/login.html';
        return;
    }

    document.getElementById('userNameDisplay').textContent = userData.resultado.nombre;
    loadUserTurns(userData.resultado.id);
}

// Obtener datos del usuario logueado
async function getUserData() {
    try {
        const userId = localStorage.getItem('userId');
        if (!userId) return null;
        
        const response = await fetch(`${API_BASE_URL}/api/usuarios2/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) return null;
        
        return await response.json();
    } catch (error) {
        console.error('Error al obtener datos del usuario:', error);
        return null;
    }
}

// Cargar turnos del usuario
async function loadUserTurns(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/api/turnos/historial/usuarios?usuario_id=${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            }
        });
        
        if (!response.ok) throw new Error('Error al cargar turnos');
        
        const data = await response.json();
        
        // Inicializar DataTable
        $('#turnsTable').DataTable({
            data: data.resultado,
            columns: [
                { data: 'id' },
                { data: 'problema' },
                { 
                    data: 'fecha_solicitud',
                    render: function(data) {
                        return data ? new Date(data).toLocaleString() : '--';
                    }
                },
                { 
                    data: 'fecha_resolucion',
                    render: function(data) {
                        return data ? new Date(data).toLocaleString() : '--';
                    }
                },
                { 
                    data: 'estado',
                    render: function(data) {
                        const badgeClass = {
                            'pendiente': 'bg-warning',
                            'resuelto': 'bg-success',
                            'cancelado': 'bg-danger'
                        }[data] || 'bg-secondary';
                        
                        return `<span class="badge ${badgeClass}">${data}</span>`;
                    }
                },
                {
                    data: null,
                    render: function(data, type, row) {
                        if (row.estado === 'pendiente') {
                            return `
                                <div class="btn-group">
                                    <button class="btn btn-sm btn-outline-primary edit-turn" data-id="${row.id}">
                                        <i class="bi bi-pencil"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-danger cancel-turn" data-id="${row.id}">
                                        <i class="bi bi-x-circle"></i>
                                    </button>
                                </div>
                            `;
                        }
                        return '--';
                    }
                }
            ],
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.6/i18n/es-ES.json'
            }
        });
        
    } catch (error) {
        console.error('Error:', error);
        alert('Error al cargar los turnos: ' + error.message);
    }
}


// Manejar nuevo turno
// 2. Espera a que TODO esté listo
$(function() {
    console.log("Documento listo, buscando formulario...");
    
    // 3. Busca el formulario de manera segura
    const form = $('#newTurnForm')[0];
    
    if (!form) {
        console.error("❌ Error: No se encontró el formulario con ID 'newTurnForm'");
        alert("Error crítico: No se puede inicializar el formulario");
        return;
    }
    
    console.log("✔ Formulario encontrado, asignando evento...");
    
    // 4. Asigna el event listener
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        console.log("Evento submit capturado");
        
        // 5. Validación básica
        if (!form.checkValidity()) {
            console.log("Validación fallida");
            e.stopPropagation();
            form.classList.add('was-validated');
            return;
        }
        
        // 6. Manejo seguro del envío
        await handleFormSubmission();
    });
});

// 7. Función mejorada para manejar el envío
async function handleFormSubmission() {
    console.log("Iniciando envío del formulario...");
    
    // 8. Obtención segura de elementos
    const form = document.getElementById('newTurnForm');
    const submitBtn = document.getElementById('submitBtn');
    const turnDescription = document.getElementById('turnDescription');
    const turnDate = document.getElementById('turnDate');
    
    // 9. Verificación exhaustiva
    const elements = {form, submitBtn, turnDescription, turnDate};
    for (const [name, element] of Object.entries(elements)) {
        if (!element) {
            const errorMsg = `❌ Error crítico: No se encontró el elemento ${name}`;
            console.error(errorMsg);
            alert(errorMsg);
            return;
        }
    }
    
    try {
        // 10. Estado de carga
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Procesando...
        `;
        
        // 11. Obtener valores con validación
        const problem = turnDescription.value.trim();
        const date = turnDate.value;
        const userId = localStorage.getItem('userId');
        
        if (!userId) {
            throw new Error('No se encontró la sesión del usuario');
        }
        if (!problem) {
            throw new Error('La descripción del problema es requerida');
        }
        if (!date) {
            throw new Error('La fecha es requerida');
        }
        
        // 12. Preparar datos para la API
        const turnData = {
            usuario_id: parseInt(userId),
            problema: problem,
            fecha_solicitud: new Date(date).toISOString()
        };
        
        console.log("Enviando datos:", turnData);
        
        // 13. Llamada a la API
        const response = await fetch(`${API_BASE_URL}api/turnos/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            },
            body: JSON.stringify(turnData)
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en el servidor');
        }
        
        // 14. Éxito
        alert('✅ Turno solicitado exitosamente');
        form.reset();
        form.classList.remove('was-validated');
        
        // 15. Recargar tabla si existe
        if (typeof window.reloadTurnTable === 'function') {
            window.reloadTurnTable();
        }
        
    } catch (error) {
        console.error('Error en la solicitud:', error);
        alert(`❌ Error: ${error.message}`);
    } finally {
        // 16. Restaurar botón
        submitBtn.disabled = false;
        submitBtn.innerHTML = `<i class="bi bi-send me-2"></i> Solicitar Turno`;
    }
}



// Editar turno (actualizado)
$(document).on('click', '.edit-turn', async function() {
    const turnId = $(this).data('id');
    const newProblem = prompt('Ingrese la nueva descripción del problema:');
    
    if (newProblem && newProblem.trim() !== '') {
        try {
            const response = await fetch(`${API_BASE_URL}api/turnos/usuarios/${turnId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                },
                body: JSON.stringify({
                    problema: newProblem,
                    fecha_solicitud: new Date().toISOString()
                })
            });
            
            if (!response.ok) throw new Error('Error al actualizar turno');
            
            alert('Turno actualizado exitosamente');
            if (typeof $('#turnsTable').DataTable === 'function') {
                $('#turnsTable').DataTable().ajax.reload();
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar turno: ' + error.message);
        }
    }
});

// Cancelar turno (actualizado a PUT)
$(document).on('click', '.cancel-turn', async function() {
    const turnId = $(this).data('id');
    
    if (confirm('¿Está seguro que desea cancelar este turno?')) {
        try {
            const response = await fetch(`${API_BASE_URL}api/turnos/usuarios/${turnId}/cancelar`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('authToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Error al cancelar turno');
            
            alert('Turno cancelado exitosamente');
            if (typeof $('#turnsTable').DataTable === 'function') {
                $('#turnsTable').DataTable().ajax.reload();
            }
            
        } catch (error) {
            console.error('Error:', error);
            alert('Error al cancelar turno: ' + error.message);
        }
    }
});