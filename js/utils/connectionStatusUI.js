/**
 * Interfaz de estado de conexión a internet
 * Muestra un banner visual indicando el estado online/offline
 * Adaptado de VERSION_0.1 - Solo UI, sin lógica de sincronización
 */

class ConnectionStatusUI {
  constructor() {
    this.isOnline = navigator.onLine;
    this.connectionStatusElement = null;
    this.createConnectionStatusUI();
    this.initializeConnectionMonitoring();
  }

  /**
   * Crea el elemento visual del banner de estado de conexión
   */
  createConnectionStatusUI() {
    // Crear elemento de estado de conexión
    const statusDiv = document.createElement('div');
    statusDiv.id = 'connection-status';
    statusDiv.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
      padding: 8px 16px;
      text-align: center;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s ease;
      transform: translateY(-100%);
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

    document.body.appendChild(statusDiv);
    this.connectionStatusElement = statusDiv;

    // Configurar estado inicial
    this.updateConnectionStatus();
  }

  /**
   * Inicializa el monitoreo de cambios en la conexión
   */
  initializeConnectionMonitoring() {
    // Escuchar eventos de conexión del navegador
    window.addEventListener('online', () => this.handleOnline());
    window.addEventListener('offline', () => this.handleOffline());

    // Verificar conexión periódicamente
    setInterval(() => this.checkConnection(), 30000); // Cada 30 segundos

    // Verificar conexión inicial
    this.checkConnection();
  }

  /**
   * Verifica el estado de la conexión haciendo una petición ligera
   */
  async checkConnection() {
    try {
      // Consultar recurso LOCAL cacheado por el SW (evita dependencias externas)
      const response = await fetch('/img/uat-logo-2023.png', {
        method: 'HEAD',
        cache: 'no-cache'
      });

      if (response.ok) {
        const wasOnline = this.isOnline;
        this.isOnline = true;

        if (!wasOnline && this.isOnline) {
          this.handleOnline();
        }
      } else {
        this.setOnlineStatus(false);
      }
    } catch (error) {
      const wasOnline = this.isOnline;
      this.isOnline = false;

      if (wasOnline && !this.isOnline) {
        this.handleOffline();
      }
    }
  }

  /**
   * Establece el estado online (helper method)
   */
  setOnlineStatus(status) {
    const wasOnline = this.isOnline;
    this.isOnline = status;

    if (wasOnline !== status) {
      if (status) {
        this.handleOnline();
      } else {
        this.handleOffline();
      }
    }
  }

  /**
   * Maneja el evento cuando se restaura la conexión
   */
  handleOnline() {
    console.log('🌐 Conexión a internet restaurada');
    this.isOnline = true;
    this.updateConnectionStatus();

    // Mostrar notificación temporal
    this.showConnectionMessage('🌐 Conexión restaurada', 'success');
  }

  /**
   * Maneja el evento cuando se pierde la conexión
   */
  handleOffline() {
    console.log('📵 Conexión a internet perdida');
    this.isOnline = false;
    this.updateConnectionStatus();

    // Mostrar mensaje persistente
    this.showConnectionMessage('📵 Sin conexión - Trabajando en modo offline', 'warning', true);
  }

  /**
   * Actualiza el estilo y contenido del banner según el estado
   */
  updateConnectionStatus() {
    if (!this.connectionStatusElement) return;

    if (this.isOnline) {
      // Ocultar el banner cuando hay conexión
      this.connectionStatusElement.style.transform = 'translateY(-100%)';
    } else {
      // Mostrar el banner cuando no hay conexión
      this.connectionStatusElement.style.transform = 'translateY(0)';
      this.connectionStatusElement.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
      this.connectionStatusElement.style.color = 'white';
      this.connectionStatusElement.innerHTML = `
        <i class="fas fa-wifi" style="margin-right: 8px;"></i>
        Sin conexión a internet - Trabajando en modo offline
        <i class="fas fa-exclamation-triangle" style="margin-left: 8px;"></i>
      `;
    }
  }

  /**
   * Muestra un mensaje temporal o persistente en el banner
   * @param {string} message - Mensaje a mostrar
   * @param {string} type - Tipo de mensaje (success, warning, error, info)
   * @param {boolean} persistent - Si el mensaje debe permanecer visible
   */
  showConnectionMessage(message, type = 'info', persistent = false) {
    if (!this.connectionStatusElement) return;

    const colors = {
      success: 'linear-gradient(135deg, #10b981, #059669)',
      warning: 'linear-gradient(135deg, #f59e0b, #d97706)',
      error: 'linear-gradient(135deg, #ef4444, #dc2626)',
      info: 'linear-gradient(135deg, #3b82f6, #2563eb)'
    };

    this.connectionStatusElement.style.background = colors[type];
    this.connectionStatusElement.style.color = 'white';
    this.connectionStatusElement.style.transform = 'translateY(0)';
    this.connectionStatusElement.innerHTML = message;

    if (!persistent) {
      setTimeout(() => {
        this.connectionStatusElement.style.transform = 'translateY(-100%)';
      }, 4000);
    }
  }

  /**
   * Métodos públicos para verificar estado
   */
  get online() {
    return this.isOnline;
  }

  get offline() {
    return !this.isOnline;
  }
}

/**
 * Función de inicialización para ser llamada desde globalController
 */
export function initConnectionStatusUI() {
  console.log('🌐 Inicializando UI de estado de conexión');

  // Crear instancia global
  if (!window.ConnectionStatusUI) {
    window.ConnectionStatusUI = new ConnectionStatusUI();
    console.log('✅ ConnectionStatusUI inicializado correctamente');
  } else {
    console.log('ℹ️ ConnectionStatusUI ya está inicializado');
  }

  return window.ConnectionStatusUI;
}

// Exportar la clase también por si se necesita en el futuro
export default ConnectionStatusUI;

