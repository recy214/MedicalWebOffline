// js/models/reporteModel.js
import { pacienteModel } from './pacienteModel.js';
import { authModel } from './storageModel.js';

export const reporteModel = {
  // Obtener estadísticas generales del sistema
  getEstadisticas: (periodo = 'mes') => {
    const pacientes = pacienteModel.getPacientes();
    const usuarios = authModel.getAllUsers();
    const citas = pacienteModel.getCitas();
    const historialMedico = pacienteModel.getHistorialMedico();
    const actividades = authModel.getActividades();
    
    // Fecha para filtrar por periodo
    const fechaLimite = getFechaLimite(periodo);
    
    // Filtrar datos por periodo si es necesario
    const pacientesRecientes = pacientes.filter(p => new Date(p.fechaRegistro) >= fechaLimite);
    const citasRecientes = citas.filter(c => new Date(c.fecha) >= fechaLimite);
    const consultasRecientes = historialMedico.filter(h => new Date(h.fecha) >= fechaLimite);
    const actividadesRecientes = actividades.filter(a => new Date(a.fecha) >= fechaLimite);
    
    // Estadísticas de género de pacientes
    const pacientesPorGenero = pacientes.reduce((acc, paciente) => {
      const genero = paciente.genero || 'No especificado';
      acc[genero] = (acc[genero] || 0) + 1;
      return acc;
    }, {});
    
    // Estadísticas de citas por estado
    const citasPorEstado = citas.reduce((acc, cita) => {
      const estado = cita.estado || 'No especificado';
      acc[estado] = (acc[estado] || 0) + 1;
      return acc;
    }, {});
    
    // Actividad por día (últimos 7 días)
    const actividadesPorDia = {};
    const hoy = new Date();
    
    // Inicializar los últimos 7 días
    for (let i = 6; i >= 0; i--) {
      const fecha = new Date(hoy);
      fecha.setDate(fecha.getDate() - i);
      const fechaStr = fecha.toISOString().split('T')[0];
      actividadesPorDia[fechaStr] = 0;
    }
    
    // Contar actividades por día
    actividades.forEach(actividad => {
      const fechaActividad = new Date(actividad.fecha);
      // Solo contamos actividades de los últimos 7 días
      if (fechaActividad >= new Date(hoy.setDate(hoy.getDate() - 7))) {
        const fechaStr = fechaActividad.toISOString().split('T')[0];
        if (actividadesPorDia[fechaStr] !== undefined) {
          actividadesPorDia[fechaStr]++;
        }
      }
    });
    
    return {
      general: {
        totalUsuarios: usuarios.length,
        usuariosActivos: usuarios.filter(u => u.estado === 'activo').length
      },
      pacientes: {
        totalPacientes: pacientes.length,
        pacientesNuevos: pacientesRecientes.length,
        totalCitas: citas.length,
        citasPendientes: citas.filter(c => c.estado === 'programada').length,
        totalConsultas: historialMedico.length,
        consultasRecientes: consultasRecientes.length,
        porGenero: pacientesPorGenero,
        citasPorEstado: citasPorEstado
      },
      actividades: {
        total: actividades.length,
        recientes: actividadesRecientes.length,
        porDia: actividadesPorDia
      }
    };
  },
  
  // Generar estadísticas personalizadas
  getEstadisticasPersonalizadas: (configuracion) => {
    const { periodo = 'mes', tipo = 'general' } = configuracion;
    const estadisticas = reporteModel.getEstadisticas(periodo);
    
    // Si solo se quiere un tipo específico de estadísticas, lo filtramos
    if (tipo !== 'general') {
      return { [tipo]: estadisticas[tipo] };
    }
    
    return estadisticas;
  },
  
  // Generar reporte de pacientes
  getReportePacientes: (filtro = {}) => {
    let pacientes = pacienteModel.getPacientes();
    
    // Aplicar filtros
    if (filtro.status) {
      pacientes = pacientes.filter(p => p.status === filtro.status);
    }
    
    if (filtro.genero) {
      pacientes = pacientes.filter(p => p.genero === filtro.genero);
    }
    
    if (filtro.edadMin || filtro.edadMax) {
      pacientes = pacientes.filter(p => {
        if (!p.fechaNacimiento) return true;
        
        const fechaNac = new Date(p.fechaNacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNac.getFullYear();
        
        if (filtro.edadMin && edad < filtro.edadMin) return false;
        if (filtro.edadMax && edad > filtro.edadMax) return false;
        
        return true;
      });
    }
    
    // Ordenar resultados
    if (filtro.ordenarPor) {
      pacientes = pacientes.sort((a, b) => {
        const campo = filtro.ordenarPor;
        const direccion = filtro.direccion === 'desc' ? -1 : 1;
        
        if (campo === 'fechaNacimiento' || campo === 'fechaRegistro') {
          return (new Date(a[campo]) - new Date(b[campo])) * direccion;
        }
        
        if (a[campo] < b[campo]) return -1 * direccion;
        if (a[campo] > b[campo]) return 1 * direccion;
        return 0;
      });
    }
    
    return pacientes;
  },
  
  // Generar reporte de citas
  getReporteCitas: (filtro = {}) => {
    let citas = pacienteModel.getCitas();
    
    // Aplicar filtros
    if (filtro.estado) {
      citas = citas.filter(c => c.estado === filtro.estado);
    }
    
    if (filtro.fecha) {
      const fechaFiltro = new Date(filtro.fecha).toISOString().split('T')[0];
      citas = citas.filter(c => {
        const fechaCita = new Date(c.fecha).toISOString().split('T')[0];
        return fechaCita === fechaFiltro;
      });
    }
    
    if (filtro.rangoFechas) {
      const fechaInicio = new Date(filtro.rangoFechas.inicio);
      const fechaFin = new Date(filtro.rangoFechas.fin);
      
      citas = citas.filter(c => {
        const fechaCita = new Date(c.fecha);
        return fechaCita >= fechaInicio && fechaCita <= fechaFin;
      });
    }
    
    if (filtro.pacienteId) {
      citas = citas.filter(c => c.pacienteId === filtro.pacienteId);
    }
    
    // Ordenar resultados
    if (filtro.ordenarPor) {
      citas = citas.sort((a, b) => {
        const campo = filtro.ordenarPor;
        const direccion = filtro.direccion === 'desc' ? -1 : 1;
        
        if (campo === 'fecha') {
          return (new Date(a.fecha) - new Date(b.fecha)) * direccion;
        }
        
        if (a[campo] < b[campo]) return -1 * direccion;
        if (a[campo] > b[campo]) return 1 * direccion;
        return 0;
      });
    }
    
    // Enriquecer con datos de pacientes
    return citas.map(cita => {
      const paciente = pacienteModel.getPaciente(cita.pacienteId);
      return {
        ...cita,
        pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellidos}` : 'Desconocido'
      };
    });
  },
  
  // Obtener historial médico para reportes
  getReporteHistorialMedico: (filtro = {}) => {
    let registros = pacienteModel.getHistorialMedico();
    
    if (filtro.pacienteId) {
      registros = registros.filter(r => r.pacienteId === filtro.pacienteId);
    }
    
    if (filtro.rangoFechas) {
      const fechaInicio = new Date(filtro.rangoFechas.inicio);
      const fechaFin = new Date(filtro.rangoFechas.fin);
      
      registros = registros.filter(r => {
        const fechaRegistro = new Date(r.fecha);
        return fechaRegistro >= fechaInicio && fechaRegistro <= fechaFin;
      });
    }
    
    // Ordenar por fecha más reciente primero por defecto
    registros = registros.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    // Enriquecer con datos de pacientes
    return registros.map(registro => {
      const paciente = pacienteModel.getPaciente(registro.pacienteId);
      return {
        ...registro,
        pacienteNombre: paciente ? `${paciente.nombre} ${paciente.apellidos}` : 'Desconocido'
      };
    });
  },
  
  // Generar reporte de actividad del sistema (solo registros de storageModel)
  getReporteActividades: (filtro = {}) => {
  // Usar solo los registros generados por storageModel/authModel con JWT
  const actividades = authModel.getActividades(filtro);
  // Filtrar solo los registros con sistemaAuth: 'JWT'
  return actividades.filter(a => a.sistemaAuth === 'JWT');
  },
  
  // Exportar a PDF (abre una vista imprimible; el usuario puede elegir "Guardar como PDF").
  // Genera un layout tipo informe médico: encabezado con título de la app, cada registro como lista,
  // el campo 'id' se omite visualmente y se añade un pie de página.
  exportarPDF: (datos, nombreArchivo) => {
    if (!datos || datos.length === 0) {
      return { success: false, message: 'No hay datos para exportar' };
    }
    const registros = Array.isArray(datos) ? datos : [datos];
    const appTitle = (typeof document !== 'undefined' && document.title) ? document.title : 'Medical App';

    // Helper: generar SVG simple (line) para una serie de valores {fecha,valor}
    function generarSVGSerie(puntos, opts = {}) {
      const width = opts.width || 520;
      const height = opts.height || 120;
      const padding = 8;
      if (!puntos || puntos.length === 0) {
        return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="${width/2}" y="${height/2}" font-size="12" text-anchor="middle" fill="#888">Sin datos</text></svg>`;
      }

      // Extraer valores numéricos
      const vals = puntos.map(p => Number(p.valor)).filter(v => !isNaN(v));
      if (vals.length === 0) return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg"><text x="${width/2}" y="${height/2}" font-size="12" text-anchor="middle" fill="#888">Sin datos numéricos</text></svg>`;

      const min = Math.min(...vals);
      const max = Math.max(...vals);
      const range = max - min || 1;

      // Mapear puntos a coordenadas
      const stepX = (width - padding * 2) / (vals.length - 1 || 1);
      const coords = vals.map((v, i) => {
        const x = padding + i * stepX;
        const y = padding + (height - padding * 2) * (1 - (v - min) / range);
        return { x, y, v };
      });

      const pathD = coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ');

      // Build simple svg with area fill and path
      const stroke = opts.stroke || '#06b6d4';
      const fill = opts.fill || 'rgba(6,182,212,0.12)';

      // Area path (close to bottom)
      const areaD = coords.map((c, i) => (i === 0 ? `M ${c.x} ${c.y}` : `L ${c.x} ${c.y}`)).join(' ') + ` L ${padding + (coords.length - 1) * stepX} ${height - padding} L ${padding} ${height - padding} Z`;

      // Labels: min/max
      const minLabel = min.toFixed(1);
      const maxLabel = max.toFixed(1);

      return `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" style="background:transparent">
          <defs>
            <linearGradient id="g${Math.random().toString(36).slice(2,8)}" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stop-color="${stroke}" stop-opacity="0.18" />
              <stop offset="100%" stop-color="${stroke}" stop-opacity="0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="transparent" />
          <path d="${areaD}" fill="url(#g${Math.random().toString(36).slice(2,8)})" stroke="none" />
          <path d="${pathD}" fill="none" stroke="${stroke}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <text x="${padding}" y="${padding + 10}" font-size="10" fill="#444">Max: ${maxLabel}</text>
          <text x="${padding}" y="${height - 4}" font-size="10" fill="#666">Min: ${minLabel}</text>
        </svg>
      `;
    }

    let html = `<!doctype html><html><head><meta charset="utf-8"><title>${nombreArchivo}</title>`;
    html += `<style>body{font-family:Arial,Helvetica,sans-serif;padding:24px;color:#111;background:#fff}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;border-bottom:1px solid #eee;padding-bottom:8px}header h1{font-size:20px;margin:0}header .meta{font-size:12px;color:#666}footer{position:fixed;left:0;right:0;bottom:0;padding:8px 24px;font-size:11px;color:#666;border-top:1px solid #eee;background:#fff}section.record{page-break-inside:avoid;margin-bottom:18px;padding:12px;border:1px solid #f0f0f0;border-radius:6px;background:#fff}section.record h2{margin:0 0 8px 0;font-size:16px}ul.record-list{list-style:none;padding:0;margin:0;display:block}ul.record-list li{padding:4px 0;border-bottom:1px dashed #f3f3f3;font-size:13px}ul.record-list li strong{display:inline-block;width:160px;color:#374151}</style>`;
    html += `</head><body>`;

    html += `<header><h1>${appTitle}</h1><div class="meta">Exportado: ${new Date().toLocaleString()}</div></header>`;

    registros.forEach((fila, idx) => {
      // Si el registro es un objeto enriquecido para exportar historial de un paciente
      if (fila && fila.paciente && fila.parametrosSeries) {
        const paciente = fila.paciente || {};
        html += `<section class="record">`;
        const tituloP = `${paciente.nombre || paciente.pacienteNombre || 'Paciente'} ${paciente.apellidos || ''}`.trim();
        html += `<h2>${tituloP}</h2>`;

        // Información básica del paciente
        html += `<ul class="record-list">`;
        if (paciente.matricula) html += `<li><strong>Matrícula:</strong> ${paciente.matricula}</li>`;
        if (paciente.fechaNacimiento) html += `<li><strong>Fecha de Nacimiento:</strong> ${paciente.fechaNacimiento}</li>`;
        if (paciente.facultad) html += `<li><strong>Facultad:</strong> ${paciente.facultad}</li>`;
        if (paciente.carrera) html += `<li><strong>Carrera:</strong> ${paciente.carrera}</li>`;
        html += `</ul>`;

        // Sección de gráficas por parámetro
        html += `<div style="margin-top:12px"><h3>Gráficas por parámetro</h3>`;
        const ps = fila.parametrosSeries || {};
        // temperatura
        html += `<div style="margin:8px 0"><strong>Temperatura (°C)</strong><div>${generarSVGSerie(ps.temperatura || [], { width:520, height:120, stroke: '#ef4444' })}</div></div>`;
        // peso
        html += `<div style="margin:8px 0"><strong>Peso (kg)</strong><div>${generarSVGSerie(ps.peso || [], { width:520, height:120, stroke: '#10b981' })}</div></div>`;
        // talla
        html += `<div style="margin:8px 0"><strong>Talla (cm)</strong><div>${generarSVGSerie(ps.talla || [], { width:520, height:120, stroke: '#3b82f6' })}</div></div>`;
        // frecuencia respiratoria
        html += `<div style="margin:8px 0"><strong>Frecuencia Respiratoria (rpm)</strong><div>${generarSVGSerie(ps.frecuenciaRespiratoria || [], { width:520, height:120, stroke: '#f59e0b' })}</div></div>`;
        // presión sistólica/diastólica
        html += `<div style="margin:8px 0;display:flex;gap:12px"><div style="flex:1"><strong>Presión Sistólica</strong><div>${generarSVGSerie(ps.presion_sistolica || [], { width:250, height:100, stroke: '#7c3aed' })}</div></div><div style="flex:1"><strong>Presión Diastólica</strong><div>${generarSVGSerie(ps.presion_diastolica || [], { width:250, height:100, stroke: '#a21caf' })}</div></div></div>`;
        html += `</div>`;

        // Observaciones del personal médico
        html += `<div style="margin-top:12px"><h3>Observaciones del personal médico</h3>`;
        const obs = fila.observaciones || [];
        if (obs.length === 0) {
          html += `<div class="muted-text">No hay observaciones registradas.</div>`;
        } else {
          html += `<ul class="record-list">`;
          obs.forEach(o => {
            const f = o.fecha ? new Date(o.fecha).toLocaleString() : '';
            html += `<li><strong>${f}</strong> — ${String(o.texto)}</li>`;
          });
          html += `</ul>`;
        }
        html += `</div>`;

        // Historial: listado cronológico si existe
        const hist = fila.historial || [];
        if (hist.length > 0) {
          html += `<div style="margin-top:12px"><h3>Historial</h3><ul class="record-list">`;
          hist.forEach(r => {
            const f = r.fecha ? new Date(r.fecha).toLocaleString() : '';
            const tipo = r.tipo || '';
            const notas = r.notas || r.descripcion || '';
            html += `<li><strong>${f} • ${tipo}</strong><div style="margin-left:8px;color:#333">${String(notas)}</div></li>`;
          });
          html += `</ul></div>`;
        }

        html += `</section>`;
        return; // pasar al siguiente
      }

      // Comportamiento por defecto (anteriores formatos)
      html += `<section class="record">`;
      const titulo = (fila.nombre || fila.pacienteNombre) ? `${fila.nombre || fila.pacienteNombre} ${fila.apellidos || ''}`.trim() : (fila.matricula || fila.pacienteNombre || `Registro ${idx + 1}`);
      html += `<h2>${titulo}</h2>`;
      html += `<ul class="record-list">`;

      Object.keys(fila).forEach(key => {
        const keyLower = key.toLowerCase();
        // ocultar campos de identificación que no deben verse en el PDF
        if (keyLower === 'id' || keyLower === 'pacienteid' || keyLower === 'paciente_id') return;

        let label = key;
        const labels = {
          matricula: 'Matrícula', nombre: 'Nombre', apellidos: 'Apellidos', fechaNacimiento: 'Fecha de Nacimiento', grado: 'Grado', grupo: 'Grupo', facultad: 'Facultad', carrera: 'Carrera', telefono: 'Teléfono', antecedentes: 'Antecedentes', fechaRegistro: 'Fecha de Registro', usuarioRegistro: 'Usuario Registro', pacienteNombre: 'Paciente', tipo: 'Tipo', fecha: 'Fecha', descripcion: 'Descripción'
        };
        if (labels[key]) label = labels[key];

        let valor = fila[key];
        if (valor === null || valor === undefined || valor === '') valor = '-';
        if (typeof valor === 'object' && !Array.isArray(valor)) {
          if (valor.temperatura || valor.presion || valor.peso || valor.talla) {
            const parts = [];
            if (valor.temperatura) parts.push(`Temperatura: ${valor.temperatura}°C`);
            if (valor.presion) parts.push(`Presión: ${valor.presion}`);
            if (valor.peso) parts.push(`Peso: ${valor.peso} kg`);
            if (valor.talla) parts.push(`Talla: ${valor.talla} cm`);
            valor = parts.join(' • ');
          } else {
            try { valor = JSON.stringify(valor); } catch (e) { valor = String(valor); }
          }
        }

        html += `<li><strong>${label}:</strong> ${String(valor)}</li>`;
      });

      html += `</ul>`;

      // Si el objeto paciente tiene historialCambios o datosMedicos, generar gráficas y observaciones
      const posiblePacienteId = fila.id || fila.matricula || fila.pacienteId;
      const tieneCambios = Array.isArray(fila.historialCambios) && fila.historialCambios.length > 0;
      const tieneDatosMedicos = fila.datosMedicos && Object.keys(fila.datosMedicos).length > 0;
      if (tieneCambios || tieneDatosMedicos) {
        // Construir series
        const ps = { temperatura: [], peso: [], talla: [], frecuenciaRespiratoria: [], presion_sistolica: [], presion_diastolica: [] };

        (fila.historialCambios || []).forEach(cambio => {
          const fecha = cambio.fecha || cambio.datos?.fechaRegistroMedico || null;
          const datos = cambio.datos || cambio;
          if (datos.temperatura) ps.temperatura.push({ fecha, valor: parseFloat(datos.temperatura) });
          if (datos.peso) ps.peso.push({ fecha, valor: parseFloat(datos.peso) });
          if (datos.talla) ps.talla.push({ fecha, valor: parseFloat(datos.talla) });
          if (datos.frecuenciaRespiratoria) ps.frecuenciaRespiratoria.push({ fecha, valor: parseFloat(datos.frecuenciaRespiratoria) });
          if (datos.presion) {
            const m = String(datos.presion).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
            if (m) { ps.presion_sistolica.push({ fecha, valor: parseInt(m[1]) }); ps.presion_diastolica.push({ fecha, valor: parseInt(m[2]) }); }
          }
        });

        // incluir datosMedicos actuales
        if (fila.datosMedicos && fila.datosMedicos.fechaRegistroMedico) {
          const dm = fila.datosMedicos;
          const fecha = dm.fechaRegistroMedico;
          if (dm.temperatura) ps.temperatura.push({ fecha, valor: parseFloat(dm.temperatura) });
          if (dm.peso) ps.peso.push({ fecha, valor: parseFloat(dm.peso) });
          if (dm.talla) ps.talla.push({ fecha, valor: parseFloat(dm.talla) });
          if (dm.frecuenciaRespiratoria) ps.frecuenciaRespiratoria.push({ fecha, valor: parseFloat(dm.frecuenciaRespiratoria) });
          if (dm.presion) {
            const m = String(dm.presion).match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
            if (m) { ps.presion_sistolica.push({ fecha, valor: parseInt(m[1]) }); ps.presion_diastolica.push({ fecha, valor: parseInt(m[2]) }); }
          }
        }

        Object.keys(ps).forEach(k => ps[k].sort((a,b) => new Date(a.fecha) - new Date(b.fecha)));

        html += `<div style="margin-top:12px"><h3>Gráficas por parámetro</h3>`;
        html += `<div style="margin:8px 0"><strong>Temperatura (°C)</strong><div>${generarSVGSerie(ps.temperatura || [], { width:520, height:120, stroke: '#ef4444' })}</div></div>`;
        html += `<div style="margin:8px 0"><strong>Peso (kg)</strong><div>${generarSVGSerie(ps.peso || [], { width:520, height:120, stroke: '#10b981' })}</div></div>`;
        html += `<div style="margin:8px 0"><strong>Talla (cm)</strong><div>${generarSVGSerie(ps.talla || [], { width:520, height:120, stroke: '#3b82f6' })}</div></div>`;
        html += `<div style="margin:8px 0"><strong>Frecuencia Respiratoria (rpm)</strong><div>${generarSVGSerie(ps.frecuenciaRespiratoria || [], { width:520, height:120, stroke: '#f59e0b' })}</div></div>`;
        html += `<div style="margin:8px 0;display:flex;gap:12px"><div style="flex:1"><strong>Presión Sistólica</strong><div>${generarSVGSerie(ps.presion_sistolica || [], { width:250, height:100, stroke: '#7c3aed' })}</div></div><div style="flex:1"><strong>Presión Diastólica</strong><div>${generarSVGSerie(ps.presion_diastolica || [], { width:250, height:100, stroke: '#a21caf' })}</div></div></div>`;
        html += `</div>`;

        // Observaciones desde historial central
        let observCentral = [];
        try {
          const allHist = pacienteModel.getHistorialMedico();
          observCentral = allHist.filter(h => (h.pacienteId === posiblePacienteId || h.pacienteId === fila.id || h.pacienteId === fila.matricula)).map(r => ({ fecha: r.fecha, texto: r.notas || r.descripcion || '' })).filter(o => o.texto);
        } catch(e) { observCentral = []; }

        html += `<div style="margin-top:12px"><h3>Observaciones del personal médico</h3>`;
        if (observCentral.length === 0) {
          html += `<div class="muted-text">No hay observaciones registradas.</div>`;
        } else {
          html += `<ul class="record-list">`;
          observCentral.forEach(o => { const f = o.fecha ? new Date(o.fecha).toLocaleString() : ''; html += `<li><strong>${f}</strong> — ${String(o.texto)}</li>`; });
          html += `</ul>`;
        }
        html += `</div>`;
      }

      html += `</section>`;
    });

    html += `<footer>${appTitle} • Generado el ${new Date().toLocaleString()}</footer>`;
    html += `</body></html>`;

    const newWin = window.open('', '_blank');
    if (!newWin) {
      return { success: false, message: 'No se pudo abrir la ventana de impresión. Desactive el bloqueador de ventanas emergentes.' };
    }

    newWin.document.open();
    newWin.document.write(html);
    newWin.document.close();

    setTimeout(() => {
      try { newWin.focus(); newWin.print(); } catch (e) { /* noop */ }
    }, 500);

    return { success: true, message: 'Se ha abierto la vista para imprimir. Use la opción "Guardar como PDF" en la impresora.' };
  }
};

// Función auxiliar para obtener la fecha límite según el periodo
function getFechaLimite(periodo) {
  const hoy = new Date();
  const fechaLimite = new Date(hoy);
  
  switch (periodo) {
    case 'semana':
      fechaLimite.setDate(hoy.getDate() - 7);
      break;
    case 'mes':
      fechaLimite.setMonth(hoy.getMonth() - 1);
      break;
    case 'trimestre':
      fechaLimite.setMonth(hoy.getMonth() - 3);
      break;
    case 'anio':
      fechaLimite.setFullYear(hoy.getFullYear() - 1);
      break;
    default:
      fechaLimite.setMonth(hoy.getMonth() - 1); // Por defecto, último mes
  }
  
  return fechaLimite;
}