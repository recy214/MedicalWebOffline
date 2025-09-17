// js/views/activityView.js
import { authModel } from '../models/storageModel.js';

// Función para formatear la fecha y hora en un formato legible
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit',
    second: '2-digit'
  };
  return date.toLocaleDateString('es-ES', options);
}

export function renderActivityLog(containerId, filtro = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const registros = authModel.obtenerRegistros(filtro);
  const usuarios = authModel.getUsers();
  
  if (registros.length === 0) {
    container.innerHTML = '<p class="text-muted">No hay registros de actividad.</p>';
    return;
  }
  
  // Función para obtener el nombre del usuario
  const getNombreUsuario = (usuarioId) => {
    const user = usuarios.find(u => u.id === usuarioId);
    return user ? `${user.nombre} (${user.matricula})` : usuarioId;
  };
  
  // Generar la tabla HTML
  let html = `
    <div style="max-height: 400px; overflow-y: auto;">
      <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
        <thead>
          <tr style="background: #f5f5f5; font-weight: bold; text-align: left;">
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Usuario</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Acción</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Fecha y Hora</th>
            <th style="padding: 10px; border-bottom: 1px solid #ddd;">Detalles</th>
          </tr>
        </thead>
        <tbody>
  `;
  
  registros.forEach(reg => {
    const tipoIcon = reg.tipo === 'entrada' ? '🟢' : '🔴';
    const tipoText = reg.tipo === 'entrada' ? 'Entrada' : 'Salida';
    
    html += `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${getNombreUsuario(reg.usuarioId)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${tipoIcon} ${tipoText}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${formatDate(reg.timestamp)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${reg.detalles || '-'}</td>
      </tr>
    `;
  });
  
  html += `
        </tbody>
      </table>
    </div>
    <div style="margin-top: 15px;">
      <button id="btnExportarRegistro" style="padding: 8px 16px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">
        Exportar a CSV
      </button>
    </div>
  `;
  
  container.innerHTML = html;
  
  // Configurar el botón de exportación
  const btnExportar = document.getElementById('btnExportarRegistro');
  if (btnExportar) {
    btnExportar.addEventListener('click', () => {
      exportToCSV(registros, usuarios);
    });
  }
}

// Función para exportar a CSV
function exportToCSV(registros, usuarios) {
  // Cabeceras CSV
  let csv = 'Usuario,Matrícula,Acción,Fecha y Hora,Detalles\n';
  
  // Datos
  registros.forEach(reg => {
    const user = usuarios.find(u => u.id === reg.usuarioId) || { nombre: 'Desconocido', matricula: 'N/A' };
    const fecha = formatDate(reg.timestamp);
    const tipo = reg.tipo === 'entrada' ? 'Entrada' : 'Salida';
    const detalles = reg.detalles || '';
    
    // Escapar las comas en los campos
    const escaparComa = (texto) => `"${texto.replace(/"/g, '""')}"`;
    
    csv += `${escaparComa(user.nombre)},${escaparComa(user.matricula)},${tipo},${fecha},${escaparComa(detalles)}\n`;
  });
  
  // Crear y descargar el archivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  link.setAttribute('href', url);
  link.setAttribute('download', `registro_actividad_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}