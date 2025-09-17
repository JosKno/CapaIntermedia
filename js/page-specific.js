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

    // Lógica para el ajuste automático de la altura del textarea
    document.querySelectorAll('textarea').forEach(textarea => {
        textarea.addEventListener('input', () => {
            textarea.style.height = 'auto';
            textarea.style.height = textarea.scrollHeight + 'px';
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

    // Lógica para mostrar la vista previa de la multimedia y escalar la imagen en publicar.html
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

    // Lógica para el botón de enviar en publicar.html
    const publicarForm = document.getElementById('publicarForm');
    if (publicarForm) {
        publicarForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert("Publicación enviada a administrador");
            window.location.href = 'index.html';
        });
    }

    // Lógica para manejar el formulario de edición de perfil en perfil.html
    const editProfileForm = document.getElementById('editProfileForm');
    if (editProfileForm) {
        editProfileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert("Datos de perfil actualizados.");
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editModal.hide();
        });
    }

    // Lógica para mostrar la vista previa de la multimedia en el modal de infografia.html
    const postMultimediaInput = document.getElementById('post-multimedia');
    const postPreviewContainer = document.getElementById('post-preview-container');

    if (postMultimediaInput && postPreviewContainer) {
        postMultimediaInput.addEventListener('change', function() {
            postPreviewContainer.innerHTML = '';
            const files = this.files;
            if (files.length > 0) {
                for (const file of files) {
                    const reader = new FileReader();
                    reader.onload = function(e) {
                        let mediaElement;
                        if (file.type.startsWith('image/')) {
                            mediaElement = document.createElement('img');
                            mediaElement.src = e.target.result;
                        } else if (file.type.startsWith('video/')) {
                            mediaElement = document.createElement('video');
                            mediaElement.src = e.target.result;
                            mediaElement.controls = true;
                        }
                        if (mediaElement) {
                            mediaElement.classList.add('img-fluid', 'rounded', 'mb-2');
                            postPreviewContainer.appendChild(mediaElement);
                        }
                    };
                    reader.readAsDataURL(file);
                }
            } else {
                postPreviewContainer.innerHTML = '<p class="text-muted">Vista previa de la multimedia</p>';
            }
        });
    }

    // Lógica para el botón de publicar en el modal de infografia.html
    const addPostForm = document.getElementById('addPostForm');
    if (addPostForm) {
        addPostForm.addEventListener('submit', function(e) {
            e.preventDefault();
            alert("Publicación enviada a administrador para su aprobación.");
            const addPostModal = bootstrap.Modal.getInstance(document.getElementById('addPostModal'));
            addPostModal.hide();
            this.reset();
        });
    }
    
    // Lógica para gestionar publicaciones en administrar-publicaciones.html
    const viewPostModal = document.getElementById('viewPostModal');
    if (viewPostModal) {
        viewPostModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const row = button.closest('tr');
            const title = row.getAttribute('data-title');
            const author = row.getAttribute('data-author');
            const date = row.getAttribute('data-date');
            const content = row.getAttribute('data-content');
            const mediaSrc = row.getAttribute('data-media-src');
            const category = row.getAttribute('data-category');
            const worldcup = row.getAttribute('data-worldcup');

            this.querySelector('#post-modal-title').textContent = title;
            this.querySelector('#post-modal-meta').textContent = `Por: ${author} | Categoría: ${category} | Mundial: ${worldcup}`;
            this.querySelector('#post-modal-content').textContent = content;

            const mediaContainer = this.querySelector('#post-modal-media');
            mediaContainer.innerHTML = '';
            if (mediaSrc) {
                if (mediaSrc.endsWith('.mp4') || mediaSrc.endsWith('.mov')) {
                    const videoElement = document.createElement('video');
                    videoElement.src = mediaSrc;
                    videoElement.controls = true;
                    videoElement.classList.add('img-fluid', 'rounded');
                    mediaContainer.appendChild(videoElement);
                } else {
                    const imageElement = document.createElement('img');
                    imageElement.src = mediaSrc;
                    imageElement.classList.add('img-fluid', 'rounded');
                    mediaContainer.appendChild(imageElement);
                }
            }
        });

        // Simulación de aprobación y rechazo
        document.querySelectorAll('.approve-btn, .approve-btn-modal').forEach(button => {
            button.addEventListener('click', () => {
                if (confirm("¿Estás seguro de que quieres aprobar esta publicación?")) {
                    alert("Publicación aprobada con éxito.");
                    window.location.reload(); // Simular la recarga de la página
                }
            });
        });

        document.querySelectorAll('.reject-btn, .reject-btn-modal').forEach(button => {
            button.addEventListener('click', () => {
                if (confirm("¿Estás seguro de que quieres rechazar esta publicación?")) {
                    alert("Publicación rechazada con éxito.");
                    window.location.reload(); // Simular la recarga de la página
                }
            });
        });
    }
});