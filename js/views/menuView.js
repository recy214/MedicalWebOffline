// js/views/menuView.js

export function renderMenu(usuarioActual) {
    const userNameSpan = document.getElementById('userName');
    const welcomeHeader = document.querySelector('h2');

    if (userNameSpan) userNameSpan.textContent = usuarioActual.nombre;
    if (welcomeHeader) welcomeHeader.innerText = `Bienvenido ${usuarioActual.nombre} (${usuarioActual.rol})`;

    if (usuarioActual.rol === 'practicante') {
        const botonesPermitidos = ['Historial médico', 'Ingresar Nuevo Paciente', 'Mesas de salud', 'Citas'];
        document.querySelectorAll('.menu button').forEach(btn => {
            const texto = btn.innerText.trim();
            if (!botonesPermitidos.some(t => texto.includes(t))) {
                btn.style.display = 'none';
            }
        });
    }
}