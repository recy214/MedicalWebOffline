// js/controllers/authController.js
import { authModel } from '../models/storageModel.js';

document.addEventListener('DOMContentLoaded', () => {
  const loginForm = document.getElementById('loginForm');
  if (!loginForm) return;

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const matriculaOId = e.target.matricula.value.trim();
    const contrasena = e.target.contrasena.value.trim();

    const usuarioValido = authModel.validateUser(matriculaOId, contrasena);

    if (usuarioValido) {
      authModel.setCurrentUser({
        nombre: usuarioValido.nombre,
        rol: usuarioValido.rol,
        id: usuarioValido.id,
      });
      window.location.href = 'menuInicio.html';
    } else {
      alert('ID/Matrícula o contraseña incorrecta.');
    }
  });
});