// js/controllers/menuController.js
import { authModel } from '../models/storageModel.js';
import { renderUserList, setupUserForm, resetFormForNewUser } from '../views/userView.js';
import { renderMenu } from '../views/menuView.js';
import { renderActivityLog } from '../views/activityView.js';

document.addEventListener('DOMContentLoaded', () => {
  const usuarioActual = authModel.getCurrentUser();
  if (!usuarioActual) return;

  renderMenu(usuarioActual);

  // Configurar dropdown del usuario
  const userIcon = document.getElementById('userIcon');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userIcon && userDropdown) {
    userIcon.addEventListener('click', () => {
      userDropdown.style.display = userDropdown.style.display === 'block' ? 'none' : 'block';
    });
    
    // Cerrar dropdown al hacer clic fuera
    document.addEventListener('click', (e) => {
      if (!userIcon.contains(e.target) && !userDropdown.contains(e.target)) {
        userDropdown.style.display = 'none';
      }
    });
  }
  
  // Configurar botón de cierre de sesión
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.onclick = () => {
      if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        authModel.logout();
        window.location.href = 'index.html';
      }
    };
  }

  // Configurar botón de registro de entradas/salidas
  const btnRegistroES = document.querySelector('.menu button:nth-child(5)');
  if (btnRegistroES) {
    btnRegistroES.addEventListener('click', () => {
      renderActivityLog('registroESLista');
      document.getElementById('modalRegistroES').style.display = 'flex';
    });
  }
  
  // Configurar el cierre del modal de registros
  const cerrarRegistroES = document.getElementById('cerrarRegistroES');
  if (cerrarRegistroES) {
    cerrarRegistroES.addEventListener('click', () => {
      document.getElementById('modalRegistroES').style.display = 'none';
    });
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