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
        
        if (targetSection === 'registro-entradas-salidas') {
          cargarRegistroEntradasSalidas();
        } else if (targetSection === 'mesas-salud') {
          cargarMesasSalud();
        }
      }
    });
  });

  async function cargarRegistroEntradasSalidas() {
    const registroESLista = document.getElementById('registroESLista');
    if (!registroESLista) return;
    
    const registros = await db.registrosES.toArray();
    
    if (registros.length === 0) {
      registroESLista.innerHTML = `
        <div style="text-align: center; color: #6b7280; font-size: 1.1rem; padding: 20px;">
          No hay registros de entradas/salidas.
        </div>
      `;
    } else {
      const usuarios = await db.usuarios.toArray();
      const usuariosMap = new Map(usuarios.map(u => [u.id, u]));

      registroESLista.innerHTML = registros.map(r => {
        const usuario = usuariosMap.get(r.usuarioId);
        return `
        <div class="registro-item">
          <h4>${usuario ? usuario.nombre : 'Usuario desconocido'}</h4>
          <p><strong>ID de Usuario:</strong> ${r.usuarioId || 'No especificado'}</p>
          <p><strong>Fecha:</strong> ${r.fecha || 'No registrada'}</p>
          <p><strong>Tipo:</strong> ${r.tipo || 'No especificado'}</p>
        </div>
      `}).join('');
    }
  }

  async function cargarMesasSalud() {
    const mesasGrid = document.getElementById('mesasGrid');
    if (!mesasGrid) return;
    
    const mesas = await db.mesasOperacion.toArray();
    const usuarios = await db.usuarios.toArray();
    const usuariosMap = new Map(usuarios.map(u => [u.id, u]));

    if (mesas.length === 0) {
        mesasGrid.innerHTML = `<div style="text-align: center; color: #6b7280; font-size: 1.1rem; padding: 20px;">No hay mesas de operación registradas.</div>`;
        return;
    }

    const mesasHTML = await Promise.all(mesas.map(async mesa => {
        let statusClass = 'en-servicio';
        let statusText = 'En Servicio';
        let asignadoHTML = '<p><strong>Sin asignar</strong></p>';
        let ultimaActividadHTML = '';

        const usuarioAsignado = usuarios.find(u => u.mesa === mesa.numero);
        if(usuarioAsignado) {
            asignadoHTML = `<p><strong>Asignado a:</strong> ${usuarioAsignado.nombre} ${usuarioAsignado.apellidos}</p>
                           <p><strong>Rol:</strong> ${usuarioAsignado.rol === 'admin' ? 'Administrador' : 'Practicante'}</p>`;
        }

        const ultimoRegistro = await db.registrosES.where('usuarioId').equals(usuarioAsignado ? usuarioAsignado.id : -1).last();

        if (ultimoRegistro) {
            ultimaActividadHTML = `<p><strong>Última actividad:</strong> ${ultimoRegistro.fecha}</p>`;
            if (ultimoRegistro.tipo === 'entrada') {
                statusClass = 'ocupada';
                statusText = 'Ocupada';
            }
        }
        
        return `
          <div class="mesa-item">
            <div class="mesa-numero">Mesa ${mesa.numero}</div>
            <div class="mesa-status ${statusClass}">${statusText}</div>
            <div class="mesa-info">
              ${asignadoHTML}
              ${ultimaActividadHTML}
            </div>
          </div>
        `;
      }));
    
    mesasGrid.innerHTML = mesasHTML.join('');
  }
});