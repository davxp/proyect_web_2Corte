document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loadingIndicator = document.getElementById('loadingIndicator');
    const turnsTableBody = document.querySelector('#turnsTable tbody');
    
    // Verificar que los elementos existen
    if (!loadingIndicator || !turnsTableBody) {
        console.error('Error: Elementos esenciales no encontrados en el DOM');
        return;
    }

    async function loadTurns() {
        try {
            // Mostrar carga
            loadingIndicator.classList.remove('d-none');
            
            const response = await fetch('http://localhost:8000/api/turnos');
            
            if (!response.ok) {
                throw new Error(`Error ${response.status}: ${await response.text()}`);
            }
            
            const data = await response.json();
            turnsTableBody.innerHTML = '';
            
            if (data.resultado?.length > 0) {
                data.resultado.forEach(turno => {
                    const row = `
                        <tr>
                            <td class="text-center">${turno.id}</td>
                            <td>${turno.problema}</td>
                            <td class="text-center">${new Date(turno.fecha_solicitud).toLocaleString()}</td>
                            <td class="text-center">${turno.estado}</td>
                            <td class="text-center">
                                <button class="btn btn-primary btn-sm" disabled>Editar</button>
                                <button class="btn btn-secondary btn-sm" disabled>Copiar</button>
                                <button class="btn btn-danger btn-sm" disabled>Borrar</button>
                            </td>
                        </tr>
                    `;
                    turnsTableBody.innerHTML += row;
                });
            } else {
                turnsTableBody.innerHTML = '<tr><td colspan="5" class="text-center">No hay turnos registrados</td></tr>';
            }
        } catch (error) {
            console.error('Error al cargar turnos:', error);
            turnsTableBody.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center text-danger">
                        Error al cargar los datos: ${error.message}
                    </td>
                </tr>
            `;
        } finally {
            loadingIndicator.classList.add('d-none');
        }
    }

    // Iniciar la carga
    loadTurns();
});