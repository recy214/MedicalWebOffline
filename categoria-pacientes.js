// categoria-pacientes.js
// Lógica para la gestión de pacientes con agrupación y formularios de seguimiento

document.addEventListener('DOMContentLoaded', () => {
    // --- LÓGICA DE USUARIO Y NAVEGACIÓN ---
    const params = new URLSearchParams(window.location.search);
    const usuario = params.has('practicante') ? 'practicante' : 'admin';

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

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        if (usuario === 'practicante') {
            backBtn.style.display = 'none';
        } else {
            backBtn.addEventListener('click', function () {
                window.history.back();
            });
        }
    }

    const sidebarButtons = document.querySelectorAll('.sidebar-menu button');
    const sections = document.querySelectorAll('.form-section, .content-section');
    const defaultSection = document.getElementById('default-section');

    sidebarButtons.forEach(button => {
        button.addEventListener('click', function () {
            const targetSectionId = this.getAttribute('data-section');
            sidebarButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            if (defaultSection) {
                defaultSection.style.display = 'none';
            }
            sections.forEach(section => {
                section.classList.remove('active');
            });
            const activeSection = document.getElementById(`${targetSectionId}-section`);
            if (activeSection) {
                activeSection.classList.add('active');
            }
            // Si se hace clic en "Ingresar nuevo paciente", reseteamos el formulario
            if(targetSectionId === 'nuevo-paciente') {
                resetearFormularioCompleto();
            }
        });
    });

    const historialBtn = document.querySelector('button[data-section="historial"]');
    if (historialBtn) {
        historialBtn.click();
    }

    // --- LÓGICA REESTRUCTURADA PARA EXPEDIENTES DE PACIENTES ---
    const form = document.getElementById('patient-form');
    const errorMessage = document.getElementById('error-message');
    const historyBody = document.getElementById('history-body');
    const modal = document.getElementById('historialModal');
    const modalPatientName = document.getElementById('modalPatientName');
    const modalHistoryBody = document.getElementById('modalHistoryBody');
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const personalDataInputs = ['nombreCompleto', 'edad', 'sexo', 'matricula', 'semestre', 'carrera', 'contacto'];
    
    cargarYMostrarPacientes();

    const pesoInput = document.getElementById('peso');
    const alturaInput = document.getElementById('altura');
    if (pesoInput) pesoInput.addEventListener('input', calcularYMostrarIMC);
    if (alturaInput) alturaInput.addEventListener('input', calcularYMostrarIMC);

    if (form) {
        form.addEventListener('submit', (event) => {
            event.preventDefault();
            validarYGuardarDatos();
        });
    }

    if (historyBody) {
        historyBody.addEventListener('click', function (event) {
            const target = event.target;
            if (target.classList.contains('delete-btn')) {
                const matricula = target.getAttribute('data-matricula');
                borrarPacienteCompleto(matricula);
            }
            if (target.classList.contains('view-history-btn')) {
                const matricula = target.getAttribute('data-matricula');
                mostrarHistorialDePaciente(matricula);
            }
            if (target.classList.contains('follow-up-btn')) {
                const matricula = target.getAttribute('data-matricula');
                prepararFormularioDeSeguimiento(matricula);
            }
        });
    }
    
    if (modalCloseBtn) {
        modalCloseBtn.addEventListener('click', () => modal.style.display = 'none');
    }
    
    if (modalHistoryBody) {
        modalHistoryBody.addEventListener('click', function(event) {
            const target = event.target;
            if (target.classList.contains('delete-record-btn')) {
                const matricula = target.getAttribute('data-matricula');
                const fecha = target.getAttribute('data-fecha');
                borrarRegistroIndividual(matricula, fecha);
            }
        });
    }

    function prepararFormularioDeSeguimiento(matricula) {
        let pacientes = JSON.parse(localStorage.getItem('expedientesPacientes')) || {};
        const paciente = pacientes[matricula];
        if (!paciente) return;

        personalDataInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.value = paciente.datosPersonales[id] || '';
                input.disabled = true;
            }
        });
        
        const botonNuevoPaciente = document.querySelector('button[data-section="nuevo-paciente"]');
        if (botonNuevoPaciente) {
            botonNuevoPaciente.click();
        }
    }

    function resetearFormularioCompleto() {
        if(form) form.reset();
        personalDataInputs.forEach(id => {
            const input = document.getElementById(id);
            if (input) {
                input.disabled = false;
            }
        });
        const imcResultado = document.getElementById('imc-resultado');
        if (imcResultado) imcResultado.textContent = '---';
    }

    function guardarRegistro(registro) {
        let pacientes = JSON.parse(localStorage.getItem('expedientesPacientes')) || {};
        const matricula = registro.matricula;

        if (pacientes[matricula]) {
            pacientes[matricula].historial.unshift(registro);
            pacientes[matricula].datosPersonales = {
                nombreCompleto: registro.nombreCompleto,
                edad: registro.edad,
                carrera: registro.carrera,
                matricula: registro.matricula,
                sexo: registro.sexo,
                semestre: registro.semestre,
                contacto: registro.contacto
            };
        } else {
            pacientes[matricula] = {
                datosPersonales: {
                    nombreCompleto: registro.nombreCompleto,
                    edad: registro.edad,
                    carrera: registro.carrera,
                    matricula: registro.matricula,
                    sexo: registro.sexo,
                    semestre: registro.semestre,
                    contacto: registro.contacto
                },
                historial: [registro]
            };
        }
        localStorage.setItem('expedientesPacientes', JSON.stringify(pacientes));
    }

    function cargarYMostrarPacientes() {
        if (!historyBody) return;
        let pacientes = JSON.parse(localStorage.getItem('expedientesPacientes')) || {};
        historyBody.innerHTML = '';

        for (const matricula in pacientes) {
            const paciente = pacientes[matricula];
            const registroMasReciente = paciente.historial[0];

            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${registroMasReciente.fecha}</td>
                <td>${paciente.datosPersonales.nombreCompleto}</td>
                <td>${paciente.datosPersonales.matricula}</td>
                <td>${paciente.datosPersonales.carrera}</td>
                <td>${paciente.datosPersonales.edad}</td>
                <td>${registroMasReciente.peso}</td>
                <td>${registroMasReciente.altura}</td>
                <td>${registroMasReciente.imc}</td>
                <td>
                    <button class="follow-up-btn" data-matricula="${matricula}" style="cursor:pointer; padding: 4px 8px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #10b981; background-color: #d1fae5; display: block; width: 100%; margin-bottom: 5px;">Añadir Seguimiento</button>
                    <button class="view-history-btn" data-matricula="${matricula}" style="cursor:pointer; padding: 4px 8px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #007bff; background-color: #e7f3ff; display: block; width: 100%; margin-bottom: 5px;">Ver Historial</button>
                    <button class="delete-btn" data-matricula="${matricula}" style="cursor:pointer; padding: 4px 8px; font-size: 0.8rem; border-radius: 4px; border: 1px solid #ffaaaa; background-color: #ffdddd; display: block; width: 100%;">Borrar Paciente</button>
                </td>
            `;
            historyBody.appendChild(fila);
        }
    }
    
    function mostrarHistorialDePaciente(matricula) {
        let pacientes = JSON.parse(localStorage.getItem('expedientesPacientes')) || {};
        const paciente = pacientes[matricula];
        if (!paciente) return;

        modalPatientName.textContent = `Historial de: ${paciente.datosPersonales.nombreCompleto}`;
        modalHistoryBody.innerHTML = '';
        
        paciente.historial.forEach(registro => {
            const fila = document.createElement('tr');
            fila.innerHTML = `
                <td>${registro.fecha}</td>
                <td>${registro.sexo}</td>
                <td>${registro.semestre}</td>
                <td>${registro.contacto}</td>
                <td>${registro.peso}</td>
                <td>${registro.altura}</td>
                <td>${registro.imc}</td>
                <td>${registro.presion}</td>
                <td>${registro.glucosa}</td>
                <td>${registro.temperatura}</td>
                <td>
                    <button class="delete-record-btn" data-matricula="${matricula}" data-fecha="${registro.fecha}" style="cursor:pointer; padding: 3px 8px; font-size: 0.8rem; background-color: #ffdddd; border: 1px solid #ffaaaa; border-radius: 4px;">
                      Borrar
                    </button>
                </td>
            `;
            modalHistoryBody.appendChild(fila);
        });
        
        modal.style.display = 'flex';
    }

    function borrarPacienteCompleto(matricula) {
        if (confirm(`¿Estás seguro de que deseas eliminar al paciente con matrícula ${matricula} y todo su historial?`)) {
            let pacientes = JSON.parse(localStorage.getItem('expedientesPacientes')) || {};
            delete pacientes[matricula];
            localStorage.setItem('expedientesPacientes', JSON.stringify(pacientes));
            cargarYMostrarPacientes();
        }
    }
    
    function borrarRegistroIndividual(matricula, fecha) {
         if (confirm(`¿Estás seguro de que deseas eliminar el registro del ${fecha}?`)) {
            let pacientes = JSON.parse(localStorage.getItem('expedientesPacientes')) || {};
            if (pacientes[matricula]) {
                pacientes[matricula].historial = pacientes[matricula].historial.filter(reg => reg.fecha !== fecha);
                
                if (pacientes[matricula].historial.length === 0) {
                    delete pacientes[matricula];
                }

                localStorage.setItem('expedientesPacientes', JSON.stringify(pacientes));
                
                if (!pacientes[matricula]) {
                    modal.style.display = 'none';
                } else {
                    mostrarHistorialDePaciente(matricula);
                }
                cargarYMostrarPacientes();
            }
        }
    }

    function validarYGuardarDatos() {
        const imcResultado = document.getElementById('imc-resultado');
        const registroCompleto = {
            // Datos personales
            nombreCompleto: document.getElementById('nombreCompleto').value.trim(),
            edad: document.getElementById('edad').value.trim(),
            sexo: document.getElementById('sexo').value,
            matricula: document.getElementById('matricula').value.trim(),
            semestre: document.getElementById('semestre').value.trim(),
            carrera: document.getElementById('carrera').value.trim(),
            contacto: document.getElementById('contacto').value.trim(),
            // Datos médicos
            peso: document.getElementById('peso').value.trim(),
            altura: document.getElementById('altura').value.trim(),
            presion: document.getElementById('presion').value.trim(),
            glucosa: document.getElementById('glucosa').value.trim(),
            temperatura: document.getElementById('temperatura').value.trim(),
            imc: imcResultado ? imcResultado.textContent : '---',
            fecha: new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' })
        };
        
        let errores = [];
        if (registroCompleto.nombreCompleto === '') errores.push('El nombre y apellidos son requeridos.');
        if (!registroCompleto.edad || isNaN(registroCompleto.edad) || parseInt(registroCompleto.edad) <= 0) errores.push('La edad debe ser un número positivo.');
        if (registroCompleto.sexo === '') errores.push('Debes seleccionar el sexo.');
        if (registroCompleto.matricula === '') errores.push('La matrícula es requerida.');
        if (!registroCompleto.semestre || isNaN(registroCompleto.semestre) || parseInt(registroCompleto.semestre) <= 0) errores.push('El semestre debe ser un número positivo.');
        if (registroCompleto.carrera === '') errores.push('La carrera es requerida.');
        if (registroCompleto.contacto === '') errores.push('El contacto es requerido.');
        if (!registroCompleto.peso || isNaN(registroCompleto.peso) || parseFloat(registroCompleto.peso) <= 0) errores.push('El peso debe ser un número positivo.');
        if (!registroCompleto.altura || isNaN(registroCompleto.altura) || parseFloat(registroCompleto.altura) <= 0) errores.push('La altura debe ser un número positivo.');
        if (registroCompleto.presion === '') errores.push('La presión arterial es requerida.');

        if (errores.length > 0) {
          errorMessage.innerHTML = errores.join('<br>');
          errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
            guardarRegistro(registroCompleto);
            cargarYMostrarPacientes();
            resetearFormularioCompleto();
            mostrarConfirmacion('Registro Exitoso', 'Los datos del paciente se han guardado correctamente.');
            if(historialBtn) historialBtn.click();
        }
    }
    
    function calcularYMostrarIMC() {
        const pesoInput = document.getElementById('peso');
        const alturaInput = document.getElementById('altura');
        const imcResultado = document.getElementById('imc-resultado');
        if (!pesoInput || !alturaInput || !imcResultado) return;
        
        const peso = parseFloat(pesoInput.value);
        const alturaCm = parseFloat(alturaInput.value);

        if (peso > 0 && alturaCm > 0) {
            const alturaM = alturaCm / 100;
            const imc = peso / (alturaM * alturaM);
            imcResultado.textContent = imc.toFixed(2);
        } else {
            imcResultado.textContent = '---';
        }
    }

    function mostrarConfirmacion(titulo, mensaje) {
        const modal = document.createElement('div');
        modal.style.cssText = `
          display: flex; position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
          background: linear-gradient(135deg, rgba(125, 211, 252, 0.9), rgba(254, 243, 199, 0.9));
          z-index: 9999; justify-content: center; align-items-center;
        `;
        
        modal.innerHTML = `
          <div style="background: rgba(255, 255, 255, 0.98); padding: 30px; border-radius: 20px; min-width: 350px; max-width: 500px; text-align: center; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.3); border: 2px solid rgba(125, 211, 252, 0.4); position: relative; margin: 20px;">
            <div style="margin-bottom: 20px; font-size: 3rem;">✅</div>
            <h3 style="margin: 0 0 15px 0; font-size: 1.5rem; font-weight: 700; color: transparent; background: linear-gradient(135deg, #06b6d4, #10b981); -webkit-background-clip: text; background-clip: text;">${titulo}</h3>
            <p style="margin: 0 0 25px 0; font-size: 1.1rem; color: #374151; line-height: 1.5;">${mensaje}</p>
            <button onclick="this.closest('div[style*=\\'position: fixed\\']').remove()" style="background: linear-gradient(135deg, #7dd3fc, #fef3c7); color: #1f2937; border: none; border-radius: 25px; padding: 12px 30px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: all 0.3s ease; box-shadow: 0 6px 20px rgba(125, 211, 252, 0.3);">Aceptar</button>
          </div>
        `;
        
        document.body.appendChild(modal);
    }
});