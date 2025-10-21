/**
 * Sistema de autenticación y gestión de navbar dinámico
 */

(function() {
    'use strict';
    
    // Verificar sesión al cargar cualquier página
    async function checkSession() {
        try {
            const response = await fetch('./api/check_session.php');
            const data = await response.json();
            
            if (data.logged_in) {
                updateNavbarLoggedIn(data.user);
                return data.user;
            } else {
                updateNavbarLoggedOut();
                return null;
            }
        } catch (error) {
            console.error('Error al verificar sesión:', error);
            updateNavbarLoggedOut();
            return null;
        }
    }
    
    // Actualizar navbar para usuario logueado
    function updateNavbarLoggedIn(user) {
        const navbarNav = document.querySelector('.navbar-nav:last-child');
        if (!navbarNav) return;
        
        // Limpiar items existentes (excepto el botón de modo oscuro)
        const darkModeBtn = navbarNav.querySelector('li:has(#darkModeToggle)');
        navbarNav.innerHTML = '';
        
        // Agregar items según el tipo de usuario
        if (user.is_admin) {
            // Usuario administrador
            navbarNav.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="publicar.html">Publicar</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="administrar.html">Administrar</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="perfil.html">
                        <i class="fas fa-user me-1"></i>${user.primer_nombre}
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logoutBtn">
                        <i class="fas fa-sign-out-alt me-1"></i>Cerrar Sesión
                    </a>
                </li>
            `;
        } else {
            // Usuario normal
            navbarNav.innerHTML = `
                <li class="nav-item">
                    <a class="nav-link" href="publicar.html">Publicar</a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="perfil.html">
                        <i class="fas fa-user me-1"></i>${user.primer_nombre}
                    </a>
                </li>
                <li class="nav-item">
                    <a class="nav-link" href="#" id="logoutBtn">
                        <i class="fas fa-sign-out-alt me-1"></i>Cerrar Sesión
                    </a>
                </li>
            `;
        }
        
        // Re-agregar el botón de modo oscuro
        if (darkModeBtn) {
            navbarNav.appendChild(darkModeBtn);
        }
        
        // Agregar evento al botón de logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', handleLogout);
        }
    }
    
    // Actualizar navbar para usuario no logueado
    function updateNavbarLoggedOut() {
        const navbarNav = document.querySelector('.navbar-nav:last-child');
        if (!navbarNav) return;
        
        // Limpiar y agregar items para no logueados
        const darkModeBtn = navbarNav.querySelector('li:has(#darkModeToggle)');
        navbarNav.innerHTML = `
            <li class="nav-item">
                <a class="nav-link" href="login.html">
                    <i class="fas fa-sign-in-alt me-1"></i>Iniciar Sesión
                </a>
            </li>
            <li class="nav-item">
                <a class="nav-link" href="registrarse.html">
                    <i class="fas fa-user-plus me-1"></i>Registrarse
                </a>
            </li>
        `;
        
        // Re-agregar el botón de modo oscuro
        if (darkModeBtn) {
            navbarNav.appendChild(darkModeBtn);
        }
    }
    
    // Manejar logout
    async function handleLogout(e) {
        e.preventDefault();
        
        if (!confirm('¿Estás seguro de que deseas cerrar sesión?')) {
            return;
        }
        
        try {
            const response = await fetch('./api/logout.php', {
                method: 'POST'
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('Sesión cerrada exitosamente');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('Error al cerrar sesión:', error);
            alert('Error al cerrar sesión');
        }
    }
    
    // Ejecutar al cargar la página
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkSession);
    } else {
        checkSession();
    }
    
    // Exportar funciones globalmente
    window.AuthSystem = {
        checkSession,
        handleLogout
    };
})();