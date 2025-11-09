// js/views/pacienteView.js


//Vista para la gestión de pacientes

// Imports necesarios (descomentar cuando se implementen)
// import { pacienteModel } from '../models/pacienteModel.js';
// import { authModel } from '../models/storageModel.js';

// "Mini-Modelo" para facultades y carreras.
// Se puede editar manualmente para agregar más.
const facultadesYCarreras = {
  "Facultad de Medicina de Tampico": [
    "Médico Cirujano"
  ],
  "Facultad de Enfermería de Tampico": [
    "Licenciatura en Enfermería"
  ],
  "Facultad de Odontología de Tampico": [
    "Médico Cirujano Dentista"
  ],
  "Facultad de Comercio y Administración de Tampico": [
    "Lic. en Administración",
    "Lic. en Contaduría Pública",
    "Lic. en Negocios Internacionales"
  ]
};

// TODO: Implementar funciones de la vista
export function renderHistorialMedico() {
  const section = document.getElementById('historial-section');
  if (!section) return;
  
  const html = `
    <div class="content-title">
      <i class="fas fa-file-medical-alt"></i>
      Historial Médico
    </div>
    
    <div class="historial-container">
      <div class="historial-filters">
        <div class="form-row">
          <div class="form-group col-md-4">
            <label for="filtroFechaPaciente">Filtrar por fecha:</label>
            <input type="date" id="filtroFechaPaciente" name="filtroFechaPaciente">
          </div>
          <div class="form-group col-md-4">
            <label for="filtroPacienteHistorial">Filtrar por paciente:</label>
            <select id="filtroPacienteHistorial" name="filtroPacienteHistorial">
              <option value="">Todos los pacientes</option>
            </select>
          </div>
          <div class="form-group col-md-4">
            <button class="btn-secondary" onclick="limpiarFiltrosHistorial()">
              🧹 Limpiar filtros
            </button>
          </div>
        </div>
      </div>
      
      <div class="historial-list" id="historialList">
        <!-- Contenido dinámico -->
      </div>
    </div>
  `;
  
  section.innerHTML = html;
}

export function renderPacienteForm() {
  const section = document.getElementById('nuevo-paciente-section');
  if (!section) return;
  
  const html = `
    <div class="content-title">
      <i class="fas fa-user-plus"></i>
      Registro de Nuevo Paciente
    </div>
    
    <form id="formNuevoPaciente" class="form-container">
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="matricula">Matrícula:</label>
          <input type="text" id="matricula" name="matricula" placeholder="Ej: EST001" required>
        </div>
        <div class="form-group col-md-6">
          <label for="nombres">Nombre(s):</label>
          <input type="text" id="nombres" name="nombres" placeholder="Nombre completo" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="apellidos">Apellidos:</label>
          <input type="text" id="apellidos" name="apellidos" placeholder="Apellidos completos" required>
        </div>
        <div class="form-group col-md-6">
          <label for="fechaNacimiento">Fecha de Nacimiento:</label>
          <input type="date" id="fechaNacimiento" name="fechaNacimiento" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="grado">Grado:</label>
          <select id="grado" name="grado" required>
            <option value="">Seleccione el grado</option>
            <option value="1er Semestre">1er Semestre</option>
            <option value="2do Semestre">2do Semestre</option>
            <option value="3er Semestre">3er Semestre</option>
            <option value="4to Semestre">4to Semestre</option>
            <option value="5to Semestre">5to Semestre</option>
            <option value="6to Semestre">6to Semestre</option>
            <option value="7mo Semestre">7mo Semestre</option>
            <option value="8vo Semestre">8vo Semestre</option>
            <option value="9no Semestre">9no Semestre</option>
            <option value="10mo Semestre">10mo Semestre</option>
          </select>
        </div>
        <div class="form-group col-md-6">
          <label for="grupo">Grupo:</label>
          <input type="text" id="grupo" name="grupo" placeholder="Ej: Grupo I" required>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="telefono">Teléfono:</label>
          <input type="tel" id="telefono" name="telefono" placeholder="Ej: 5551234567" required>
        </div>
        <div class="form-group col-md-6">
          <label for="antecedentes">Antecedentes Médicos (opcional):</label>
          <textarea id="antecedentes" name="antecedentes" rows="3"></textarea>
        </div>
      </div>
      
      <div class="form-row">
        <div class="form-group col-md-6">
          <label for="facultad">Facultad:</label>
          <select id="facultad" name="facultad" required>
            <option value="">Seleccione una facultad</option>
          </select>
        </div>
        <div class="form-group col-md-6">
          <label for="carrera">Carrera:</label>
          <select id="carrera" name="carrera" required disabled>
            <option value="">Seleccione una carrera</option>
          </select>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="reset" class="btn-secondary">Limpiar</button>
        <button type="submit" class="btn-primary">Registrar Paciente</button>
      </div>
    </form>
  `;
  
  section.innerHTML = html;

  // --- CAMARA / FOTO: elementos para tomar foto del paciente ---
  // Añadimos controles debajo del formulario para manejar cámara y preview.
  const formEl = document.getElementById('formNuevoPaciente');
  if (formEl) {
    // Crear bloque de cámara
    const cameraBlock = document.createElement('div');
    cameraBlock.className = 'camera-block detail-card';
    cameraBlock.style.marginTop = '12px';
    cameraBlock.innerHTML = `
      <h4>📷 Foto del Paciente (opcional)</h4>
      <div class="camera-grid" style="display:flex;gap:12px;align-items:flex-start;flex-wrap:wrap;">
        <div style="min-width:260px;">
          <video id="videoPreview" autoplay muted playsinline style="width:260px;height:195px;background:#000;border-radius:6px;display:none;object-fit:cover;border:1px solid #e5e7eb;"></video>
          <canvas id="photoCanvas" style="display:none;"></canvas>
          <img id="fotoPreview" src="" alt="Previsualización" style="width:96px;height:96px;border-radius:8px;object-fit:cover;border:1px solid #e5e7eb;background:#f3f4f6;display:inline-block;margin-top:8px;" />
        </div>
        <div style="flex:1;min-width:220px;">
          <p class="form-text">Puedes tomar una foto usando la cámara de la laptop. Si el paciente no desea usar su imagen, pulsa "Usar silueta" y no se guardará foto.</p>
          <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <button type="button" id="btnOpenCamera" class="btn-primary small-btn">Abrir cámara</button>
            <button type="button" id="btnTakePhoto" class="btn-primary small-btn" disabled>Tomar foto</button>
            <button type="button" id="btnUseSilhouette" class="btn-secondary small-btn">Usar silueta (sin foto)</button>
            <button type="button" id="btnRemovePhoto" class="btn-secondary small-btn" style="display:none;">Eliminar foto</button>
          </div>
          <input type="hidden" id="fotoDataUrl" name="foto">
        </div>
      </div>
    `;

    formEl.parentNode.insertBefore(cameraBlock, formEl.nextSibling);

    // Lógica de cámara
    (function(){
      const btnOpenCamera = document.getElementById('btnOpenCamera');
      const btnTakePhoto = document.getElementById('btnTakePhoto');
      const btnUseSilhouette = document.getElementById('btnUseSilhouette');
      const btnRemovePhoto = document.getElementById('btnRemovePhoto');
      const video = document.getElementById('videoPreview');
      const canvas = document.getElementById('photoCanvas');
      const fotoPreview = document.getElementById('fotoPreview');
      const inputFoto = document.getElementById('fotoDataUrl');
      let stream = null;

      async function startCamera() {
        try {
          if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Tu navegador no soporta acceso a cámara');
            return;
          }
          stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
          video.srcObject = stream;
          video.style.display = 'block';
          fotoPreview.style.display = inputFoto.value ? 'inline-block' : 'none';
          btnTakePhoto.disabled = false;
          btnRemovePhoto.style.display = inputFoto.value ? 'inline-block' : 'none';
        } catch (e) {
          console.error('No se pudo acceder a la cámara:', e);
          alert('No se pudo acceder a la cámara. Revisa permisos o usa otro navegador.');
        }
      }

      function stopCamera() {
        try {
          if (stream) {
            stream.getTracks().forEach(t => t.stop());
            stream = null;
          }
        } catch (e) { /* noop */ }
        video.style.display = 'none';
        btnTakePhoto.disabled = true;
      }

      function takePhoto() {
        try {
          const w = video.videoWidth || 640;
          const h = video.videoHeight || 480;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, w, h);
          const dataUrl = canvas.toDataURL('image/png');
          inputFoto.value = dataUrl;
          fotoPreview.src = dataUrl;
          fotoPreview.style.display = 'inline-block';
          btnRemovePhoto.style.display = 'inline-block';
          stopCamera();
        } catch (e) {
          console.error('Error tomando foto:', e);
          alert('No se pudo tomar la foto. Intenta nuevamente.');
        }
      }

      function useSilhouette() {
        // Borrar cualquier foto tomada
        inputFoto.value = '';
        fotoPreview.src = '';
        fotoPreview.style.display = 'inline-block';
        // Mostrar silueta gris
        fotoPreview.style.background = '#f3f4f6';
        fotoPreview.style.border = '1px solid #e5e7eb';
        btnRemovePhoto.style.display = 'none';
        stopCamera();
      }

      function removePhoto() {
        inputFoto.value = '';
        fotoPreview.src = '';
        fotoPreview.style.display = 'inline-block';
        fotoPreview.style.background = '#f3f4f6';
        btnRemovePhoto.style.display = 'none';
      }

      // Eventos
      btnOpenCamera.addEventListener('click', (e) => { e.preventDefault(); startCamera(); });
      btnTakePhoto.addEventListener('click', (e) => { e.preventDefault(); takePhoto(); });
      btnUseSilhouette.addEventListener('click', (e) => { e.preventDefault(); useSilhouette(); });
      btnRemovePhoto.addEventListener('click', (e) => { e.preventDefault(); removePhoto(); });

      // Detener cámara cuando se resetea el formulario
      formEl.addEventListener('reset', () => { stopCamera(); removePhoto(); });

      // Al salir de la página, asegurar stop
      window.addEventListener('beforeunload', () => { stopCamera(); });
    })();
  }

  // --- LÓGICA DE JAVASCRIPT PARA FACULTADES Y CARRERAS ---
  const facultadSelect = document.getElementById('facultad');
  const carreraSelect = document.getElementById('carrera');

  // Poblar el select de facultades
  Object.keys(facultadesYCarreras).forEach(facultad => {
    facultadSelect.add(new Option(facultad, facultad));
  });

  // Event listener para cambio de facultad
  facultadSelect.addEventListener('change', () => {
    const facultadSeleccionada = facultadSelect.value;
    carreraSelect.innerHTML = '<option value="">Seleccione una carrera</option>';

    if (facultadSeleccionada && facultadesYCarreras[facultadSeleccionada]) {
      carreraSelect.disabled = false;
      facultadesYCarreras[facultadSeleccionada].forEach(carrera => {
        carreraSelect.add(new Option(carrera, carrera));
      });
    } else {
      carreraSelect.disabled = true;
    }
  });
  // --- FIN DE LA LÓGICA ---

  // Configurar el evento de envío del formulario
  const formNuevoPaciente = document.getElementById('formNuevoPaciente');
  if (formNuevoPaciente) {
    formNuevoPaciente.addEventListener('submit', event => {
      import('../controllers/pacienteController.js').then(module => {
        module.handlePacienteSubmit(event);
      });
    });
  }
}

export function renderCitas() {
  const section = document.getElementById('citas-section');
  if (!section) return;
  
  const html = `
    <div class="content-title">
      <i class="fas fa-calendar-plus"></i>
      Gestión de Citas
    </div>
    
    <div class="citas-container">
      <div class="form-container">
        <form id="formNuevaCita">
          <div class="form-row">
            <div class="form-group col-md-6">
              <label for="pacienteCita">Paciente:</label>
              <select id="pacienteCita" name="pacienteCita" required>
                <option value="">Seleccione un paciente</option>
              </select>
            </div>
            <div class="form-group col-md-6">
              <label for="fechaCita">Fecha y Hora:</label>
              <input type="datetime-local" id="fechaCita" name="fechaCita" required>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group col-md-12">
              <label for="motivoCita">Motivo de la cita:</label>
              <textarea id="motivoCita" name="motivoCita" rows="3" required></textarea>
            </div>
          </div>
          
          <div class="form-actions">
            <button type="reset" class="btn-secondary">Limpiar</button>
            <button type="submit" class="btn-primary">Programar Cita</button>
          </div>
        </form>
      </div>
      
      <div class="citas-list" id="citasList">
        <!-- Lista de citas programadas -->
      </div>
    </div>
  `;
  
  section.innerHTML = html;
}