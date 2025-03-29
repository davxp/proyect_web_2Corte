async function cargarUsuarios() {
    try {
        // Paso 1: Hacer la petición
        const response = await fetch('http://localhost:8000/api/usuarios'); // Asegúrate de usar la URL correcta
        
        // Paso 2: Verificar si la respuesta es OK
        if (!response.ok) {
            throw new Error(`Error ${response.status}: ${await response.text()}`);
        }
        
        // Paso 3: Obtener los datos
        const data = await response.json();
        
        // Paso 4: Mostrar los datos en consola para verificar
        console.log("Datos recibidos del servidor:", data);
        
        // Paso 5: Mostrar en la tabla
        const tabla = document.getElementById('cuerpoTabla');
        tabla.innerHTML = ''; // Limpiar tabla
        
        data.resultado.forEach(user => {
            const row = `
                <tr>
                    <td>${user.id}</td>
                    <td>${user.nombre}</td>
                    <td>${user.correo}</td>
                    <td>${user.rol}</td>
                    <td>${user.estado}</td>
                    <td>
                        <button class="btn btn-warning btn-sm">Editar</button>
                        <button class="btn btn-danger btn-sm">Eliminar</button>
                    </td>
                </tr>
            `;
            tabla.innerHTML += row;
        });
        
    } catch (error) {
        console.error("Error al cargar usuarios:", error);
        alert("Error al cargar usuarios. Ver consola para detalles.");
    }
}

// Llamar a la función cuando la página cargue
window.onload = cargarUsuarios;

