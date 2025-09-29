document.addEventListener('DOMContentLoaded', async () => {
  const startServiceBtn = document.getElementById('startServiceBtn');
  const logoutBtn = document.getElementById('logoutBtn');
  let usuarioActual = null;
  try {
    usuarioActual = JSON.parse(localStorage.getItem('usuarioActual'));
  } catch (e) {}

  let servicioActivo = false;

  async function verificarServicioActivo() {
    if (!usuarioActual) return;
    const ultimoRegistro = await db.registrosES
      .where('usuarioId')
      .equals(usuarioActual.id)
      .last();
    
    servicioActivo = ultimoRegistro && ultimoRegistro.tipo === 'entrada';
    actualizarBoton();
  }

  function getFechaHora() {
    return new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });
  }

  async function iniciarServicio() {
    if (!usuarioActual) return;
    await db.registrosES.add({
      usuarioId: usuarioActual.id,
      fecha: getFechaHora(),
      tipo: 'entrada',
      estadoSinc: 'pendiente'
    });
    servicioActivo = true;
    actualizarBoton();
  }

  async function cerrarServicio() {
    if (!servicioActivo || !usuarioActual) return;
    await db.registrosES.add({
      usuarioId: usuarioActual.id,
      fecha: getFechaHora(),
      tipo: 'salida',
      estadoSinc: 'pendiente'
    });
    servicioActivo = false;
    actualizarBoton();
  }

  function actualizarBoton() {
    if (startServiceBtn) {
      startServiceBtn.textContent = servicioActivo ? 'Cerrar servicio' : 'Iniciar servicio';
    }
  }

  if (startServiceBtn) {
    verificarServicioActivo();
    startServiceBtn.onclick = function() {
      if (!servicioActivo) {
        iniciarServicio();
      } else {
        cerrarServicio();
      }
    };
  }

  if (logoutBtn) {
    const originalLogout = logoutBtn.onclick;
    logoutBtn.onclick = async function() {
      if (servicioActivo) {
        await cerrarServicio();
      }
      if (typeof originalLogout === 'function') {
        originalLogout();
      } else {
        window.location.href = 'index.html';
      }
    };
  }
});