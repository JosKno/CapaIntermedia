document.addEventListener('DOMContentLoaded', () => {
    // Lógica para alternar la visibilidad de la contraseña en el login
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function (e) {
            const passwordInput = document.getElementById('password');
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }

    // Lógica para alternar la visibilidad de la contraseña en el registro y perfil
    document.querySelectorAll('.toggle-password').forEach(toggle => {
        toggle.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target');
            const passwordInput = document.querySelector(targetId);
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    });

    // Lógica de validación de edad
    const fechaNacimiento = document.getElementById('fechaNacimiento');
    if (fechaNacimiento) {
        fechaNacimiento.addEventListener('change', () => {
            const dob = new Date(fechaNacimiento.value);
            const today = new Date();
            let age = today.getFullYear() - dob.getFullYear();
            const m = today.getMonth() - dob.getMonth();
            
            if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
                age--;
            }

            if (age < 12) {
                alert('Debes ser mayor de 12 años para registrarte.');
                fechaNacimiento.value = '';
            }
        });
    }

    // Lógica para mostrar la vista previa de la multimedia y escalar la imagen
    const multimediaInput = document.getElementById('multimedia');
    const previewBox = document.querySelector('.preview-box');
    if (multimediaInput && previewBox) {
        multimediaInput.addEventListener('change', function() {
            const file = this.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    previewBox.innerHTML = '';
                    if (file.type.startsWith('image/')) {
                        const img = document.createElement('img');
                        img.src = e.target.result;
                        previewBox.appendChild(img);
                    } else if (file.type.startsWith('video/')) {
                        const video = document.createElement('video');
                        video.src = e.target.result;
                        video.controls = true;
                        previewBox.appendChild(video);
                    }
                };
                reader.readAsDataURL(file);
            } else {
                previewBox.innerHTML = '<p class="text-muted">Vista previa de la multimedia</p>';
            }
        });
    }

    // Lógica para el botón de enviar
    const publicarForm = document.getElementById('publicarForm');
    if (publicarForm) {
        publicarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert("Publicación enviada a administrador");
            window.location.href = 'index.html';
        });
    }

    // Lógica para manejar el formulario de edición de perfil
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert("Datos de perfil actualizados.");
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editModal.hide();
        });
    }
});