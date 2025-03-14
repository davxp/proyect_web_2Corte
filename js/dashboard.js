function editarTurno(id) {
    alert(`Editando turno con ID: ${id}`);
    // Lógica para editar el turno
}

function cancelarTurno(id) {
    if (confirm("¿Estás seguro de cancelar este turno?")) {
        alert(`Turno con ID: ${id} cancelado`);
        // Lógica para cancelar el turno
    }
}
