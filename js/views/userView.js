// js/views/userView.js
import { authModel } from '../models/storageModel.js';

const personalLista = document.getElementById('personalLista');
const modalPersonal = document.getElementById('modalPersonal');
const cerrarPersonal = document.getElementById('cerrarPersonal');

export function renderUserList() {
  const usuarios = authModel.getUsers();
  personalLista.innerHTML = '<ul style="list-style:none; padding:0;">' +
    usuarios.map((u, i) => `
      <li style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
        <b>Nombre:</b> ${u.nombre || ''} <br>
        <b>Matrícula:</b> ${u.matricula || ''} <br>
        <b>Rol:</b> ${u.rol || ''} <br>
        <div style="display:flex; gap:10px; margin-top:10px;">
          <button data-index="${i}" class="editarUsuario" style="color: #1976d2; background:none; border:1px solid #1976d2; padding:5px 10px; width:auto;">Editar</button>
          <button data-index="${i}" class="eliminarUsuario" style="color: white; background:#ff3333; padding:5px 10px; width:auto;">Eliminar</button>
        </div>
      </li>
    `).join('') + '</ul>';
}

export function setupUserForm() {
    const formUsuario = document.getElementById('formUsuario');
    const modalUsuario = document.getElementById('modalUsuario');
    const tituloModal = document.querySelector('#modalUsuario h3');
    const submitBtn = formUsuario.querySelector('button[type="submit"]');
    const btnCancelar = document.getElementById('btnCancelarUsuario');

    // Manejar el envío del formulario
    formUsuario.onsubmit = function(e) {
      e.preventDefault();
      const datos = Object.fromEntries(new FormData(formUsuario).entries());
      const userIndex = formUsuario.getAttribute('data-edit-index');
      
      let success = false;
      
      if (userIndex !== null && userIndex !== undefined) {
        // Modo edición
        success = authModel.updateUser(userIndex, datos);
        if (success) {
          alert('Usuario actualizado correctamente');
        }
      } else {
        // Modo creación
        success = authModel.addUser(datos);
        if (success) {
          alert('Usuario registrado correctamente');
        }
      }
      
      if (success) {
        modalUsuario.style.display = 'none';
        formUsuario.reset();
        formUsuario.removeAttribute('data-edit-index');
        renderUserList();
      }
    };

    // Manejar el botón de cancelar
    const cancelarUsuarioBtn = document.getElementById('cancelarUsuario');
    if (cancelarUsuarioBtn) {
      cancelarUsuarioBtn.onclick = function(e) {
        e.preventDefault();
        modalUsuario.style.display = 'none';
        formUsuario.reset();
        formUsuario.removeAttribute('data-edit-index');
      };
    }

    // Manejar el cierre del modal (X)
    const cerrarUsuario = document.getElementById('cerrarUsuario');
    if (cerrarUsuario) {
      cerrarUsuario.onclick = function() {
        modalUsuario.style.display = 'none';
        formUsuario.reset();
        formUsuario.removeAttribute('data-edit-index');
      };
    }
    
    // También cerrar el modal al hacer clic fuera de él
    modalUsuario.addEventListener('click', function(e) {
      if (e.target === modalUsuario) {
        modalUsuario.style.display = 'none';
        formUsuario.reset();
        formUsuario.removeAttribute('data-edit-index');
      }
    });
}

export function openEditUserForm(userIndex) {
    const formUsuario = document.getElementById('formUsuario');
    const modalUsuario = document.getElementById('modalUsuario');
    const tituloModal = document.querySelector('#modalUsuario h3');
    const submitBtn = formUsuario.querySelector('button[type="submit"]');
    
    const user = authModel.getUserByIndex(userIndex);
    if (!user) return;
    
    // Actualizar título y botón
    if (tituloModal) tituloModal.textContent = 'Editar Usuario';
    if (submitBtn) submitBtn.textContent = 'Guardar Cambios';
    
    // Establecer valores en el formulario
    formUsuario.setAttribute('data-edit-index', userIndex);
    
    // Llenar el formulario con los datos del usuario
    for (const key in user) {
        const input = formUsuario.elements[key];
        if (input) {
            input.value = user[key];
        }
    }
    
    // Mostrar modal
    modalUsuario.style.display = 'flex';
}

cerrarPersonal.addEventListener('click', () => {
  modalPersonal.style.display = 'none';
});

personalLista.addEventListener('click', (e) => {
  if (e.target.classList.contains('eliminarUsuario')) {
    const userIndex = e.target.getAttribute('data-index');
    if (confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      authModel.deleteUser(userIndex);
      renderUserList();
    }
  } else if (e.target.classList.contains('editarUsuario')) {
    const userIndex = e.target.getAttribute('data-index');
    openEditUserForm(userIndex);
  }
});

// Actualizar modo del formulario al abrir para nuevo usuario
export function resetFormForNewUser() {
    const formUsuario = document.getElementById('formUsuario');
    const modalUsuario = document.getElementById('modalUsuario');
    const tituloModal = document.querySelector('#modalUsuario h3');
    const submitBtn = formUsuario.querySelector('button[type="submit"]');
    
    if (tituloModal) tituloModal.textContent = 'Registrar Nuevo Usuario';
    if (submitBtn) submitBtn.textContent = 'Registrar';
    
    formUsuario.reset();
    formUsuario.removeAttribute('data-edit-index');
    
    // Asegurarnos de que todos los campos estén habilitados
    formUsuario.querySelectorAll('input, select').forEach(input => {
        input.disabled = false;
    });
    
    // Mostrar el modal
    if (modalUsuario) modalUsuario.style.display = 'flex';
}