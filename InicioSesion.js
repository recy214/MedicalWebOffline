document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const matriculaInput = document.getElementById('matriculaInput');
    const matriculaLabel = document.getElementById('matriculaLabel');

    matriculaInput.addEventListener('input', function() {
        if (matriculaInput.value.trim().toLowerCase() === 'admin') {
            matriculaLabel.textContent = 'ID:';
            matriculaInput.placeholder = 'ID';
        } else {
            matriculaLabel.textContent = 'Matrícula:';
            matriculaInput.placeholder = 'Matrícula';
        }
    });

    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        const matriculaOId = this.matricula.value.trim();
        const contrasena = this.contrasena.value.trim();

        try {
            const usuarioValido = await db.usuarios
                .where('matricula').equalsIgnoreCase(matriculaOId)
                .or('id').equalsIgnoreCase(matriculaOId)
                .first();

            if (usuarioValido && usuarioValido.contrasena === contrasena) {
                localStorage.setItem('usuarioActual', JSON.stringify({
                    nombre: usuarioValido.nombre || '',
                    apellidos: usuarioValido.apellidos || '',
                    rol: usuarioValido.rol || '',
                    id: usuarioValido.id || '',
                    matricula: usuarioValido.matricula || ''
                }));

                if (usuarioValido.rol === 'admin') {
                    window.location.href = 'menuInicio.html';
                } else if (usuarioValido.rol === 'practicante') {
                    window.location.href = 'menuInicio.html?practicante=true';
                }
            } else {
                alert('ID o contraseña incorrecta');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            alert('Ocurrió un error al intentar iniciar sesión.');
        }
    });
});