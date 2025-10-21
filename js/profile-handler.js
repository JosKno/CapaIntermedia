/**
 * PROFILE HANDLER - Gestión completa de perfil
 * Separado en: Datos, Contraseña y Foto
 */

console.log('👤 PROFILE HANDLER: Iniciando...');

(function() {
    'use strict';
    
    let currentUser = null;
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfile);
    } else {
        initProfile();
    }
    
    async function initProfile() {
        console.log('📋 Inicializando perfil...');
        
        try {
            const response = await fetch('./api/check_session.php');
            const data = await response.json();
            
            if (!data.logged_in) {
                alert('Debes iniciar sesión para ver tu perfil');
                window.location.href = 'login.html';
                return;
            }
            
            currentUser = data.user;
            await loadUserProfile();
            setupEventListeners();
            
        } catch (error) {
            console.error('❌ Error verificando sesión:', error);
            alert('Error al cargar el perfil');
            window.location.href = 'login.html';
        }
    }
    
    async function loadUserProfile() {
        try {
            const response = await fetch(`./api/get_user.php?id=${currentUser.id_usuario}`);
            const result = await response.json();
            
            if (result.success) {
                displayUserProfile(result.user);
            } else {
                alert('Error al cargar información del perfil');
            }
        } catch (error) {
            console.error('❌ Error en loadUserProfile:', error);
            alert('Error de conexión al cargar perfil');
        }
    }
    
    function displayUserProfile(user) {
        // Agregar timestamp para evitar caché
        const timestamp = new Date().getTime();
        const photoUrl = user.foto_perfil_url ? `${user.foto_perfil_url}&t=${timestamp}` : '';
        
        const profileImages = document.querySelectorAll('.profile-img, .user-post-img');
        profileImages.forEach(img => {
            if (photoUrl) {
                img.src = photoUrl;
            }
        });
        
        console.log('🖼️ Foto cargada:', photoUrl);
        
        const userNameElements = document.querySelectorAll('.card-title.fw-bold');
        if (userNameElements[0]) {
            userNameElements[0].textContent = user.nombre_completo;
        }
        
        const usernameEl = document.querySelector('.profile-card .text-muted');
        if (usernameEl) {
            const username = user.email.split('@')[0];
            usernameEl.textContent = `@${username}`;
        }
        
        document.getElementById('user-dob').textContent = formatDate(user.fecha_nacimiento);
        document.getElementById('user-gender').textContent = capitalizeFirst(user.genero);
        document.getElementById('user-country').textContent = user.pais_nacimiento;
        document.getElementById('user-nationality').textContent = user.nacionalidad;
        document.getElementById('user-email').textContent = user.email;
        
        currentUser.fullData = user;
    }
    
    function setupEventListeners() {
        // Modal de editar datos
        const editDataModal = document.getElementById('editDataModal');
        if (editDataModal) {
            editDataModal.addEventListener('show.bs.modal', fillEditDataForm);
        }
        
        // Modal de cambiar contraseña
        const changePasswordModal = document.getElementById('changePasswordModal');
        if (changePasswordModal) {
            changePasswordModal.addEventListener('show.bs.modal', clearPasswordForm);
        }
        
        // Modal de cambiar foto
        const changePhotoModal = document.getElementById('changePhotoModal');
        if (changePhotoModal) {
            changePhotoModal.addEventListener('show.bs.modal', clearPhotoForm);
        }
        
        // Formularios
        const editDataForm = document.getElementById('editDataForm');
        if (editDataForm) {
            setupDataValidation();
            editDataForm.addEventListener('submit', handleDataUpdate);
        }
        
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            setupPasswordValidation();
            changePasswordForm.addEventListener('submit', handlePasswordChange);
        }
        
        const changePhotoForm = document.getElementById('changePhotoForm');
        if (changePhotoForm) {
            setupPhotoPreview();
            changePhotoForm.addEventListener('submit', handlePhotoChange);
        }
        
        console.log('✅ Event listeners configurados');
    }
    
    // ====================================
    // EDITAR DATOS
    // ====================================
    
    function fillEditDataForm() {
        if (!currentUser.fullData) return;
        
        const user = currentUser.fullData;
        document.getElementById('edit-nombre').value = user.nombre_completo;
        document.getElementById('edit-fechaNacimiento').value = user.fecha_nacimiento;
        document.getElementById('edit-genero').value = user.genero;
        document.getElementById('edit-paisNacimiento').value = user.pais_nacimiento;
        document.getElementById('edit-nacionalidad').value = user.nacionalidad;
        document.getElementById('edit-email').value = user.email;
    }
    
    function setupDataValidation() {
        const createError = (inputId) => {
            let errorDiv = document.querySelector(`#${inputId}-error`);
            if (errorDiv) return errorDiv;
            
            errorDiv = document.createElement('div');
            errorDiv.id = `${inputId}-error`;
            errorDiv.className = 'invalid-feedback d-block';
            return errorDiv;
        };
        
        // Validación de nombre
        const nombreInput = document.getElementById('edit-nombre');
        if (nombreInput) {
            const nombreError = createError('edit-nombre');
            nombreInput.parentNode.appendChild(nombreError);
            
            nombreInput.addEventListener('input', function() {
                const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
                if (!regex.test(this.value)) {
                    this.value = this.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
                    nombreError.textContent = 'Solo se permiten letras';
                    this.classList.add('is-invalid');
                } else if (this.value.trim().length < 3) {
                    nombreError.textContent = 'Mínimo 3 caracteres';
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    nombreError.textContent = '';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
        }
        
        // Validación de edad
        const fechaInput = document.getElementById('edit-fechaNacimiento');
        if (fechaInput) {
            const fechaError = createError('edit-fechaNacimiento');
            fechaInput.parentNode.appendChild(fechaError);
            
            fechaInput.addEventListener('change', function() {
                const birthDate = new Date(this.value);
                const today = new Date();
                
                let age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                
                if (birthDate > today) {
                    fechaError.textContent = 'No puede ser fecha futura';
                    this.classList.add('is-invalid');
                    this.value = '';
                } else if (age < 12) {
                    fechaError.textContent = 'Debes ser mayor de 12 años';
                    this.classList.add('is-invalid');
                    this.value = '';
                } else if (age > 150) {
                    fechaError.textContent = 'Fecha no válida';
                    this.classList.add('is-invalid');
                    this.value = '';
                } else {
                    fechaError.textContent = `✓ Edad válida (${age} años)`;
                    fechaError.style.color = '#198754';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
        }
        
        // Validación de país
        const paisInput = document.getElementById('edit-paisNacimiento');
        if (paisInput) {
            const paisError = createError('edit-paisNacimiento');
            paisInput.parentNode.appendChild(paisError);
            
            paisInput.addEventListener('input', function() {
                const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
                if (!regex.test(this.value)) {
                    this.value = this.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
                    paisError.textContent = 'Solo se permiten letras';
                    this.classList.add('is-invalid');
                } else {
                    paisError.textContent = '';
                    this.classList.remove('is-invalid');
                }
            });
        }
        
        // Validación de nacionalidad
        const nacionalidadInput = document.getElementById('edit-nacionalidad');
        if (nacionalidadInput) {
            const nacionalidadError = createError('edit-nacionalidad');
            nacionalidadInput.parentNode.appendChild(nacionalidadError);
            
            nacionalidadInput.addEventListener('input', function() {
                const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
                if (!regex.test(this.value)) {
                    this.value = this.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
                    nacionalidadError.textContent = 'Solo se permiten letras';
                    this.classList.add('is-invalid');
                } else {
                    nacionalidadError.textContent = '';
                    this.classList.remove('is-invalid');
                }
            });
        }
        
        // Validación de email
        const emailInput = document.getElementById('edit-email');
        if (emailInput) {
            const emailError = createError('edit-email');
            emailInput.parentNode.appendChild(emailError);
            
            emailInput.addEventListener('blur', function() {
                const email = this.value.trim();
                if (!email) return;
                
                const atCount = (email.match(/@/g) || []).length;
                if (atCount !== 1) {
                    emailError.textContent = 'Debe contener exactamente un @';
                    this.classList.add('is-invalid');
                    return;
                }
                
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(email)) {
                    emailError.textContent = 'Formato de correo inválido';
                    this.classList.add('is-invalid');
                } else {
                    emailError.textContent = '✓ Correo válido';
                    emailError.style.color = '#198754';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
            });
        }
    }
    
    async function handleDataUpdate(e) {
        e.preventDefault();
        
        // Validar antes de enviar
        const nombre = document.getElementById('edit-nombre').value.trim();
        const fecha = document.getElementById('edit-fechaNacimiento').value;
        const email = document.getElementById('edit-email').value.trim();
        
        if (!nombre || nombre.length < 3) {
            alert('El nombre debe tener al menos 3 caracteres');
            return;
        }
        
        if (!fecha) {
            alert('La fecha de nacimiento es requerida');
            return;
        }
        
        if (!email) {
            alert('El email es requerido');
            return;
        }
        
        const formData = new FormData();
        formData.append('id_usuario', currentUser.id_usuario);
        formData.append('nombre_completo', nombre);
        formData.append('fecha_nacimiento', fecha);
        formData.append('genero', document.getElementById('edit-genero').value);
        formData.append('pais_nacimiento', document.getElementById('edit-paisNacimiento').value.trim());
        formData.append('nacionalidad', document.getElementById('edit-nacionalidad').value.trim());
        formData.append('email', email);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Guardando...';
        
        try {
            const response = await fetch('./api/update_user.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Datos actualizados exitosamente');
                const modal = bootstrap.Modal.getInstance(document.getElementById('editDataModal'));
                modal.hide();
                await loadUserProfile();
            } else {
                alert('❌ Error: ' + result.message);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error de conexión');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    // ====================================
    // CAMBIAR CONTRASEÑA
    // ====================================
    
    function clearPasswordForm() {
        document.getElementById('current-password').value = '';
        document.getElementById('new-password').value = '';
        document.getElementById('confirm-new-password').value = '';
        
        document.querySelectorAll('.is-valid, .is-invalid').forEach(el => {
            el.classList.remove('is-valid', 'is-invalid');
        });
    }
    
    function setupPasswordValidation() {
        const toggles = document.querySelectorAll('#changePasswordModal .toggle-password');
        toggles.forEach(toggle => {
            toggle.style.cursor = 'pointer';
            toggle.addEventListener('click', function(e) {
                e.preventDefault();
                const targetId = this.getAttribute('data-target');
                const input = document.querySelector(targetId);
                const icon = this.querySelector('i');
                
                if (input.type === 'password') {
                    input.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    input.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
        
        const createError = (inputId) => {
            let errorDiv = document.querySelector(`#${inputId}-error`);
            if (errorDiv) return errorDiv;
            
            errorDiv = document.createElement('div');
            errorDiv.id = `${inputId}-error`;
            errorDiv.className = 'invalid-feedback d-block';
            return errorDiv;
        };
        
        const newPasswordInput = document.getElementById('new-password');
        if (newPasswordInput) {
            const passwordError = createError('new-password');
            newPasswordInput.closest('.mb-3').appendChild(passwordError);
            
            newPasswordInput.addEventListener('input', function() {
                const password = this.value;
                const errors = [];
                
                if (password.length < 8) errors.push('Mínimo 8 caracteres');
                if (!/[A-Z]/.test(password)) errors.push('una mayúscula');
                if (!/[a-z]/.test(password)) errors.push('una minúscula');
                if (!/[0-9]/.test(password)) errors.push('un número');
                if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?\/\\|`~]/.test(password)) errors.push('un símbolo');
                
                if (errors.length > 0) {
                    passwordError.textContent = 'Falta: ' + errors.join(', ');
                    passwordError.style.color = '#dc3545';
                    this.classList.add('is-invalid');
                    this.classList.remove('is-valid');
                } else {
                    passwordError.textContent = '✓ Contraseña válida';
                    passwordError.style.color = '#198754';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                }
                
                const confirmInput = document.getElementById('confirm-new-password');
                if (confirmInput.value) {
                    validatePasswordMatch();
                }
            });
        }
        
        const confirmPasswordInput = document.getElementById('confirm-new-password');
        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', validatePasswordMatch);
        }
        
        function validatePasswordMatch() {
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-new-password').value;
            const confirmError = createError('confirm-new-password');
            confirmPasswordInput.closest('.mb-3').appendChild(confirmError);
            
            if (!confirmPassword) {
                confirmError.textContent = '';
                confirmPasswordInput.classList.remove('is-valid', 'is-invalid');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                confirmError.textContent = 'Las contraseñas no coinciden';
                confirmError.style.color = '#dc3545';
                confirmPasswordInput.classList.add('is-invalid');
                confirmPasswordInput.classList.remove('is-valid');
            } else {
                confirmError.textContent = '✓ Las contraseñas coinciden';
                confirmError.style.color = '#198754';
                confirmPasswordInput.classList.remove('is-invalid');
                confirmPasswordInput.classList.add('is-valid');
            }
        }
    }
    
    async function handlePasswordChange(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-new-password').value;
        
        if (!currentPassword) {
            alert('Ingresa tu contraseña actual');
            return;
        }
        
        if (!newPassword || newPassword.length < 8) {
            alert('La nueva contraseña debe tener al menos 8 caracteres');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            alert('Las contraseñas nuevas no coinciden');
            return;
        }
        
        const formData = new FormData();
        formData.append('id_usuario', currentUser.id_usuario);
        formData.append('current_password', currentPassword);
        formData.append('new_password', newPassword);
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Cambiando...';
        
        try {
            const response = await fetch('./api/change_password.php', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.success) {
                alert('✅ Contraseña actualizada exitosamente');
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePasswordModal'));
                modal.hide();
            } else {
                alert('❌ Error: ' + result.message);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error de conexión');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    // ====================================
    // CAMBIAR FOTO
    // ====================================
    
    function clearPhotoForm() {
        document.getElementById('new-photo').value = '';
        const preview = document.getElementById('photo-preview');
        if (preview) {
            preview.innerHTML = '<p class="text-muted">Vista previa de la nueva foto</p>';
        }
    }
    
    function setupPhotoPreview() {
        const photoInput = document.getElementById('new-photo');
        if (photoInput) {
            photoInput.addEventListener('change', function() {
                const file = this.files[0];
                const preview = document.getElementById('photo-preview');
                
                if (!file) {
                    preview.innerHTML = '<p class="text-muted">Vista previa de la nueva foto</p>';
                    return;
                }
                
                if (file.size > 5242880) {
                    alert('La imagen es muy grande. Máximo: 5MB');
                    this.value = '';
                    preview.innerHTML = '<p class="text-muted">Vista previa de la nueva foto</p>';
                    return;
                }
                
                const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(file.type)) {
                    alert('Tipo no permitido. Solo: JPG, PNG, GIF, WEBP');
                    this.value = '';
                    preview.innerHTML = '<p class="text-muted">Vista previa de la nueva foto</p>';
                    return;
                }
                
                const reader = new FileReader();
                reader.onload = function(e) {
                    preview.innerHTML = `<img src="${e.target.result}" class="img-fluid rounded" style="max-height: 300px;">`;
                };
                reader.readAsDataURL(file);
            });
        }
    }
    
    async function handlePhotoChange(e) {
        e.preventDefault();
        
        const photoInput = document.getElementById('new-photo');
        const file = photoInput.files[0];
        
        if (!file) {
            alert('Selecciona una imagen');
            return;
        }
        
        console.log('📤 Preparando envío de foto:', {
            file_name: file.name,
            file_size: file.size,
            file_type: file.type
        });
        
        const formData = new FormData();
        // Ya no enviamos id_usuario, se toma de la sesión
        formData.append('foto_perfil', file, file.name);
        
        // Verificar FormData
        console.log('📦 FormData entries:');
        for (let pair of formData.entries()) {
            console.log(`   ${pair[0]}:`, pair[1]);
        }
        
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Subiendo...';
        
        try {
            console.log('🌐 Enviando a API...');
            
            const response = await fetch('./api/change_photo.php', {
                method: 'POST',
                body: formData
                // NO incluir Content-Type header cuando usas FormData
            });
            
            console.log('📥 Respuesta status:', response.status);
            
            const responseText = await response.text();
            console.log('📄 Respuesta raw:', responseText.substring(0, 500));
            
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('✅ JSON parseado:', result);
            } catch (parseError) {
                console.error('❌ Error parseando JSON:', parseError);
                console.error('📄 Respuesta completa:', responseText);
                alert('Error en la respuesta del servidor');
                return;
            }
            
            if (result.success) {
                alert('✅ Foto actualizada exitosamente');
                const modal = bootstrap.Modal.getInstance(document.getElementById('changePhotoModal'));
                modal.hide();
                
                // Esperar un momento para que la BD se actualice
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Forzar recarga de la imagen con nuevo timestamp
                console.log('🔄 Recargando foto de perfil...');
                const timestamp = new Date().getTime();
                const newPhotoUrl = `./api/get_photo.php?id=${currentUser.id_usuario}&t=${timestamp}`;
                
                // Actualizar TODAS las imágenes de perfil en la página
                const allProfileImages = document.querySelectorAll('.profile-img, .user-post-img');
                allProfileImages.forEach(img => {
                    console.log('📸 Actualizando imagen:', img);
                    // Forzar recarga removiendo y volviendo a poner el src
                    img.src = '';
                    setTimeout(() => {
                        img.src = newPhotoUrl;
                    }, 100);
                });
                
                // También recargar el perfil completo
                await loadUserProfile();
            } else {
                alert('❌ Error: ' + result.message);
            }
            
        } catch (error) {
            console.error('❌ Error:', error);
            alert('Error de conexión');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalText;
        }
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
    
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
    }
    
    console.log('✅ PROFILE HANDLER: Script cargado');
})();