document.addEventListener('DOMContentLoaded', () => {
    // Lógica para el modo oscuro
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Cargar el estado del modo oscuro del localStorage
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
        body.classList.add('dark-mode');
    }

    // Manejar el clic del botón del modo oscuro
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            body.classList.toggle('dark-mode');
            // Guardar el estado actual en el localStorage
            const isNowDarkMode = body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isNowDarkMode);
        });
    }
});