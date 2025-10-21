/**
 * Script de validación para el formulario de registro
 * Versión corregida con todas las validaciones funcionando
 */

(function() {
    'use strict';
    
    console.log('🚀 Iniciando script de registro...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeRegistration);
    } else {
        initializeRegistration();
    }
    
    function initializeRegistration() {
        console.log('📋 DOM Cargado, inicializando...');
        
        const registerForm = document.getElementById('registerForm');
        
        if (!registerForm) {
            console.error('❌ No se encontró el formulario con ID "registerForm"');
            return;
        }
        
        console.log('✅ Formulario encontrado');
        
        // Variable para la imagen
        let selectedImage = null;
        
        // ============================================
        // FUNCIÓN PARA CREAR MENSAJES DE ERROR
        // ============================================
        const createErrorElement = (inputId) => {
            let errorDiv = document.querySelector(`#${inputId}-error`);
            if (errorDiv) return errorDiv;
            
            errorDiv = document.createElement('div');
            errorDiv.id = `${inputId}-error`;
            errorDiv.className = 'invalid-feedback d-block';
            errorDiv.style.fontSize = '0.875rem';
            errorDiv.style.marginTop = '0.25rem';
            return errorDiv;
        };
        
        // ============================================
        // CONFIGURAR TODOS LOS LISTENERS
        // ============================================
        const setupAllListeners = () => {
            
            // TOGGLE DE CONTRASEÑA
            document.querySelectorAll('.toggle-password').forEach(toggle => {
                toggle.style.cursor = 'pointer';
                toggle.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('data-target');
                    const passwordField = document.querySelector(targetId);
                    const icon = this.querySelector('i');
                    
                    if (passwordField) {
                        if (passwordField.type === 'password') {
                            passwordField.type = 'text';
                            icon.classList.remove('fa-eye');
                            icon.classList.add('fa-eye-slash');
                        } else {
                            passwordField.type = 'password';
                            icon.classList.remove('fa-eye-slash');
                            icon.classList.add('fa-eye');
                        }
                    }
                });
            });
            console.log('✅ Toggle de contraseña configurado');
            
            // VALIDACIÓN DE SOLO LETRAS - NOMBRE
            const nombreInput = document.getElementById('nombre');
            if (nombreInput) {
                const nombreError = createErrorElement('nombre');
                const nombreParent = nombreInput.closest('.mb-3');
                if (nombreParent && !document.getElementById('nombre-error')) {
                    nombreParent.appendChild(nombreError);
                }
                
                nombreInput.addEventListener('input', function() {
                    const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
                    if (!regex.test(this.value)) {
                        this.value = this.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
                        nombreError.textContent = 'Solo se permiten letras';
                        nombreError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        setTimeout(() => {
                            nombreError.textContent = '';
                            this.classList.remove('is-invalid');
                        }, 2000);
                    }
                });
                console.log('✅ Validación de nombre configurada');
            }
            
            // VALIDACIÓN DE SOLO LETRAS - PAÍS
            const paisInput = document.getElementById('paisNacimiento');
            if (paisInput) {
                const paisError = createErrorElement('paisNacimiento');
                const paisParent = paisInput.closest('.mb-3');
                if (paisParent && !document.getElementById('paisNacimiento-error')) {
                    paisParent.appendChild(paisError);
                }
                
                paisInput.addEventListener('input', function() {
                    const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
                    if (!regex.test(this.value)) {
                        this.value = this.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
                        paisError.textContent = 'Solo se permiten letras';
                        paisError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        setTimeout(() => {
                            paisError.textContent = '';
                            this.classList.remove('is-invalid');
                        }, 2000);
                    }
                });
                console.log('✅ Validación de país configurada');
            }
            
            // VALIDACIÓN DE SOLO LETRAS - NACIONALIDAD
            const nacionalidadInput = document.getElementById('nacionalidad');
            if (nacionalidadInput) {
                const nacionalidadError = createErrorElement('nacionalidad');
                const nacionalidadParent = nacionalidadInput.closest('.mb-3');
                if (nacionalidadParent && !document.getElementById('nacionalidad-error')) {
                    nacionalidadParent.appendChild(nacionalidadError);
                }
                
                nacionalidadInput.addEventListener('input', function() {
                    const regex = /^[a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]*$/;
                    if (!regex.test(this.value)) {
                        this.value = this.value.replace(/[^a-záéíóúüñA-ZÁÉÍÓÚÜÑ\s]/g, '');
                        nacionalidadError.textContent = 'Solo se permiten letras';
                        nacionalidadError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        setTimeout(() => {
                            nacionalidadError.textContent = '';
                            this.classList.remove('is-invalid');
                        }, 2000);
                    }
                });
                console.log('✅ Validación de nacionalidad configurada');
            }
            
            // VALIDACIÓN DE CONTRASEÑA
            const passwordInput = document.getElementById('password');
            if (passwordInput) {
                const passwordError = createErrorElement('password');
                const passwordParent = passwordInput.closest('.mb-3');
                if (passwordParent && !document.getElementById('password-error')) {
                    passwordParent.appendChild(passwordError);
                }
                
                passwordInput.addEventListener('input', function() {
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
                    
                    // Validar confirmación si tiene valor
                    const confirmPasswordInput = document.getElementById('confirmPassword');
                    if (confirmPasswordInput && confirmPasswordInput.value) {
                        validatePasswordMatch();
                    }
                });
                console.log('✅ Validación de contraseña configurada');
            }
            
            // VALIDACIÓN DE CONFIRMACIÓN DE CONTRASEÑA
            const validatePasswordMatch = () => {
                const passwordInput = document.getElementById('password');
                const confirmPasswordInput = document.getElementById('confirmPassword');
                
                if (!confirmPasswordInput || !passwordInput) return true;
                
                const confirmError = createErrorElement('confirmPassword');
                const confirmParent = confirmPasswordInput.closest('.mb-3, .mb-4');
                if (confirmParent && !document.getElementById('confirmPassword-error')) {
                    confirmParent.appendChild(confirmError);
                }
                
                if (confirmPasswordInput.value !== passwordInput.value) {
                    confirmError.textContent = 'Las contraseñas no coinciden';
                    confirmError.style.color = '#dc3545';
                    confirmPasswordInput.classList.add('is-invalid');
                    confirmPasswordInput.classList.remove('is-valid');
                    return false;
                } else if (confirmPasswordInput.value.length > 0) {
                    confirmError.textContent = '✓ Las contraseñas coinciden';
                    confirmError.style.color = '#198754';
                    confirmPasswordInput.classList.remove('is-invalid');
                    confirmPasswordInput.classList.add('is-valid');
                    return true;
                }
                return true;
            };
            
            const confirmPasswordInput = document.getElementById('confirmPassword');
            if (confirmPasswordInput) {
                confirmPasswordInput.addEventListener('input', validatePasswordMatch);
                console.log('✅ Validación de confirmación configurada');
            }
            
            // VALIDACIÓN DE EMAIL
            const emailInput = document.getElementById('email');
            if (emailInput) {
                const emailError = createErrorElement('email');
                const emailParent = emailInput.closest('.mb-3');
                if (emailParent && !document.getElementById('email-error')) {
                    emailParent.appendChild(emailError);
                }
                
                emailInput.addEventListener('blur', function() {
                    const email = this.value.trim();
                    
                    if (!email) {
                        emailError.textContent = '';
                        this.classList.remove('is-invalid', 'is-valid');
                        return;
                    }
                    
                    const atCount = (email.match(/@/g) || []).length;
                    if (atCount !== 1) {
                        emailError.textContent = 'Debe contener exactamente un @';
                        emailError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                        return;
                    }
                    
                    if (/\.{2,}/.test(email)) {
                        emailError.textContent = 'No puede tener puntos consecutivos';
                        emailError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                        return;
                    }
                    
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(email)) {
                        emailError.textContent = 'Formato de correo inválido';
                        emailError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                        return;
                    }
                    
                    emailError.textContent = '✓ Correo válido';
                    emailError.style.color = '#198754';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                });
                console.log('✅ Validación de email configurada');
            }
            
            // VALIDACIÓN DE EDAD
            const fechaNacimientoInput = document.getElementById('fechaNacimiento');
            if (fechaNacimientoInput) {
                const ageError = createErrorElement('fechaNacimiento');
                const fechaParent = fechaNacimientoInput.closest('.mb-3');
                if (fechaParent && !document.getElementById('fechaNacimiento-error')) {
                    fechaParent.appendChild(ageError);
                }
                
                fechaNacimientoInput.addEventListener('change', function() {
                    const birthDate = new Date(this.value);
                    const today = new Date();
                    
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const monthDiff = today.getMonth() - birthDate.getMonth();
                    
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                        age--;
                    }
                    
                    if (birthDate > today) {
                        ageError.textContent = 'No puede ser fecha futura';
                        ageError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                        this.value = '';
                        return;
                    }
                    
                    if (age < 12) {
                        ageError.textContent = 'Debes ser mayor de 12 años';
                        ageError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                        this.value = '';
                        return;
                    }
                    
                    if (age > 150) {
                        ageError.textContent = 'Fecha no válida';
                        ageError.style.color = '#dc3545';
                        this.classList.add('is-invalid');
                        this.classList.remove('is-valid');
                        this.value = '';
                        return;
                    }
                    
                    ageError.textContent = `✓ Edad válida (${age} años)`;
                    ageError.style.color = '#198754';
                    this.classList.remove('is-invalid');
                    this.classList.add('is-valid');
                });
                console.log('✅ Validación de edad configurada');
            }
            
            // PREVIEW DE FOTO
            const fotoInput = document.getElementById('foto');
            if (fotoInput) {
                fotoInput.addEventListener('change', function() {
                    let preview = document.getElementById('foto-preview');
                    
                    if (!preview) {
                        preview = document.createElement('div');
                        preview.id = 'foto-preview';
                        preview.className = 'mt-3 text-center';
                        
                        const img = document.createElement('img');
                        img.id = 'foto-preview-img';
                        img.className = 'img-thumbnail';
                        img.style.maxWidth = '200px';
                        img.style.maxHeight = '200px';
                        
                        const removeBtn = document.createElement('button');
                        removeBtn.type = 'button';
                        removeBtn.className = 'btn btn-sm btn-danger d-block mx-auto mt-2';
                        removeBtn.innerHTML = '<i class="fas fa-times"></i> Quitar foto';
                        removeBtn.onclick = () => {
                            fotoInput.value = '';
                            selectedImage = null;
                            preview.style.display = 'none';
                        };
                        
                        preview.appendChild(img);
                        preview.appendChild(removeBtn);
                        this.parentNode.appendChild(preview);
                    }
                    
                    const file = this.files[0];
                    const previewImg = document.getElementById('foto-preview-img');
                    
                    if (file) {
                        if (file.size > 5242880) {
                            alert('Imagen muy grande. Máximo: 5MB');
                            this.value = '';
                            preview.style.display = 'none';
                            return;
                        }
                        
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
                        if (!allowedTypes.includes(file.type)) {
                            alert('Solo imágenes: JPG, PNG, GIF, WEBP');
                            this.value = '';
                            preview.style.display = 'none';
                            return;
                        }
                        
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            previewImg.src = e.target.result;
                            preview.style.display = 'block';
                            selectedImage = file;
                        };
                        reader.readAsDataURL(file);
                    } else {
                        preview.style.display = 'none';
                        selectedImage = null;
                    }
                });
                console.log('✅ Preview de foto configurado');
            }
        };
        
        // Configurar todos los listeners
        setupAllListeners();
        
        // ============================================
        // MANEJO DEL SUBMIT
        // ============================================
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('🔥 Submit capturado');
            
            const nombre = document.getElementById('nombre').value.trim();
            const fechaNacimiento = document.getElementById('fechaNacimiento').value;
            const genero = document.getElementById('genero').value;
            const paisNacimiento = document.getElementById('paisNacimiento').value.trim();
            const nacionalidad = document.getElementById('nacionalidad').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const foto = document.getElementById('foto').files[0];
            
            if (!nombre || !fechaNacimiento || !genero || !paisNacimiento || !nacionalidad || !email || !password || !confirmPassword) {
                alert('Complete todos los campos requeridos');
                return;
            }
            
            if (password !== confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            
            const submitButton = this.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Registrando...';
            
            try {
                const formData = new FormData();
                formData.append('nombre_completo', nombre);
                formData.append('fecha_nacimiento', fechaNacimiento);
                formData.append('genero', genero);
                formData.append('pais_nacimiento', paisNacimiento);
                formData.append('nacionalidad', nacionalidad);
                formData.append('email', email);
                formData.append('contrasena', password);
                
                if (foto) {
                    formData.append('foto_perfil', foto);
                }
                
                const response = await fetch('./api/register.php', {
                    method: 'POST',
                    body: formData
                });
                
                const responseText = await response.text();
                
                if (responseText.trim().startsWith('{')) {
                    const result = JSON.parse(responseText);
                    
                    if (result.success) {
                        alert('¡Registro exitoso!');
                        window.location.href = 'login.html';
                    } else {
                        alert('Error: ' + result.message);
                    }
                } else {
                    console.error('Respuesta no JSON:', responseText);
                    alert('Error del servidor. Revisa la consola.');
                }
                
            } catch (error) {
                console.error('Error:', error);
                alert('Error de conexión: ' + error.message);
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
        });
        
        console.log('✅ Todo configurado correctamente');
    }
})();