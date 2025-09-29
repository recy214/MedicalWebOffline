document.addEventListener('DOMContentLoaded', () => {
  const btnRegistroES = document.querySelector('.menu button:nth-child(5)');
  const modalRegistroES = document.getElementById('modalRegistroES');
  const cerrarRegistroES = document.getElementById('cerrarRegistroES');
  const registroESLista = document.getElementById('registroESLista');

  if (btnRegistroES && modalRegistroES && cerrarRegistroES && registroESLista) {
    btnRegistroES.addEventListener('click', async () => {
      const registros = await db.registrosES.toArray();
      
      if (registros.length === 0) {
        registroESLista.innerHTML = '<p>No hay registros de entradas/salidas.</p>';
      } else {
        const usuarios = await db.usuarios.toArray();
        const usuariosMap = new Map(usuarios.map(u => [u.id, u]));

        registroESLista.innerHTML = '<ul style="list-style:none; padding:0;">' +
          registros.map(r => {
            const usuario = usuariosMap.get(r.usuarioId);
            return `
            <li style="margin-bottom:15px; border-bottom:1px solid #eee; padding-bottom:10px;">
              <b>Nombre:</b> ${usuario ? usuario.nombre : 'Usuario desconocido'} <br>
              <b>ID de Usuario:</b> ${r.usuarioId || ''} <br>
              <b>Fecha:</b> ${r.fecha || ''} <br>
              <b>Tipo:</b> ${r.tipo || ''} <br>
            </li>
          `}).join('') + '</ul>';
      }
      modalRegistroES.style.display = 'flex';
    });
    cerrarRegistroES.addEventListener('click', () => {
      modalRegistroES.style.display = 'none';
    });
  }
});