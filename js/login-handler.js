/**
 * LOGIN HANDLER - VERSION ULTRA AGRESIVA
 * Esta versión captura el submit de TODAS las formas posibles
 */

console.log('🚀 LOGIN HANDLER: Script cargando...');

// Función principal de inicialización
function initLoginHandler() {
    console.log('🔍 LOGIN: Buscando formulario...');
    
    // Buscar el formulario de múltiples formas
    const form1 = document.querySelector('main form');
    const form2 = document.querySelector('form');
    const form3 = document.getElementById('loginForm');
    
    const loginForm = form1 || form2 || form3;
    
    if (!loginForm) {
        console.error('❌ LOGIN: NO se encontró ningún formulario');
        console.log('🔍 Formularios en página:', document.querySelectorAll('form').length);
        return;
    }
    
    console.log('✅ LOGIN: Formulario encontrado!', loginForm);
    
    // Variable para evitar múltiples submissions
    let isSubmitting = false;
    
    // MÉTODO 1: onsubmit directo (más alta prioridad)
    loginForm.onsubmit = async function(e) {
        console.log('🔥🔥🔥 [MÉTODO 1] ¡¡¡SUBMIT CAPTURADO VIA ONSUBMIT!!!');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        if (isSubmitting) {
            console.log('⚠️ Ya se está procesando un login, ignorando...');
            return false;
        }
        
        isSubmitting = true;
        await handleLogin(this);
        isSubmitting = false;
        return false;
    };
    console.log('✅ onsubmit configurado');
    
    // MÉTODO 2: Backup con addEventListener (pero verificar flag)
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        if (isSubmitting) {
            console.log('⚠️ [MÉTODO 2] Ya en proceso, ignorando...');
            return false;
        }
        
        console.log('🔥 [MÉTODO 2] SUBMIT por addEventListener');
        isSubmitting = true;
        await handleLogin(this);
        isSubmitting = false;
        return false;
    }, true);
    console.log('✅ addEventListener configurado');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            console.log('🔥🔥🔥 [MÉTODO 3] ¡¡¡CLICK EN BOTÓN SUBMIT!!!');
            e.preventDefault();
            e.stopPropagation();
            handleLogin(loginForm);
            return false;
        }, true);
        console.log('✅ Click en botón configurado');
    }
    
    // MÉTODO 4: Interceptar Enter en los inputs
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                console.log('🔥🔥🔥 [MÉTODO 4] ¡¡¡ENTER PRESIONADO!!!');
                e.preventDefault();
                handleLogin(loginForm);
                return false;
            }
        });
    });
    console.log('✅ Enter en inputs configurado');
    
    // Toggle de contraseña
    setupPasswordToggle();
}

// Función para mostrar/ocultar contraseña
function setupPasswordToggle() {
    const togglePassword = document.getElementById('togglePassword');
    if (!togglePassword) {
        console.log('⚠️ Toggle password no encontrado');
        return;
    }
    
    togglePassword.style.cursor = 'pointer';
    togglePassword.addEventListener('click', function(e) {
        e.preventDefault();
        const passwordInput = document.getElementById('password');
        const icon = this.querySelector('i');
        
        if (passwordInput) {
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    });
    console.log('✅ Toggle password configurado');
}

// Función principal de manejo de login
async function handleLogin(form) {
    console.log('🎯 handleLogin: Iniciando proceso...');
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (!usernameInput || !passwordInput) {
        console.error('❌ No se encontraron los campos de entrada');
        alert('Error: No se encontraron los campos del formulario');
        return;
    }
    
    const identifier = usernameInput.value.trim();
    const password = passwordInput.value;
    
    console.log('📝 Datos capturados:');
    console.log('   - Identifier:', identifier);
    console.log('   - Password:', password ? '✓ (presente)' : '✗ (vacío)');
    
    // Validaciones básicas
    if (!identifier) {
        alert('Por favor ingrese su email o nombre de usuario');
        usernameInput.focus();
        return;
    }
    
    if (!password) {
        alert('Por favor ingrese su contraseña');
        passwordInput.focus();
        return;
    }
    
    // Obtener botón submit
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton ? submitButton.innerHTML : '';
    
    // Deshabilitar botón y mostrar loading
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando sesión...';
    }
    
    try {
        console.log('🌐 Enviando petición a API...');
        
        const response = await fetch('./api/login.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                identifier: identifier,
                password: password
            })
        });
        
        console.log('📥 Respuesta recibida - Status:', response.status);
        
        const responseText = await response.text();
        console.log('📄 Respuesta (primeros 500 chars):', responseText.substring(0, 500));
        
        // Intentar parsear como JSON
        let result;
        try {
            result = JSON.parse(responseText);
            console.log('✅ JSON parseado correctamente:', result);
        } catch (parseError) {
            console.error('❌ Error parseando JSON:', parseError);
            console.error('📄 Respuesta completa:', responseText);
            throw new Error('Respuesta inválida del servidor');
        }
        
        if (result.success) {
            console.log('✅ Login exitoso!');
            const firstName = result.user.nombre_completo.split(' ')[0];
            alert(`¡Bienvenido ${firstName}!`);
            
            // Redirigir según tipo de usuario
            if (result.user.is_admin) {
                console.log('👑 Usuario administrador - Redirigiendo a administrar.html');
                window.location.href = 'administrar.html';
            } else {
                console.log('👤 Usuario normal - Redirigiendo a index.html');
                window.location.href = 'index.html';
            }
        } else {
            console.log('❌ Login fallido:', result.message);
            alert('Error: ' + result.message);
        }
        
    } catch (error) {
        console.error('❌ Error en el proceso:', error);
        alert('Error de conexión: ' + error.message);
    } finally {
        // Restaurar botón
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerHTML = originalText;
        }
    }
}

// EJECUTAR en múltiples momentos para asegurar que se cargue
console.log('📍 Estado del documento:', document.readyState);

if (document.readyState === 'loading') {
    console.log('⏳ Esperando DOMContentLoaded...');
    document.addEventListener('DOMContentLoaded', () => {
        console.log('✅ DOMContentLoaded disparado');
        initLoginHandler();
    });
} else {
    console.log('✅ DOM ya está listo, ejecutando inmediatamente');
    initLoginHandler();
}

// Backup: ejecutar también en window.load
window.addEventListener('load', () => {
    console.log('✅ Window load disparado');
    // Solo reiniciar si no se configuró antes
    const form = document.querySelector('form');
    if (form && !form.onsubmit) {
        console.log('⚠️ Form sin onsubmit, reinicializando...');
        initLoginHandler();
    }
});

console.log('✅ LOGIN HANDLER: Script completamente cargado');