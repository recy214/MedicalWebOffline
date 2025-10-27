// js/views/MenuInicio.js
// Navegación de categorías en el menú de inicio con validación de permisos y Event Bus
// Controladores se cargan dinámicamente desde localStorage para soporte offline

import { authModel } from '../models/storageModel.js';
import eventBus, { EVENT_NAMES } from '../utils/eventBus.js';

// NOTA: Los controladores ya NO se importan estáticamente
// Se cargan dinámicamente desde localStorage para funcionar offline

// Configuración de permisos por categoría
const CATEGORY_PERMISSIONS = {
  'pacientes': ['admin', 'practicante'],
  'usuarios-personal': ['admin'], // Solo administradores
  'operaciones-control': ['admin', 'practicante'],
  'reportes': ['admin', 'practicante'],
  'gestion': ['admin'] // Solo administradores pueden acceder a Gestión Administrativa
};

document.addEventListener('DOMContentLoaded', () => {
  console.log('MenuInicio: Configurando navegación con validación de permisos');
  
  const usuario = authModel.getCurrentUser();
  if (!usuario) {
    console.error('MenuInicio: No hay usuario autenticado');
    return;
  }
  
  console.log(`MenuInicio: Usuario actual - ${usuario.nombre} (${usuario.rol})`);
  
  // Mostrar el botón de Gestión Administrativa solo para administradores
  const btnGestion = document.getElementById('btnGestion');
  if (btnGestion && usuario.rol === 'admin') {
    btnGestion.style.display = 'flex';
    console.log('MenuInicio: Botón de Gestión Administrativa habilitado para administrador');
  }
  
  // Configurar botones de navegación
  document.querySelectorAll('.menu button[data-category]').forEach(btn => {
    const category = btn.getAttribute('data-category');
    const allowedRoles = CATEGORY_PERMISSIONS[category];
    
    // Verificar si el usuario tiene permisos para esta categoría
    if (allowedRoles && !allowedRoles.includes(usuario.rol)) {
      // Deshabilitar botón si no tiene permisos
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      btn.title = 'No tienes permisos para acceder a esta sección';
      
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        eventBus.emit(EVENT_NAMES.PERMISSION_DENIED, {
          user: usuario,
          page: category,
          requiredRoles: allowedRoles
        });
        alert('No tienes permisos para acceder a esta sección.');
      });
      
      console.log(`MenuInicio: Sección '${category}' deshabilitada para rol '${usuario.rol}'`);
    } else {
      // Para operaciones-control no permitimos navegación desde el botón, sólo se usa el submenu
      if (category === 'operaciones-control') {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          console.log('MenuInicio: Click en operaciones-control bloqueado (no navega)');
          authModel.registrarActividad({ accion: 'navegacion-bloqueada', descripcion: 'Intento de navegación desde operaciones-control' });
        });
        console.log(`MenuInicio: Sección '${category}' habilitada pero click bloqueado (usa submenu)`);
      } else {
        // Configurar navegación SPA para otras categorías
        btn.addEventListener('click', (e) => {
          console.log('[DEBUG] Clic detectado en el menú. Elemento:', e.target);
          console.log(`[DEBUG] Destino solicitado: ${category}`);

          e.preventDefault();
          console.log('[DEBUG] event.preventDefault() llamado.');

          console.log(`MenuInicio: Navegando a categoría '${category}' (modo SPA)`);

          authModel.registrarActividad({ accion: 'navigation_spa', descripcion: `Navegación SPA a categoría: ${category}` });
          eventBus.emit(EVENT_NAMES.NAVIGATE_TO, { target: category, category: category, source: 'menu_button', spa: true });

          // Cargar contenido desde localStorage
          cargarContenidoPagina(category);
        });
        console.log(`MenuInicio: Sección '${category}' habilitada para rol '${usuario.rol}' (modo SPA)`);
      }
    }
  });

  // Configurar navegación SPA para enlaces del submenu
  configurarEnlacesSubmenu();

  // Configurar delegación de eventos global para todos los enlaces
  configurarDelegacionEventosGlobal();

  console.log('MenuInicio: Configuración de navegación SPA completada');
});

/**
 * Configurar delegación de eventos global para todos los enlaces
 * Maneja: navegación entre secciones, anclas internas, y vuelta al dashboard
 */
function configurarDelegacionEventosGlobal() {
  console.log('MenuInicio: Configurando delegación de eventos global para enlaces');

  document.body.addEventListener('click', function(event) {
    const enlace = event.target.closest('a'); // Busca el enlace <a> más cercano

    if (enlace) {
      console.log('[DEBUG] Clic detectado en elemento. Elemento:', event.target);
      const href = enlace.getAttribute('href');
      console.log('[DEBUG] href del enlace:', href);

      // Caso 1: Enlace entre secciones (contiene /pages/categoria-)
      if (href && href.includes('/pages/categoria-')) {
        console.log('[DEBUG] Enlace detectado como navegación a sección (/pages/categoria-)');

        event.preventDefault();
        console.log('[DEBUG] event.preventDefault() llamado.');

        // Extraer el destino del href
        const partes = href.split('/');
        const archivo = partes[partes.length - 1];
        // Remover query params y hash si existen
        const archivoLimpio = archivo.split('?')[0].split('#')[0];
        const destinoBase = archivoLimpio.split('.')[0];
        const destino = destinoBase.replace('categoria-', '');

        console.log(`[DEBUG] Destino solicitado: ${destino}`);
        console.log(`🔗 Clic interceptado para cargar sección: ${destino}`);

        // Registrar actividad
        authModel.registrarActividad({
          accion: 'navigation_link_spa',
          descripcion: `Navegación mediante enlace a: ${destino}`
        });

        // Cargar HTML y llamar al init() correcto
        cargarContenidoPagina(destino);
      }
      // Caso 2: Enlace de ancla interno (empieza con #)
      else if (href && href.startsWith('#')) {
        event.preventDefault(); // ¡Previene el intento de navegación offline!

        const targetId = href.substring(1); // Remover el #
        console.log(`⚓ Clic en ancla interna: ${href}. Previniendo navegación y haciendo scroll.`);

        // Buscar el elemento objetivo en el DOM
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
          // Hacer scroll suave al elemento
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log(`✅ Scroll exitoso a: #${targetId}`);

          // Registrar actividad
          authModel.registrarActividad({
            accion: 'anchor_navigation',
            descripcion: `Navegación a ancla interna: ${href}`
          });
        } else {
          console.warn(`⚠️ No se encontró el elemento con ID: ${targetId}`);
        }
      }
      // Caso 3: Volver al dashboard (ID específico o data-attribute)
      else if (enlace.id === 'enlace-volver-dashboard' || enlace.getAttribute('data-action') === 'volver-dashboard') {
        event.preventDefault();

        const contenedorDinamico = document.getElementById('contenido-dinamico');
        const container = document.querySelector('.container');

        if (contenedorDinamico && container) {
          contenedorDinamico.style.display = 'none';
          container.style.display = 'block';
          console.log('🏠 Volviendo al dashboard principal.');

          // Registrar actividad
          authModel.registrarActividad({
            accion: 'return_to_dashboard',
            descripcion: 'Regreso al dashboard principal'
          });

          // Emitir evento
          eventBus.emit(EVENT_NAMES.NAVIGATE_TO, {
            target: 'dashboard',
            source: 'return_link',
            spa: true
          });
        }
      }
      // Otros enlaces: No hacer nada, dejar comportamiento normal
      // (Enlaces externos, mailto:, tel:, etc.)
    }

    // Opcional: Manejo para botones con data-target-hash
    const botonAncla = event.target.closest('button[data-target-hash]');
    if (botonAncla) {
      const targetHash = botonAncla.getAttribute('data-target-hash');
      if (targetHash && targetHash.startsWith('#')) {
        const targetId = targetHash.substring(1);
        console.log(`⚓ Clic en botón para ancla interna: ${targetHash}`);

        const targetElement = document.getElementById(targetId);
        if (targetElement) {
          targetElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log(`✅ Scroll exitoso desde botón a: #${targetId}`);

          // Registrar actividad
          authModel.registrarActividad({
            accion: 'button_anchor_navigation',
            descripcion: `Navegación a ancla desde botón: ${targetHash}`
          });
        } else {
          console.warn(`⚠️ No se encontró el elemento con ID: ${targetId}`);
        }
      }
    }
  });

  console.log('✅ Delegación de eventos global configurada');
}

/**
 * Configurar event listeners para enlaces del submenu
 */
function configurarEnlacesSubmenu() {
  // Enlaces de Operaciones
  const linkEntrada = document.getElementById('link-operaciones-entrada');
  const linkSalida = document.getElementById('link-operaciones-salida');

  if (linkEntrada) {
    linkEntrada.addEventListener('click', (e) => {
      console.log('[DEBUG] Clic detectado en submenú. Elemento:', e.target);
      console.log('[DEBUG] Destino: operaciones, Sección: entrada-salida');

      e.preventDefault();
      console.log('[DEBUG] event.preventDefault() llamado.');

      console.log('MenuInicio: Navegando a Operaciones - Entrada/Salida (SPA)');
      cargarContenidoPagina('operaciones', 'entrada-salida');
    });
  }

  if (linkSalida) {
    linkSalida.addEventListener('click', (e) => {
      console.log('[DEBUG] Clic detectado en submenú. Elemento:', e.target);
      console.log('[DEBUG] Destino: operaciones, Sección: consultar-es');

      e.preventDefault();
      console.log('[DEBUG] event.preventDefault() llamado.');

      console.log('MenuInicio: Navegando a Operaciones - Consultar E/S (SPA)');
      cargarContenidoPagina('operaciones', 'consultar-es');
    });
  }

  // Enlaces de Reportes
  const linkReportesGeneral = document.getElementById('link-reportes-general');
  const linkReportesExportacion = document.getElementById('link-reportes-exportacion');

  if (linkReportesGeneral) {
    linkReportesGeneral.addEventListener('click', (e) => {
      console.log('[DEBUG] Clic detectado en submenú. Elemento:', e.target);
      console.log('[DEBUG] Destino: reportes, Sección: general');

      e.preventDefault();
      console.log('[DEBUG] event.preventDefault() llamado.');

      console.log('MenuInicio: Navegando a Reportes - General (SPA)');
      cargarContenidoPagina('reportes', 'general');
    });
  }

  if (linkReportesExportacion) {
    linkReportesExportacion.addEventListener('click', (e) => {
      console.log('[DEBUG] Clic detectado en submenú. Elemento:', e.target);
      console.log('[DEBUG] Destino: reportes, Sección: exportacion');

      e.preventDefault();
      console.log('[DEBUG] event.preventDefault() llamado.');

      console.log('MenuInicio: Navegando a Reportes - Exportación (SPA)');
      cargarContenidoPagina('reportes', 'exportacion');
    });
  }

  // Enlaces de Gestión
  const linkGestionModulos = document.getElementById('link-gestion-modulos');
  const linkGestionGrupos = document.getElementById('link-gestion-grupos');

  if (linkGestionModulos) {
    linkGestionModulos.addEventListener('click', (e) => {
      console.log('[DEBUG] Clic detectado en submenú. Elemento:', e.target);
      console.log('[DEBUG] Destino: gestion, Sección: modulos');

      e.preventDefault();
      console.log('[DEBUG] event.preventDefault() llamado.');

      console.log('MenuInicio: Navegando a Gestión - Módulos (SPA)');
      cargarContenidoPagina('gestion', 'modulos');
    });
  }

  if (linkGestionGrupos) {
    linkGestionGrupos.addEventListener('click', (e) => {
      console.log('[DEBUG] Clic detectado en submenú. Elemento:', e.target);
      console.log('[DEBUG] Destino: gestion, Sección: grupos');

      e.preventDefault();
      console.log('[DEBUG] event.preventDefault() llamado.');

      console.log('MenuInicio: Navegando a Gestión - Grupos (SPA)');
      cargarContenidoPagina('gestion', 'grupos');
    });
  }
}

/**
 * Cargar contenido de una página desde localStorage
 * @param {string} destino - Nombre de la categoría (pacientes, usuarios, operaciones, reportes, gestion)
 * @param {string} seccion - Sección específica (opcional)
 */
function cargarContenidoPagina(destino, seccion = null) {
  console.log(`📄 Cargando página: ${destino}${seccion ? ` - ${seccion}` : ''}`);
  console.log(`[DEBUG] Parámetro 'destino' recibido: "${destino}"`);
  console.log(`[DEBUG] Parámetro 'seccion' recibido: "${seccion}"`);

  // Mapear destino a clave de localStorage
  const mapeoClaves = {
    'pacientes': 'page_pacientes',
    'usuarios-personal': 'page_usuarios',
    'operaciones': 'page_operaciones',
    'reportes': 'page_reportes',
    'gestion': 'page_gestion'
  };

  const clave = mapeoClaves[destino];
  console.log(`[DEBUG] Buscando HTML con clave: ${clave}`);

  if (!clave) {
    console.error(`❌ Destino no reconocido: ${destino}`);
    console.error(`[DEBUG-ERROR] El destino "${destino}" no existe en mapeoClaves`);
    console.error(`[DEBUG-ERROR] Claves válidas:`, Object.keys(mapeoClaves));
    return;
  }

  // Obtener HTML desde localStorage
  const htmlGuardado = localStorage.getItem(clave);
  console.log(`[DEBUG] HTML obtenido de localStorage:`, htmlGuardado ? `${htmlGuardado.substring(0, 100)}... (${htmlGuardado.length} chars)` : '¡NULO!');

  if (!htmlGuardado) {
    console.error(`❌ No se encontró contenido en localStorage para: ${clave}`);
    console.error(`[DEBUG-ERROR] ¡No se encontró HTML en localStorage para la clave ${clave}!`);
    console.error(`[DEBUG-ERROR] Verificando todas las claves en localStorage...`);
    console.error(`[DEBUG-ERROR] Claves disponibles:`, Object.keys(localStorage));
    alert('El contenido de esta página no está disponible offline. Por favor, intenta recargar la página.');
    return;
  }

  console.log(`✅ Contenido recuperado de localStorage: ${clave} (${(htmlGuardado.length / 1024).toFixed(2)} KB)`);

  // Ocultar el dashboard del menú principal
  const container = document.querySelector('.container');
  if (container) {
    container.style.display = 'none';
    console.log(`[DEBUG] Dashboard principal ocultado`);
  }

  // Mostrar el contenedor dinámico
  const contenedorDinamico = document.getElementById('contenido-dinamico');
  if (contenedorDinamico) {
    console.log('[DEBUG] Intentando inyectar HTML en #contenido-dinamico...');

    contenedorDinamico.style.display = 'block';
    contenedorDinamico.innerHTML = htmlGuardado;

    console.log(`[DEBUG] HTML inyectado correctamente en #contenido-dinamico`);
    console.log(`✅ Contenido inyectado en #contenido-dinamico`);

    // ================= CARGAR UTILIDADES COMPARTIDAS PRIMERO =================
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔧 CARGANDO SCRIPTS DE UTILIDAD COMPARTIDOS');
    console.log('═══════════════════════════════════════════════════════════');

    cargarUtilidadesCompartidas().then(() => {
      console.log('✅ Utilidades compartidas cargadas, continuando con controlador...');

      // ================= EJECUCIÓN DINÁMICA DE CONTROLADOR (PWA MODE) =================
      console.log('═══════════════════════════════════════════════════════════');
      console.log('🚀 INICIO DE CARGA DE CONTROLADOR (PWA)');
      console.log('═══════════════════════════════════════════════════════════');

      // Mapeo de destino a ruta del controlador
      const controllerPathMap = {
        'pacientes': '/js/controllers/pacienteController.js',
        'usuarios-personal': '/js/controllers/usersController.js',
        'operaciones': '/js/controllers/operacionesController.js',
        'reportes': '/js/controllers/reporteController.js',
        'gestion': '/js/controllers/gestionController.js'
      };

      const initFunctionMap = {
        'pacientes': 'initPacienteController',
        'usuarios-personal': 'initUsersController',
        'operaciones': 'initOperationsController',
        'reportes': 'initReporteController',
        'gestion': 'initGestionController'
      };

      const controllerPath = controllerPathMap[destino];
      const initFunctionName = initFunctionMap[destino];

      console.log(`[PWA-LOAD-1] 🔑 Controlador: "${controllerPath}"`);
      console.log(`[PWA-LOAD-1] 🎯 Función init esperada: "${initFunctionName}"`);

      // ESTRATEGIA 1: Cargar controlador con import() dinámico (funciona con SW)
      cargarControladorDinamico(controllerPath, initFunctionName, destino);
    // ============================================================================

    // Si hay una sección específica, hacer scroll a ella
    if (seccion) {
      setTimeout(() => {
        const elemento = document.getElementById(seccion);
        if (elemento) {
          elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log(`📍 Navegado a sección: #${seccion}`);
        }
      }, 100);
    }

    // Registrar actividad
    authModel.registrarActividad({
      accion: 'spa_page_load',
      descripcion: `Página cargada desde localStorage: ${destino}${seccion ? ` (${seccion})` : ''}`
    });

    }).catch(error => {
      console.error('❌ Error al cargar utilidades compartidas:', error);
      // Continuar de todas formas con la carga del controlador
    });
  }
}

/**
 * Cargar scripts de utilidad compartidos desde localStorage
 * @returns {Promise<void>}
 */
async function cargarUtilidadesCompartidas() {
  console.log('🔧 Iniciando carga de utilidades compartidas...');

  const utilidades = [
    { clave: 'util_userDisplay', nombre: 'userDisplayGlobal.js', cargado: false },
    { clave: 'util_categoriesDebug', nombre: 'categories-debug-tool.js', cargado: false },
    { clave: 'util_debugLogout', nombre: 'debug-logout-modal.js', cargado: false }
  ];

  for (const utilidad of utilidades) {
    // Verificar si ya fue cargada previamente
    if (document.querySelector(`script[data-util="${utilidad.clave}"]`)) {
      console.log(`⏭️ ${utilidad.nombre} ya está cargado, omitiendo...`);
      continue;
    }

    const scriptTexto = localStorage.getItem(utilidad.clave);

    if (scriptTexto) {
      console.log(`✅ ${utilidad.nombre} encontrado en localStorage (${(scriptTexto.length / 1024).toFixed(2)} KB)`);

      try {
        // Crear Blob con el contenido del script
        const scriptBlob = new Blob([scriptTexto], { type: 'text/javascript' });
        const scriptUrl = URL.createObjectURL(scriptBlob);

        // Crear elemento script dinámico
        const scriptElement = document.createElement('script');
        scriptElement.type = 'module';
        scriptElement.src = scriptUrl;
        scriptElement.setAttribute('data-util', utilidad.clave);

        // Esperar a que se cargue
        await new Promise((resolve, reject) => {
          scriptElement.onload = () => {
            console.log(`✅ ${utilidad.nombre} cargado exitosamente`);
            URL.revokeObjectURL(scriptUrl);
            resolve();
          };

          scriptElement.onerror = (error) => {
            console.error(`❌ Error al cargar ${utilidad.nombre}:`, error);
            URL.revokeObjectURL(scriptUrl);
            reject(error);
          };

          document.body.appendChild(scriptElement);
        });

      } catch (error) {
        console.error(`❌ Error preparando ${utilidad.nombre}:`, error);
      }
    } else {
      console.warn(`⚠️ ${utilidad.nombre} no encontrado en localStorage (clave: ${utilidad.clave})`);
    }
  }

  console.log('🔧 Carga de utilidades compartidas completada');
}

/**
 * Cargar controlador dinámicamente usando import() con fallback a localStorage
 * @param {string} controllerPath - Ruta absoluta del controlador (ej: '/js/controllers/pacienteController.js')
 * @param {string} initFunctionName - Nombre de la función init (ej: 'initPacienteController')
 * @param {string} destino - Nombre del destino para fallback
 */
async function cargarControladorDinamico(controllerPath, initFunctionName, destino) {
  try {
    console.log(`[PWA-LOAD-2] 🚀 Intentando import() dinámico: ${controllerPath}`);

    // ESTRATEGIA 1: Import dinámico estándar (funciona con SW en offline)
    const modulo = await import(controllerPath);

    console.log('[PWA-LOAD-3] ✅ Import exitoso, buscando función init...');

    // Verificar y llamar a la función init
    if (typeof modulo[initFunctionName] === 'function') {
      console.log(`[PWA-LOAD-4] 🎯 Ejecutando ${initFunctionName}()...`);
      modulo[initFunctionName]();
      console.log(`[PWA-LOAD-5] ✅ ${initFunctionName}() ejecutado exitosamente`);
    } else if (typeof window[initFunctionName] === 'function') {
      // Algunas veces la función está en window
      console.log(`[PWA-LOAD-4] 🎯 Ejecutando ${initFunctionName}() desde window...`);
      window[initFunctionName]();
      console.log(`[PWA-LOAD-5] ✅ ${initFunctionName}() ejecutado exitosamente`);
    } else {
      console.error(`[PWA-LOAD-ERROR] ❌ La función ${initFunctionName} no existe en el módulo`);
      console.log('[PWA-LOAD-ERROR] Exports disponibles:', Object.keys(modulo));
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('🏁 FIN DE CARGA DE CONTROLADOR (PWA)');
    console.log('═══════════════════════════════════════════════════════════');

  } catch (errorImport) {
    console.warn('[PWA-FALLBACK] Import falló, usando estrategia fallback localStorage:', errorImport);

    // ESTRATEGIA 2: Fallback localStorage (solo si SW no disponible)
    const scriptKeyMap = {
      'pacientes': 'script_pacientes',
      'usuarios-personal': 'script_usuarios',
      'operaciones': 'script_operaciones',
      'reportes': 'script_reportes',
      'gestion': 'script_gestion'
    };

    const claveScript = scriptKeyMap[destino];
    const scriptTexto = localStorage.getItem(claveScript);

    if (!scriptTexto) {
      console.error(`[PWA-FALLBACK-ERROR] ❌ Controlador no disponible: ${controllerPath}`);
      console.error(`[PWA-FALLBACK-ERROR] No se encontró en localStorage: ${claveScript}`);
      alert(`No se pudo cargar el controlador para ${destino}.\nPor favor, reconecta a internet e inicia sesión nuevamente.`);
      return;
    }

    console.log(`[PWA-FALLBACK] 📦 Usando Blob desde localStorage (${(scriptTexto.length / 1024).toFixed(2)} KB)`);

    try {
      const blob = new Blob([scriptTexto], { type: 'application/javascript' });
      const blobURL = URL.createObjectURL(blob);

      const script = document.createElement('script');
      script.type = 'module';
      script.src = blobURL;
      script.setAttribute('data-dynamic-controller', destino);

      script.onload = () => {
        URL.revokeObjectURL(blobURL);
        console.log(`[PWA-FALLBACK] ✅ Controlador cargado vía Blob (fallback): ${destino}`);

        // Ejecutar función init
        if (typeof window[initFunctionName] === 'function') {
          window[initFunctionName]();
          console.log(`[PWA-FALLBACK] ✅ ${initFunctionName}() ejecutado`);
        }

        console.log('═══════════════════════════════════════════════════════════');
        console.log('🏁 FIN DE CARGA DE CONTROLADOR (FALLBACK)');
        console.log('═══════════════════════════════════════════════════════════');
      };

      script.onerror = (error) => {
        console.error(`[PWA-FALLBACK-ERROR] ❌ Error al cargar Blob:`, error);
        URL.revokeObjectURL(blobURL);
      };

      document.head.appendChild(script);

    } catch (errorBlob) {
      console.error(`[PWA-FALLBACK-ERROR] ❌ Error preparando Blob:`, errorBlob);
    }
  }
}
