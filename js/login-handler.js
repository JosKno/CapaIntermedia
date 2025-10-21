/**
 * Manejo del formulario de login
 * Versión agresiva para capturar el submit
 */

(function() {
    'use strict';
    
    console.log('🔐 [LOGIN] Script cargando...');
    
    function initLogin() {
        console.log('📋 [LOGIN] Inicializando...');
        
        // Esperar un poco para asegurar que el DOM está listo
        setTimeout(() => {
            console.log('⏰ [LOGIN] Buscando formulario...');
            
            const loginForm = document.querySelector('form');
            
            if (!loginForm) {
                console.error('❌ [LOGIN] Formulario NO encontrado');
                return;
            }
            
            console.log('✅ [LOGIN] Formulario encontrado:', loginForm);
            
            // Remover TODOS los event listeners existentes clonando
            const newForm = loginForm.cloneNode(true);
            loginForm.parentNode.replaceChild(newForm, loginForm);
            
            console.log('🔄 [LOGIN] Formulario clonado');
            
            // Trabajar con el nuevo formulario
            const form = document.querySelector('form');
            
            // Actualizar placeholder
            const usernameInput = document.getElementById('username');
            if (usernameInput) {
                usernameInput.placeholder = 'Email o primer nombre';
            }
            
            // Toggle de contraseña
            setupPasswordToggle();
            
            // CAPTURAR SUBMIT - Máxima prioridad
            form.onsubmit = async function(event) {
                console.log('🔥🔥🔥 [LOGIN] ¡¡¡SUBMIT CAPTURADO!!!');
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                
                await handleLogin(this);
                return false;
            };
            
            // Backup con addEventListener
            form.addEventListener('submit', async function(e) {
                console.log('🔥 [LOGIN] Submit por addEventListener');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                
                await handleLogin(this);
                return false;
            }, true); // Use capture
            
            console.log('✅ [LOGIN] Listeners configurados');
            
        }, 100);
    }
    
    function setupPasswordToggle() {
        const togglePassword = document.getElementById('togglePassword');
        if (!togglePassword) return;
        
        togglePassword.style.cursor = 'pointer';
        
        const newToggle = togglePassword.cloneNode(true);
        togglePassword.parentNode.replaceChild(newToggle, togglePassword);
        
        newToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const passwordInput = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordInput.type === 'password') {
                passwordInput.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordInput.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
    
    async function handleLogin(form) {
        console.log('🎯 [LOGIN] Procesando login...');
        
        const identifier = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        console.log('📝 [LOGIN] Datos:', {
            identifier: identifier,
            password: password ? '***' : '(vacío)'
        });
        
        if (!identifier || !password) {
            console.log('❌ [LOGIN] Campos vacíos');
            alert('Complete todos los campos');
            return;
        }
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Iniciando...';
        
        try {
            console.log('🌐 [LOGIN] Enviando a API...');
            
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
            
            console.log('📥 [LOGIN] Status:', response.status);
            
            const responseText = await response.text();
            console.log('📄 [LOGIN] Respuesta:', responseText.substring(0, 200));
            
            if (responseText.trim().startsWith('{')) {
                const result = JSON.parse(responseText);
                console.log('📦 [LOGIN] JSON:', result);
                
                if (result.success) {
                    const firstName = result.user.nombre_completo.split(' ')[0];
                    alert(`¡Bienvenido ${firstName}!`);
                    
                    console.log('✅ [LOGIN] Redirigiendo...');
                    
                    if (result.user.is_admin) {
                        window.location.href = 'administrar.html';
                    } else {
                        window.location.href = 'index.html';
                    }
                } else {
                    console.log('❌ [LOGIN] Error:', result.message);
                    alert('Error: ' + result.message);
                }
            } else {
                console.error('❌ [LOGIN] No JSON:', responseText);
                alert('Error del servidor. Revisa consola.');
            }
            
        } catch (error) {
            console.error('❌ [LOGIN] Exception:', error);
            alert('Error: ' + error.message);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalText;
        }
    }
    
    // Múltiples puntos de entrada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initLogin);
    } else {
        initLogin();
    }
    
    // Backup por si acaso
    window.addEventListener('load', () => {
        console.log('🔄 [LOGIN] Window load - verificando...');
        if (!document.querySelector('form')?.onsubmit) {
            console.log('⚠️ [LOGIN] Reinicializando...');
            initLogin();
        }
    });
    
    console.log('✅ [LOGIN] Script cargado completamente');
})();