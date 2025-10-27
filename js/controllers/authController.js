// js/controllers/authController.js
// Controller for authentication handling

import { authModel } from '../models/storageModel.js';

/**
 * Initialize the authentication controller
 */
export function initAuthController() {
  console.log('Initializing auth controller...');
  
  // Usamos el botón en lugar del formulario para prevenir la redirección accidental
  const btnLogin = document.getElementById('btnLogin');
  if (!btnLogin) return;
  
  btnLogin.addEventListener('click', handleLogin);
  
  // También permitimos presionar Enter en los campos para iniciar sesión
  const inputMatricula = document.getElementById('matriculaInput');
  const inputContrasena = document.getElementById('contrasenaInput');
  
  if (inputMatricula) {
    inputMatricula.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
  
  if (inputContrasena) {
    inputContrasena.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        handleLogin();
      }
    });
  }
}

/**
 * Handle login form submission
 */
function handleLogin() {
  // Ya no necesitamos prevenir el envío del formulario porque usamos un botón
  
  const matriculaInput = document.getElementById('matriculaInput');
  const contrasenaInput = document.getElementById('contrasenaInput');
  
  if (!matriculaInput || !contrasenaInput) return;
  
  const matriculaOId = matriculaInput.value.trim();
  const contrasena = contrasenaInput.value.trim();
  
  console.log('🔐 Intento de login con:', matriculaOId);
  console.log('🔐 Sistema JWT habilitado:', authModel.isJWTEnabled());
  
  if (!matriculaOId || !contrasena) {
    // Usar el sistema de mensajes si está disponible, sino usar alert
    if (typeof mostrarMensaje === 'function') {
      mostrarMensaje('warning', '⚠️ Campos Requeridos', 'Por favor ingresa tu matrícula/ID y contraseña para continuar.');
    } else {
      alert('Por favor ingresa matrícula/ID y contraseña');
    }
    return;
  }
  
  // Usar JWT si está habilitado, sino usar sistema legacy
  if (authModel.isJWTEnabled()) {
    // ================================
    // LOGIN CON JWT
    // ================================
    console.log('🔐 Iniciando login con JWT...');
    try {
      const jwtResult = authModel.loginWithJWT(matriculaOId, contrasena);
      if (jwtResult.success) {
        console.log('✅ Login JWT exitoso');
        console.log('👤 Usuario:', jwtResult.usuario.nombre);
        console.log('🏷️ Rol:', jwtResult.usuario.rol);
        console.log('🆔 ID:', jwtResult.usuario.id);
        if (jwtResult.fallback) {
          console.warn('⚠️ Login con fallback:', jwtResult.warning);
        }
        if (!jwtResult.fallback) {
          setTimeout(() => {
            const tokenInfo = authModel.getJWTInfo();
            if (tokenInfo && tokenInfo.valid) {
              console.log('🔐 Token JWT verificado y funcionando');
              console.log('⏰ Válido hasta:', new Date(tokenInfo.payload.exp * 1000).toLocaleString());
              console.log('🕐 Tiempo restante:', tokenInfo.timeFormatted);
              console.log('🔑 JTI (Token ID):', tokenInfo.payload.jti);
              if (typeof window.showJWTPanel === 'function') {
                console.log('📱 Abriendo panel de control JWT...');
                window.showJWTPanel();
              }
            }
          }, 1000);
        }
        // Registrar actividad
        authModel.registrarActividad({
          accion: jwtResult.fallback ? 'login_fallback' : 'login_jwt',
          descripcion: `Login ${jwtResult.fallback ? 'fallback' : 'JWT'} exitoso como ${jwtResult.usuario.rol}`
        });
        // REGISTRAR ENTRADA EN HISTORIAL DE E/S (igual que test login JWT)
        import('../models/operacionesModel.js').then(({ registrarEntrada }) => {
          registrarEntrada(jwtResult.usuario);
        });
        // Precargar páginas en localStorage antes de redirigir
        console.log('📦 Precargando páginas en localStorage...');
        precargarPaginasEnStorage().then(() => {
          console.log('✅ Páginas precargadas exitosamente');
          console.log('🔗 Redirigiendo a menuInicio.html...');
          window.location.href = '/menuInicio.html';
        }).catch(error => {
          console.warn('⚠️ Error al precargar páginas, redirigiendo de todas formas:', error);
          window.location.href = '/menuInicio.html';
        });
        return;
      } else {
        console.error('❌ Login JWT falló:', jwtResult.error);
        if (jwtResult.error.includes('Credenciales inválidas')) {
          if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('error', '❌ Credenciales Incorrectas', 'Usuario o contraseña incorrectos');
          } else {
            alert('❌ Credenciales incorrectas');
          }
          return;
        } else {
          console.warn('⚠️ Error técnico en JWT, continuando con login legacy');
        }
      }
    } catch (error) {
      console.error('❌ Error crítico en login JWT:', error);
    }
  } else {
    // ================================
    // LOGIN LEGACY (localStorage)
    // ================================
    console.log('🔓 Usando sistema de login legacy...');
    const usuarioValido = authModel.validateUser(matriculaOId, contrasena);
    console.log('Usuario validado:', usuarioValido ? 'Válido' : 'Inválido');
    if (usuarioValido) {
      const userData = {
        nombre: usuarioValido.nombre,
        rol: usuarioValido.rol,
        id: usuarioValido.id,
        matricula: usuarioValido.matricula,
        contrasena: usuarioValido.contrasena,
        apellidos: usuarioValido.apellidos || '',
        estado: usuarioValido.estado || 'activo'
      };
      console.log('✅ Login legacy exitoso');
      console.log('👤 Usuario:', userData.nombre);
      console.log('🏷️ Rol:', userData.rol);
      console.log('🆔 ID:', userData.id);
      authModel.registrarActividad({
        accion: 'login_legacy',
        descripcion: `Login legacy como ${usuarioValido.rol}`
      });
      authModel.setCurrentUser(userData);
      const usuarioGuardado = authModel.getCurrentUser();
      console.log('📝 Usuario guardado en localStorage:', usuarioGuardado);
      // REGISTRAR ENTRADA EN HISTORIAL DE E/S (igual que test login JWT)
      import('../models/operacionesModel.js').then(({ registrarEntrada }) => {
        registrarEntrada(userData);
      });
      // Precargar páginas en localStorage antes de redirigir
      console.log('📦 Precargando páginas en localStorage...');
      precargarPaginasEnStorage().then(() => {
        console.log('✅ Páginas precargadas exitosamente');
        console.log('🔗 Redirigiendo a menuInicio.html...');
        try {
          window.location.href = '/menuInicio.html';
        } catch (error) {
          console.error('Error al redirigir:', error);
          if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('error', '❌ Error de Redirección', 'Error al acceder al menú principal. Actualiza la página e intenta nuevamente.');
          } else {
            alert('Error al redirigir al menú. Por favor intente de nuevo.');
          }
        }
      }).catch(error => {
        console.warn('⚠️ Error al precargar páginas, redirigiendo de todas formas:', error);
        try {
          window.location.href = '/menuInicio.html';
        } catch (redirectError) {
          console.error('Error al redirigir:', redirectError);
          if (typeof mostrarMensaje === 'function') {
            mostrarMensaje('error', '❌ Error de Redirección', 'Error al acceder al menú principal. Actualiza la página e intenta nuevamente.');
          } else {
            alert('Error al redirigir al menú. Por favor intente de nuevo.');
          }
        }
      });
    } else {
      console.error('❌ Login legacy falló: credenciales inválidas');
      if (typeof mostrarMensaje === 'function') {
        mostrarMensaje('error', '❌ Credenciales Incorrectas', 'ID/Matrícula o contraseña incorrecta. Verifica tus datos e intenta nuevamente.');
      } else {
        alert('ID/Matrícula o contraseña incorrecta.');
      }
    }
  }
}

// ✅ REMOVIDO: DOMContentLoaded automático que causaba ejecución en todas las páginas
// El initAuthController ahora SOLO se llama explícitamente desde index.html
//
// ANTES (PROBLEMÁTICO):
// document.addEventListener('DOMContentLoaded', () => {
//   console.log('Página de login cargada.');
//   initAuthController();
// });
//
// Esto causaba que el authController se inicializara en CUALQUIER página
// que lo importara (incluyendo categoria-usuarios-personal.html),
// mostrando el mensaje "Página de login cargada" incorrectamente.

/**
 * Get the role of the current user
 * @returns {string} - The user's role or empty string if not authenticated
 */
export function getCurrentUserRole() {
  let currentUser;
  
  if (authModel.isJWTEnabled()) {
    currentUser = authModel.getCurrentUserFromJWT();
  } else {
    currentUser = authModel.getCurrentUser();
  }
  
  return currentUser ? currentUser.rol : '';
}

/**
 * Get the current authenticated user
 * @returns {object|null} - The current user object or null if not authenticated
 */
export function getCurrentUser() {
  if (authModel.isJWTEnabled()) {
    return authModel.getCurrentUserFromJWT();
  } else {
    return authModel.getCurrentUser();
  }
}

/**
 * Check if user is authenticated
 * @returns {boolean} - True if user is authenticated, false otherwise
 */
export function isAuthenticated() {
  if (authModel.isJWTEnabled()) {
    return authModel.isJWTSessionValid();
  } else {
    return !!authModel.getCurrentUser();
  }
}

/**
 * Log out the current user
 */
export function logout() {
  console.log('🔐 AuthController: Iniciando proceso de logout');
  
  // Obtener usuario antes del logout según el sistema activo
  let usuario;
  if (authModel.isJWTEnabled()) {
    usuario = authModel.getCurrentUserFromJWT();
    console.log('🔐 Logout JWT para usuario:', usuario?.nombre);
  } else {
    usuario = authModel.getCurrentUser();
    console.log('🔓 Logout legacy para usuario:', usuario?.nombre);
  }
  
  if (usuario) {
    authModel.registrarActividad({
      accion: authModel.isJWTEnabled() ? 'logout_jwt' : 'logout_legacy',
      descripcion: `Cierre de sesión desde authController (${authModel.isJWTEnabled() ? 'JWT' : 'Legacy'})`
    });
  }
  
  // Logout según el sistema activo
  if (authModel.isJWTEnabled()) {
    authModel.logoutJWT();
    console.log('🔐 JWT tokens eliminados');
  } else {
    authModel.logout();
    console.log('🔓 Sesión legacy eliminada');
  }
  
  // Limpiar cualquier redirección pendiente
  sessionStorage.removeItem('redirectAfterLogin');
  
  console.log('🔗 Redirigiendo a index.html...');
  
  // Redirigir a la página de login
  window.location.href = 'index.html';
}

/**
 * Verificar si estamos en modo offline
 * @returns {Promise<boolean>}
 */
async function isOffline() {
  // Primera verificación: navigator.onLine
  if (!navigator.onLine) {
    console.log('🔌 Navegador reporta: OFFLINE');
    return true;
  }

  // Segunda verificación: intentar fetch rápido
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // 2s timeout

    const response = await fetch('/manifest.webmanifest', {
      method: 'HEAD',
      cache: 'no-cache',
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.log('🔌 Verificación de red falló: servidor no responde');
      return true;
    }

    console.log('🌐 Conexión verificada: ONLINE');
    return false;
  } catch (error) {
    console.log('🔌 Verificación de red falló:', error.message);
    return true;
  }
}

/**
 * Precargar todas las páginas HTML y scripts JS en localStorage para navegación offline
 * @returns {Promise<void>}
 */
async function precargarPaginasEnStorage() {
  console.log('📦 Iniciando precarga de recursos (HTML + JS)...');

  // Verificar si estamos offline
  const offline = await isOffline();

  if (offline) {
    console.warn('⚠️ Modo OFFLINE detectado - omitiendo precarga');
    console.log('ℹ️ Los recursos ya deberían estar en cache del Service Worker');
    console.log('✅ Continuando con login offline...');
    return; // Salir sin error para permitir login offline
  }

  // Páginas HTML a precargar
  const paginas = [
    { ruta: 'pages/categoria-pacientes.html', clave: 'page_pacientes' },
    { ruta: 'pages/categoria-usuarios-personal.html', clave: 'page_usuarios' },
    { ruta: 'pages/categoria-operaciones-control.html', clave: 'page_operaciones' },
    { ruta: 'pages/categoria-reportes.html', clave: 'page_reportes' },
    { ruta: 'pages/categoria-gestion.html', clave: 'page_gestion' }
  ];

  // Scripts JavaScript a precargar (NUEVO)
  const scripts = [
    { ruta: 'js/controllers/pacienteController.js', clave: 'script_pacientes' },
    { ruta: 'js/controllers/usersController.js', clave: 'script_usuarios' },
    { ruta: 'js/controllers/operacionesController.js', clave: 'script_operaciones' },
    { ruta: 'js/controllers/reporteController.js', clave: 'script_reportes' },
    { ruta: 'js/controllers/gestionController.js', clave: 'script_gestion' }
  ];

  // Scripts de utilidad compartidos (CRÍTICO para offline)
  const utilidades = [
    { ruta: 'js/utils/userDisplayGlobal.js', clave: 'util_userDisplay' },
    { ruta: 'categories-debug-tool.js', clave: 'util_categoriesDebug' },
    { ruta: 'js/utils/debug-logout-modal.js', clave: 'util_debugLogout' }
  ];

  // Función auxiliar para precargar un recurso (HTML o JS)
  const precargarRecurso = async (recurso, tipo = 'HTML') => {
    try {
      console.log(`📄 Descargando ${tipo}: ${recurso.ruta}...`);
      const response = await fetch(`/${recurso.ruta}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contenido = await response.text();
      localStorage.setItem(recurso.clave, contenido);
      console.log(`✅ ${recurso.clave} guardado en localStorage (${(contenido.length / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.error(`❌ Error al precargar ${tipo} ${recurso.ruta}:`, error);
      // No lanzar error para que los otros recursos se sigan cargando
    }
  };

  // Precargar HTML
  const promesasHTML = paginas.map(pagina => precargarRecurso(pagina, 'HTML'));

  // Precargar JS (controladores)
  const promesasJS = scripts.map(script => precargarRecurso(script, 'JS'));

  // Precargar utilidades compartidas (CRÍTICO)
  const promesasUtilidades = utilidades.map(util => precargarRecurso(util, 'UTIL'));

  // Esperar a que todas las descargas completen
  await Promise.all([...promesasHTML, ...promesasJS, ...promesasUtilidades]);

  console.log('📦 Precarga completada:');
  console.log(`   ✅ ${paginas.length} páginas HTML precargadas`);
  console.log(`   ✅ ${scripts.length} scripts JS precargados`);
  console.log(`   ✅ ${utilidades.length} utilidades compartidas precargadas`);
  console.log('🎯 Sistema listo para funcionar offline');
}
