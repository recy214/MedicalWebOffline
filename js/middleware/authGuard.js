// js/middleware/authGuard.js
import { authModel } from '../models/storageModel.js';

(function() {
  const usuarioActual = authModel.getCurrentUser();
  if (!usuarioActual && !window.location.pathname.endsWith('index.html')) {
    window.location.href = 'index.html';
  }
})();