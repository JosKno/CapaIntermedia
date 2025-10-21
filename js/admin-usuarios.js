/**
 * ADMIN USUARIOS - Gestión de usuarios
 */

console.log('👥 ADMIN USUARIOS: Iniciando...');

(function() {
    'use strict';
    
    let allUsers = [];
    let currentFilter = 'todos';
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    async function init() {
        console.log('📋 Inicializando administración de usuarios...');
        
        // Verificar que sea admin
        await checkAdminAccess();
        
        // Cargar usuarios
        await loadUsers();
        
        // Configurar event listeners
        setupEventListeners();
    }
    
    async function checkAdminAccess() {
        try {
            const response = await fetch('./api/check_session.php');
            const data = await response.json();
            
            if (!data.logged_in || !data.user.is_admin) {
                alert('Acceso denegado. Solo administradores pueden ver esta página.');
                window.location.href = 'index.html';
            }
        } catch (error) {
            console.error('❌ Error verificando acceso:', error);
            window.location.href = 'index.html';
        }
    }
    
    async function loadUsers() {
        console.log('📥 Cargando usuarios...');
        
        const loadingSpinner = document.getElementById('loadingSpinner');
        const tableContainer = document.getElementById('usersTableContainer');
        const noUsersMessage = document.getElementById('noUsersMessage');
        
        loadingSpinner.style.display = 'block';
        tableContainer.style.display = 'none';
        noUsersMessage.style.display = 'none';
        
        try {
            const response = await fetch('./api/get_all_users.php');
            const result = await response.json();
            
            if (result.success) {
                allUsers = result.users;
                console.log('✅ Usuarios cargados:', allUsers.length);
                
                updateStatistics();
                displayUsers(allUsers);
                
                loadingSpinner.style.display = 'none';
                
                if (allUsers.length > 0) {
                    tableContainer.style.display = 'block';
                } else {
                    noUsersMessage.style.display = 'block';
                }
            } else {
                throw new Error(result.message);
            }
            
        } catch (error) {
            console.error('❌ Error cargando usuarios:', error);
            loadingSpinner.style.display = 'none';
            noUsersMessage.textContent = 'Error al cargar usuarios: ' + error.message;
            noUsersMessage.style.display = 'block';
        }
    }
    
    function updateStatistics() {
        const totalUsuarios = allUsers.length;
        const totalAdmins = allUsers.filter(u => u.is_admin).length;
        const totalRegulares = totalUsuarios - totalAdmins;
        
        document.getElementById('total-usuarios').textContent = totalUsuarios;
        document.getElementById('total-admins').textContent = totalAdmins;
        document.getElementById('total-regulares').textContent = totalRegulares;
    }
    
    function displayUsers(users) {
        const tbody = document.getElementById('usersTableBody');
        tbody.innerHTML = '';
        
        if (users.length === 0) {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No se encontraron usuarios</td></tr>';
            return;
        }
        
        users.forEach(user => {
            const row = createUserRow(user);
            tbody.appendChild(row);
        });
    }
    
    function createUserRow(user) {
        const tr = document.createElement('tr');
        
        const timestamp = new Date().getTime();
        const photoUrl = `./api/get_photo.php?id=${user.id_usuario}&t=${timestamp}`;
        
        const roleBadge = user.is_admin 
            ? '<span class="badge bg-primary">Admin</span>' 
            : '<span class="badge bg-success">Usuario</span>';
        
        tr.innerHTML = `
            <td>
                <img src="${photoUrl}" alt="Foto" class="rounded-circle" 
                     style="width: 40px; height: 40px; object-fit: cover;"
                     onerror="this.src='https://via.placeholder.com/40?text=Sin+Foto'">
            </td>
            <td>${escapeHtml(user.nombre_completo)}</td>
            <td>${escapeHtml(user.email)}</td>
            <td>${formatDate(user.fecha_registro)}</td>
            <td>${roleBadge}</td>
            <td>
                <button class="btn btn-sm btn-outline-dark view-user-btn" data-user-id="${user.id_usuario}">
                    <i class="fas fa-eye"></i>
                </button>
            </td>
        `;
        
        // Event listener para ver detalles
        const viewBtn = tr.querySelector('.view-user-btn');
        viewBtn.addEventListener('click', () => showUserDetails(user));
        
        return tr;
    }
    
    function showUserDetails(user) {
        const timestamp = new Date().getTime();
        const photoUrl = `./api/get_photo.php?id=${user.id_usuario}&t=${timestamp}`;
        
        document.getElementById('modal-user-photo').src = photoUrl;
        document.getElementById('modal-user-name').textContent = user.nombre_completo;
        document.getElementById('modal-user-email').textContent = user.email;
        document.getElementById('modal-user-dob').textContent = formatDate(user.fecha_nacimiento);
        document.getElementById('modal-user-gender').textContent = capitalizeFirst(user.genero);
        document.getElementById('modal-user-country').textContent = user.pais_nacimiento;
        document.getElementById('modal-user-nationality').textContent = user.nacionalidad;
        document.getElementById('modal-user-registered').textContent = formatDateTime(user.fecha_registro);
        document.getElementById('modal-user-role').textContent = user.is_admin ? 'Administrador' : 'Usuario Regular';
        
        const modal = new bootstrap.Modal(document.getElementById('userDetailsModal'));
        modal.show();
    }
    
    function setupEventListeners() {
        // Botón de actualizar
        const refreshBtn = document.getElementById('refreshBtn');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', loadUsers);
        }
        
        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                const searchTerm = this.value.toLowerCase();
                const filtered = allUsers.filter(user => {
                    return user.nombre_completo.toLowerCase().includes(searchTerm) ||
                           user.email.toLowerCase().includes(searchTerm);
                });
                displayUsers(filtered);
            });
        }
        
        // Filtros
        document.querySelectorAll('.filter-option').forEach(option => {
            option.addEventListener('click', function(e) {
                e.preventDefault();
                const filter = this.getAttribute('data-filter');
                applyFilter(filter);
            });
        });
    }
    
    function applyFilter(filter) {
        currentFilter = filter;
        let filtered = [...allUsers];
        
        switch(filter) {
            case 'admins':
                filtered = allUsers.filter(u => u.is_admin);
                break;
            case 'usuarios':
                filtered = allUsers.filter(u => !u.is_admin);
                break;
            case 'recientes':
                filtered.sort((a, b) => new Date(b.fecha_registro) - new Date(a.fecha_registro));
                break;
            case 'todos':
            default:
                // No filtrar
                break;
        }
        
        displayUsers(filtered);
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    function formatDateTime(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return `${day}/${month}/${year} ${hours}:${minutes}`;
    }
    
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    console.log('✅ ADMIN USUARIOS: Script cargado');
})();