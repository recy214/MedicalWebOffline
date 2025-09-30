importScripts('https://cdn.jsdelivr.net/npm/dexie@3.2.2/dist/dexie.min.js');

const CACHE_NAME = 'medical-pwa-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/menuInicio.html',
  '/categoria-pacientes.html',
  '/categoria-usuarios-personal.html',
  '/categoria-operaciones-control.html',
  '/categoria-reportes.html',
  '/ModalUsuario_nuevo.html',
  '/ModalUsuario.html',
  '/ModalPersonal.html',
  './database.js',
  './InicioSesion.js',
  './MenuInicio.js',
  './categoria-pacientes.js',
  './categoria-usuarios-personal.js',
  './categoria-operaciones-control.js',
  './categoria-reportes.js',
  './Servicio.js',
  './RegistroEntradasSalidas.js',
  './Personal.js',
  './sync-ui.js',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.2/dist/dexie.min.js',
  '../MedicalWebOffline-DB-Offline-Sincronizaci-n/img/medical-background.png',
  '../MedicalWebOffline-DB-Offline-Sincronizaci-n/img/uat-logo-2023.png',
  '../MedicalWebOffline-DB-Offline-Sincronizaci-n/img/Logo Medical Developer.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

self.addEventListener('sync', event => {
  if (event.tag === 'sync-pending-data') {
    event.waitUntil(syncPendingData());
  }
});

async function syncPendingData() {
  const db = new Dexie('MedicalDB_v2');
  db.version(1).stores({
    usuarios: '++id, &matricula, rol',
    pacientes: '++id, &matricula',
    historialClinico: '++id, pacienteId, fecha, estadoSinc',
    registrosES: '++id, [usuarioId+fecha], tipo, estadoSinc',
    mesasOperacion: '++id, numero, estado'
  });

  const pendingRegistrosES = await db.registrosES.where('estadoSinc').equals('pendiente').toArray();
  const pendingHistorialClinico = await db.historialClinico.where('estadoSinc').equals('pendiente').toArray();

  const pendingRecords = [...pendingRegistrosES, ...pendingHistorialClinico];

  if (pendingRecords.length > 0) {
    try {
      const response = await fetch('http://localhost:3000/api/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(pendingRecords)
      });

      if (response.ok) {
        console.log('Sync successful');
        const idsToUpdateES = pendingRegistrosES.map(rec => rec.id);
        const idsToUpdateHC = pendingHistorialClinico.map(rec => rec.id);

        if (idsToUpdateES.length > 0) {
            await db.registrosES.where('id').anyOf(idsToUpdateES).modify({ estadoSinc: 'sincronizado' });
        }
        if (idsToUpdateHC.length > 0) {
            await db.historialClinico.where('id').anyOf(idsToUpdateHC).modify({ estadoSinc: 'sincronizado' });
        }
      } else {
        console.error('Sync failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error during sync:', error);
    }
  } else {
    console.log('No pending records to sync.');
  }
}