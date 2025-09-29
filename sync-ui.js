document.addEventListener('DOMContentLoaded', () => {
    const syncStatusBanner = document.getElementById('sync-status-banner');

    function updateSyncStatus() {
        if (!navigator.onLine) {
            syncStatusBanner.textContent = 'Estás sin conexión';
            syncStatusBanner.style.backgroundColor = '#f8d7da';
            syncStatusBanner.style.color = '#721c24';
            syncStatusBanner.style.display = 'block';
            return;
        }

        db.registrosES.where('estadoSinc').equals('pendiente').count()
            .then(count => {
                if (count > 0) {
                    syncStatusBanner.textContent = `Sincronizando ${count} registros...`;
                    syncStatusBanner.style.backgroundColor = '#fff3cd';
                    syncStatusBanner.style.color = '#856404';
                    syncStatusBanner.style.display = 'block';
                } else {
                    syncStatusBanner.textContent = 'Datos sincronizados';
                    syncStatusBanner.style.backgroundColor = '#d4edda';
                    syncStatusBanner.style.color = '#155724';
                    setTimeout(() => {
                        syncStatusBanner.style.display = 'none';
                    }, 3000);
                }
            });
    }

    window.addEventListener('online', updateSyncStatus);
    window.addEventListener('offline', updateSyncStatus);

    // Check status periodically
    setInterval(updateSyncStatus, 5000);

    updateSyncStatus();
});