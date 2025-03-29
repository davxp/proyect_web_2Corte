document.addEventListener('DOMContentLoaded', () => {
    const registroForm = document.getElementById('registroUsuarioForm');
    const alertPlaceholder = document.getElementById('liveAlertPlaceholder');
    const submitBtn = registroForm.querySelector('button[type="submit"]');
    const submitText = submitBtn.querySelector('.submit-text');
    const spinner = submitBtn.querySelector('#spinner');

    // Función para validar email corregida (nombre cambiado a validarEmail para consistencia)
    const validarEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    // Mostrar alertas bootstrap
    const showAlert = (message, type) => {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = [
            `<div class="alert alert-${type} alert-dismissible fade show" role="alert">`,
            `   <div>${message}</div>`,
            '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
            '</div>'
        ].join('');

        alertPlaceholder.innerHTML = ''; // Limpiar alertas anteriores
        alertPlaceholder.append(wrapper);
        
        // Auto-eliminar después de 5 segundos
        setTimeout(() => {
            wrapper.querySelector('.alert').classList.remove('show');
            setTimeout(() => wrapper.remove(), 150);
        }, 5000);
    };

    // Validación del formulario
    registroForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        // Validación HTML5
        if (!registroForm.checkValidity()) {
            registroForm.classList.add('was-validated');
            return;
        }

        // Estado de carga
        submitBtn.disabled = true;
        submitText.textContent = 'Procesando...';
        spinner.classList.remove('d-none');

        try {
            // Obtener y limpiar valores
            const nombre = document.getElementById('nombre').value.trim();
            const correo = document.getElementById('correo').value.trim().toLowerCase();
            const contraseña = document.getElementById('contraseña').value;
            const rol = document.getElementById('rol').value;

            // Validación adicional del correo (usando validarEmail en lugar de isValidEmail)
            if (!validarEmail(correo)) {
                document.getElementById('correo').classList.add('is-invalid');
                throw new Error('Por favor ingrese un correo electrónico válido');
            }

            // Validación de rol
            if (!['usuario', 'admin'].includes(rol)) {
                document.getElementById('rol').classList.add('is-invalid');
                throw new Error('Rol de usuario no válido');
            }

            // Validación de contraseña
            if (contraseña.length < 6) {
                document.getElementById('contraseña').classList.add('is-invalid');
                throw new Error('La contraseña debe tener al menos 6 caracteres');
            }

            // Preparar datos para la API
            const formData = { nombre, correo, contraseña, rol };

            // Enviar a la API
            const response = await fetch('http://localhost:8000/api/agregarusuario', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.detail || 'Error en el servidor');
            }

            // Éxito - mostrar mensaje y resetear formulario
            showAlert('✅ Usuario registrado exitosamente!', 'success');
            registroForm.reset();
            registroForm.classList.remove('was-validated');
            
        } catch (error) {
            console.error('Error:', error);
            showAlert(`❌ ${error.message}`, 'danger');
        } finally {
            // Restaurar estado normal del botón
            submitBtn.disabled = false;
            submitText.textContent = 'Registrar usuario';
            spinner.classList.add('d-none');
        }
    });

    // Validación en tiempo real para campos
    registroForm.querySelectorAll('input, select').forEach(input => {
        input.addEventListener('input', () => {
            if (input.id === 'correo' && input.value) {
                // Usar validarEmail en lugar de isValidEmail
                input.classList.toggle('is-valid', validarEmail(input.value));
                input.classList.toggle('is-invalid', !validarEmail(input.value));
            } else {
                input.classList.toggle('is-valid', input.checkValidity());
                input.classList.toggle('is-invalid', !input.checkValidity());
            }
        });
    });

    // Validación inicial para campos requeridos
    registroForm.querySelectorAll('[required]').forEach(input => {
        input.addEventListener('blur', () => {
            input.classList.toggle('is-invalid', !input.checkValidity());
        });
    });
});