// Configuración de la API 
const API_BASE_URL = 'http://localhost:8000'; 

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const togglePassword = document.getElementById('togglePassword');
    const errorAlert = document.getElementById('errorAlert');
    const loginBtn = document.getElementById('loginBtn');

    // Verificar si ya está autenticado
    if (localStorage.getItem('userToken')) {
        redirectByRole(localStorage.getItem('userRol'));
    }

    // Mostrar/ocultar contraseña
    togglePassword.addEventListener('click', togglePasswordVisibility);

    // Validación en tiempo real
    emailInput.addEventListener('input', validateEmail);
    passwordInput.addEventListener('input', validatePassword);

    // Envío del formulario
    loginForm.addEventListener('submit', handleLogin);
});

// Función para manejar el login
async function handleLogin(e) {
    e.preventDefault();
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    try {
        // Mostrar estado de carga
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = true;
        loginBtn.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Verificando...
        `;
        
        // Ocultar errores previos
        document.getElementById('errorAlert').classList.add('d-none');

        // Realizar petición
        const response = await fetch(`${API_BASE_URL}/api/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                correo: emailInput.value.trim(),
                contraseña: passwordInput.value.trim()
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || 'Error en la autenticación');
        }

        const data = await response.json();
        
        // Guardar datos de sesión
        localStorage.setItem('authToken', data.access_token);
        localStorage.setItem('userData', JSON.stringify(data.usuario));
        
        // Redirigir
        window.location.href = data.usuario.rol === 'admin' 
            ? '../html/admin/dashboard_admin.html' 
            : '../html/user/dashboard_user.html';

    } catch (error) {
        console.error('Error en el login:', error);
        const errorAlert = document.getElementById('errorAlert');
        
        if (error.message.includes('Failed to fetch')) {
            errorAlert.innerHTML = `
                <strong>Error de conexión:</strong> No se pudo contactar al servidor.
                <ul class="mt-2 mb-0">
                    <li>¿El servidor está corriendo? (Ver terminal)</li>
                    <li>¿La URL es correcta? (${API_BASE_URL})</li>
                    <li>¿Hay errores en la consola? (F12 > Console)</li>
                </ul>
            `;
        } else {
            errorAlert.textContent = error.message;
        }
        
        errorAlert.classList.remove('d-none');
    } finally {
        // Restaurar botón
        const loginBtn = document.getElementById('loginBtn');
        loginBtn.disabled = false;
        loginBtn.innerHTML = `Iniciar Sesión`;
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
});
// Función para guardar datos de sesión
function saveSessionData(authData) {
    localStorage.setItem('userToken', authData.access_token);
    localStorage.setItem('userId', authData.usuario.id);
    localStorage.setItem('userName', authData.usuario.nombre);
    localStorage.setItem('userEmail', authData.usuario.correo);
    localStorage.setItem('userRol', authData.usuario.rol);
    localStorage.setItem('userStatus', authData.usuario.estado);
}

// Función para redirigir según rol
function redirectByRole(role) {
    switch(role) {
        case 'admin':
            window.location.href = '../html/admin/dashboard_admin.html';
            break;
        case 'usuario':
            window.location.href = '../html/user/dashboard_user.html';
            break;
        default:
            window.location.href = '../html/login.html';
    }
}

// Función para mostrar/ocultar contraseña
function togglePasswordVisibility() {
    const passwordInput = document.getElementById('password');
    const icon = this.querySelector('i');
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
    
    passwordInput.setAttribute('type', type);
    icon.classList.toggle('bi-eye-fill');
    icon.classList.toggle('bi-eye-slash-fill');
}

// Función para validar email
function validateEmail() {
    const emailInput = document.getElementById('email');
    const email = emailInput.value.trim();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    
    emailInput.classList.toggle('is-invalid', !isValid);
    return isValid;
}

// Función para validar contraseña
function validatePassword() {
    const passwordInput = document.getElementById('password');
    const isValid = passwordInput.value.trim().length >= 4;
    
    passwordInput.classList.toggle('is-invalid', !isValid);
    return isValid;
}

// Función para mostrar/ocultar loading
function showLoading(show) {
    const loginBtn = document.getElementById('loginBtn');
    const loginText = document.getElementById('loginText');
    const loginSpinner = document.getElementById('loginSpinner');
    
    loginBtn.disabled = show;
    loginText.textContent = show ? "Autenticando..." : "Iniciar Sesión";
    loginSpinner.classList.toggle('d-none', !show);
}

// Función para mostrar errores
function showError(error) {
    const errorMessages = {
        'Failed to fetch': 'No se puede conectar al servidor. Verifica:',
        'NetworkError': 'Problema de red. ¿Estás conectado a internet?',
        'SyntaxError': 'Respuesta inválida del servidor'
    };
    
    const message = errorMessages[error.name] || 
                   error.message || 
                   'Error desconocido';
    
    const errorAlert = document.getElementById('errorAlert');
    errorAlert.innerHTML = `
        <strong>Error:</strong> ${message}
        <ul class="mb-0 mt-2">
            <li>¿El servidor está corriendo?</li>
            <li>¿La URL es correcta? (${API_BASE_URL})</li>
            <li>¿Hay errores en la consola? (F12)</li>
        </ul>
    `;
    errorAlert.classList.remove('d-none');
}

// Función para cerrar sesión (usar en otras páginas)
function logout() {
    localStorage.removeItem('userToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userRol');
    localStorage.removeItem('userStatus');
    window.location.href = 'login.html';
}