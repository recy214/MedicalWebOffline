document.addEventListener('DOMContentLoaded', () => {
  // --- LÓGICA DE USUARIO Y NAVEGACIÓN ---
  const params = new URLSearchParams(window.location.search);
  const usuario = params.has('practicante') ? 'practicante' : 'admin';

  if (usuario === 'practicante') {
    const nuevoParams = new URLSearchParams();
    if (params.has('practicante')) nuevoParams.set('practicante', 'true');
    if (params.get('nombre')) nuevoParams.set('nombre', params.get('nombre'));
    window.location.href = `categoria-pacientes.html?${nuevoParams.toString()}`;
    return;
  }

  try {
    const usuarioActualLS = JSON.parse(localStorage.getItem('usuarioActual'));
    if (usuarioActualLS && usuarioActualLS.nombre) {
      document.getElementById('userName').textContent = usuarioActualLS.nombre;
    }
  } catch (e) {
    console.error("Error al leer datos de usuario:", e);
  }

  const userIcon = document.getElementById('userIcon');
  const userDropdown = document.getElementById('userDropdown');
  if (userIcon && userDropdown) {
    userIcon.addEventListener('click', function (e) {
      userDropdown.style.display = userDropdown.style.display === 'none' ? 'block' : 'none';
      e.stopPropagation();
    });
    document.body.addEventListener('click', function () {
      userDropdown.style.display = 'none';
    });
  }

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      window.location.href = 'index.html';
    });
  }

  const sidebarButtons = document.querySelectorAll('.sidebar-menu button');
  const sections = document.querySelectorAll('.form-section');
  const defaultSection = document.getElementById('default-section');

  sidebarButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetSection = this.getAttribute('data-section');
      
      sidebarButtons.forEach(btn => btn.classList.remove('active'));
      this.classList.add('active');
      
      if (defaultSection) {
        defaultSection.style.display = 'none';
      }
      
      sections.forEach(section => {
        section.classList.remove('active');
      });
      
      const activeSection = document.getElementById(`${targetSection}-section`);
      if (activeSection) {
        activeSection.classList.add('active');
        
        if (targetSection === 'personal') {
          cargarPersonal();
        }
      }
    });
  });

  const formUsuario = document.getElementById('formUsuario');
  if (formUsuario) {
    formUsuario.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(formUsuario);
      const usuarioData = Object.fromEntries(formData.entries());
      
      try {
        await db.usuarios.add(usuarioData);
        formUsuario.reset();
        mostrarConfirmacion('¡Usuario Registrado!', 'El usuario ha sido registrado correctamente en el sistema.');
        cargarPersonal();
      } catch (error) {
        console.error('Error al registrar el usuario:', error);
        alert('Error al registrar el usuario. La matrícula o ID ya podría existir.');
      }
    });
  }

  async function cargarPersonal() {
    const personalLista = document.getElementById('personalLista');
    if (!personalLista) return;
    
    const usuarios = await db.usuarios.toArray();
    
    if (usuarios.length === 0) {
      personalLista.innerHTML = `
        <div style="text-align: center; color: #6b7280; font-size: 1.1rem; padding: 20px;">
          No hay usuarios registrados en el sistema.
        </div>
      `;
    } else {
      personalLista.innerHTML = usuarios.map(u => `
        <div class="personal-item">
          <h4>${u.nombre || 'Sin nombre'} ${u.apellidos || ''}</h4>
          <p><strong>ID:</strong> ${u.id || 'No especificado'}</p>
          <p><strong>Matrícula:</strong> ${u.matricula || 'No especificada'}</p>
          <p><strong>Rol:</strong> ${u.rol === 'admin' ? 'Administrador' : 'Practicante'}</p>
          <p><strong>Edad:</strong> ${u.edad || 'No especificada'} años</p>
          <p><strong>Sexo:</strong> ${u.sexo === 'M' ? 'Masculino' : u.sexo === 'F' ? 'Femenino' : 'No especificado'}</p>
          ${u.mesa ? `<p><strong>Mesa de salud:</strong> ${u.mesa}</p>` : ''}
          <div class="personal-buttons">
            <button data-id="${u.id}" class="modificarUsuario">Modificar</button>
            <button data-id="${u.id}" class="eliminarUsuario">Eliminar</button>
          </div>
        </div>
      `).join('');
      
      agregarEventosBotones();
    }
  }

  function agregarEventosBotones() {
    const personalLista = document.getElementById('personalLista');
    if (personalLista) {
      personalLista.querySelectorAll('.modificarUsuario').forEach(btn => {
        btn.addEventListener('click', function() {
          alert('Funcionalidad de modificar no implementada.');
        });
      });
      
      personalLista.querySelectorAll('.eliminarUsuario').forEach(btn => {
        btn.addEventListener('click', async function() {
          const userId = this.getAttribute('data-id');
          if (confirm(`¿Estás seguro de que deseas eliminar al usuario con ID ${userId}?`)) {
            try {
              await db.usuarios.delete(userId);
              cargarPersonal();
            } catch (error) {
              console.error('Error al eliminar el usuario:', error);
            }
          }
        });
      });
    }
  }

  window.limpiarFormulario = function() {
    if (formUsuario) {
      formUsuario.reset();
    }
  };

  function mostrarConfirmacion(titulo, mensaje) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
      background: linear-gradient(135deg, rgba(125, 211, 252, 0.9), rgba(254, 243, 199, 0.9));
      z-index: 9999; justify-content: center; align-items: center;
    `;
    
    modal.innerHTML = `
      <div style="
        background: rgba(255, 255, 255, 0.98);
        padding: 30px;
        border-radius: 20px;
        min-width: 350px;
        max-width: 500px;
        text-align: center;
        box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3);
        border: 2px solid rgba(125, 211, 252, 0.4);
        position: relative;
        margin: 20px;
      ">
        <div style="margin-bottom: 20px; font-size: 3rem;">✅</div>
        <h3 style="
          margin: 0 0 15px 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: transparent;
          background: linear-gradient(135deg, #06b6d4, #10b981);
          -webkit-background-clip: text;
          background-clip: text;
        ">${titulo}</h3>
        <p style="
          margin: 0 0 25px 0;
          font-size: 1.1rem;
          color: #374151;
          line-height: 1.5;
        ">${mensaje}</p>
        <button onclick="this.closest('div[style*=\'position: fixed\']').remove()" style="
          background: linear-gradient(135deg, #7dd3fc, #fef3c7);
          color: #1f2937;
          border: none;
          border-radius: 25px;
          padding: 12px 30px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 6px 20px rgba(125, 211, 252, 0.3);
        ">Aceptar</button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  // Cargar personal al inicio
  const personalSection = document.getElementById('personal-section');
  if (personalSection && personalSection.classList.contains('active')) {
    cargarPersonal();
  }
});