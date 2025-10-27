// Service Worker para Medical Web Offline
// Versión 1.1 - Fix para rutas relativas en /pages/

const CACHE_NAME = 'medical-v1.1';

// Lista completa de recursos críticos a precachear
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/menuInicio.html',
  '/pages/categoria-pacientes.html',
  '/pages/categoria-usuarios-personal.html',
  '/pages/categoria-operaciones-control.html',
  '/pages/categoria-reportes.html',
  '/pages/categoria-gestion.html',
  '/js/views/MenuInicio.js',
  '/js/controllers/pacienteController.js',
  '/js/controllers/usersController.js',
  '/js/controllers/operacionesController.js',
  '/js/controllers/reporteController.js',
  '/js/controllers/gestionController.js',
  '/js/controllers/authController.js',
  '/js/controllers/globalController.js',
  '/js/controllers/menuController.js',
  '/js/models/pacienteModel.js',
  '/js/models/operacionesModel.js',
  '/js/models/reporteModel.js',
  '/js/models/gestionModel.js',
  '/js/models/storageModel.js',
  '/js/middleware/authGuard.js',
  '/js/utils/eventBus.js',
  '/js/utils/modalUtil.js',
  '/js/utils/userDisplayGlobal.js',
  '/js/utils/connectionStatusUI.js',
  '/js/utils/jwtUtil.js',
  '/js/utils/eventLogger.js',
  '/js/utils/eventBusManager.js',
  '/js/views/pacienteView.js',
  '/js/views/userView.js',
  '/js/views/operacionesView.js',
  '/js/views/reporteView.js',
  '/js/views/gestionView.js',
  '/js/views/menuView.js',
  '/css/pacientes.css',
  '/img/logo-medical-developer.jpg',
  '/img/medical-background.png',
  '/img/uat-logo-2023.png',
  '/manifest.webmanifest'
];

// Evento INSTALL: Precachear recursos críticos
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker v1...');

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precacheando recursos críticos...');
        return cache.addAll(URLS_TO_CACHE);
      })
      .then(() => {
        console.log('[SW] Precache completado exitosamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('[SW] Error en precache:', error);
      })
  );
});

// Evento ACTIVATE: Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker v1...');

  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Eliminando cache antigua:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Limpieza de caches completada');
        return self.clients.claim(); // Tomar control inmediatamente
      })
  );
});

// Función auxiliar para normalizar rutas mal formadas
function normalizeRequestUrl(request) {
  const url = new URL(request.url);

  // Detectar y corregir rutas con /pages/ duplicado o mal colocado
  // Ejemplo: /pages/img/... → /img/...
  //          /pages/js/... → /js/...
  //          /pages/css/... → /css/...
  if (url.pathname.startsWith('/pages/img/') ||
      url.pathname.startsWith('/pages/js/') ||
      url.pathname.startsWith('/pages/css/')) {

    // Remover el /pages/ incorrecto del inicio
    const correctedPath = url.pathname.replace('/pages/', '/');
    console.log('[SW] Normalizando ruta:', url.pathname, '→', correctedPath);

    // Crear nueva URL corregida
    url.pathname = correctedPath;

    // Crear nuevo request con la URL corregida
    return new Request(url.toString(), {
      method: request.method,
      headers: request.headers,
      mode: request.mode,
      credentials: request.credentials,
      cache: request.cache,
      redirect: request.redirect,
      referrer: request.referrer,
      integrity: request.integrity
    });
  }

  return request;
}

// Evento FETCH: Estrategias de cache según tipo de recurso
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Solo interceptar peticiones del mismo origen
  if (url.origin !== location.origin) {
    return;
  }

  // Normalizar la URL antes de procesarla
  const normalizedRequest = normalizeRequestUrl(request);

  // Estrategia según tipo de recurso
  if (normalizedRequest.mode === 'navigate' || normalizedRequest.destination === 'document') {
    // HTML/Navegación: Network First con fallback a cache
    event.respondWith(networkFirstStrategy(normalizedRequest));
  } else if (
    normalizedRequest.destination === 'script' ||
    normalizedRequest.destination === 'style' ||
    normalizedRequest.destination === 'image'
  ) {
    // JS/CSS/IMG: Cache First con actualización en background
    event.respondWith(cacheFirstStrategy(normalizedRequest));
  } else {
    // Otros: Network First
    event.respondWith(networkFirstStrategy(normalizedRequest));
  }
});

// Estrategia Network First: Intenta red, luego cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);

    // Si la respuesta es válida, actualizar cache
    // IMPORTANTE: Solo cachear requests GET (cache.put no soporta HEAD, POST, etc.)
    if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Red no disponible, sirviendo desde cache:', request.url);

    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hay cache y es navegación, devolver index.html
    if (request.mode === 'navigate') {
      const indexCache = await caches.match('/index.html');
      if (indexCache) {
        return indexCache;
      }
    }

    throw error;
  }
}

// Estrategia Cache First: Sirve cache, actualiza en background
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Actualizar cache en background (solo para GET)
    if (request.method === 'GET') {
      fetch(request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, networkResponse);
          });
        }
      }).catch(() => {
        // Ignorar errores de red en background
      });
    }

    return cachedResponse;
  }

  // Si no está en cache, intentar red
  try {
    const networkResponse = await fetch(request);

    // Solo cachear requests GET
    if (networkResponse && networkResponse.status === 200 && request.method === 'GET') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Error cargando recurso:', request.url, error);
    throw error;
  }
}

// Listener para mensajes desde la aplicación
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'PRECACHE_EXTRA') {
    // Precache adicional bajo demanda
    const urls = event.data.urls || [];
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urls);
    }).then(() => {
      console.log('[SW] Precache extra completado:', urls);
    });
  }
});

console.log('[SW] Service Worker cargado correctamente');

