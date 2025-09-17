// js/controllers/menuController.js
import { authModel } from '../models/storageModel.js';
import { renderUserList, setupUserForm, resetFormForNewUser } from '../views/userView.js';
import { renderMenu } from '../views/menuView.js';

document.addEventListener('DOMContentLoaded', () => {
  const usuarioActual = authModel.getCurrentUser();
  if (!usuarioActual) return;

  renderMenu(usuarioActual);

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      authModel.logout();
      window.location.href = 'index.html';
    };
  }

  if (usuarioActual.rol === 'admin') {
    const btnPersonal = document.querySelector('.menu button:nth-child(3)');
    if(btnPersonal){
        btnPersonal.addEventListener('click', () => {
          renderUserList();
          document.getElementById('modalPersonal').style.display = 'flex';
        });
    }
    
    setupUserForm();
    
    // Botón para añadir nuevo usuario desde el modal de personal
    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    if (btnNuevoUsuario) {
      btnNuevoUsuario.addEventListener('click', () => {
        resetFormForNewUser();
        document.getElementById('modalUsuario').style.display = 'flex';
      });
    }
    
    // Botón alternativo para añadir nuevo usuario (por si existe otro botón en el HTML)
    const btnRegistrarUsuario = document.getElementById('btnRegistrarUsuario');
    if (btnRegistrarUsuario) {
      btnRegistrarUsuario.addEventListener('click', () => {
        resetFormForNewUser();
        document.getElementById('modalUsuario').style.display = 'flex';
      });
    }
  }
});