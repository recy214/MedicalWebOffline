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
  // This is a simulation. In a real app, you would fetch data from IndexedDB
  // and send it to a backend server.
  console.log('Attempting to sync pending data...');

  // Simulate fetching data from IndexedDB
  // For this simulation, we'll assume there's a global 'db' object available
  // which would be the Dexie instance.
  // In a real service worker, you'd need to open the IndexedDB directly.
  // For now, we'll just log a message.

  // Example of how you might interact with IndexedDB in a service worker:
  // const db = new Dexie('MedicalDB_v2');
  // db.version(1).stores({
  //   registrosES: '++id, usuarioId, fecha, tipo, estadoSinc'
  // });
  // const pendingRecords = await db.registrosES.where('estadoSinc').equals('pendiente').toArray();
  // if (pendingRecords.length > 0) {
  //   console.log(`Found ${pendingRecords.length} pending records. Simulating sync...`);
  //   // Simulate sending to server
  //   await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate network delay
  //   // Mark as synced
  //   for (const record of pendingRecords) {
  //     await db.registrosES.update(record.id, { estadoSinc: 'sincronizado' });
  //   }
  //   console.log('Simulated sync complete.');
  // } else {
  //   console.log('No pending records to sync.');
  // }
  
  console.log('Simulating data synchronization. In a real application, data would be sent to a server.');
  // Here you would typically open IndexedDB, get pending records,
  // send them to your backend, and then mark them as synced.
  // For this example, we're just logging.
}