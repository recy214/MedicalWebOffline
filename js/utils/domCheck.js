// js/utils/domCheck.js

/**
 * Script para verificar la estructura del DOM
 * Se puede incluir temporalmente para depuración
 */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Comprobando estructura del DOM para el formulario de usuarios...');
    
    // Verificar modal y formulario
    const modalUsuario = document.getElementById('modalUsuario');
    const formUsuario = document.getElementById('formUsuario');
    
    if (!modalUsuario) {
      console.error('Error: No se encontró el modal con ID "modalUsuario"');
    } else {
      console.log('✓ Modal de usuario encontrado');
    }
    
    if (!formUsuario) {
      console.error('Error: No se encontró el formulario con ID "formUsuario"');
    } else {
      console.log('✓ Formulario de usuario encontrado');
      
      // Verificar botones dentro del formulario
      const submitBtn = formUsuario.querySelector('button[type="submit"]');
      const cancelBtn = document.getElementById('btnCancelarUsuario');
      
      if (!submitBtn) {
        console.error('Error: No se encontró el botón de envío (type="submit") en el formulario');
      } else {
        console.log('✓ Botón de envío encontrado');
      }
      
      if (!cancelBtn) {
        console.error('Error: No se encontró el botón de cancelar con ID "btnCancelarUsuario"');
        console.log('Sugerencia: Añade un botón: <button type="button" id="btnCancelarUsuario">Cancelar</button>');
      } else {
        console.log('✓ Botón de cancelar encontrado');
      }
    }
    
    // Verificar botones para abrir el modal
    const btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    const btnRegistrarUsuario = document.getElementById('btnRegistrarUsuario');
    
    if (!btnNuevoUsuario && !btnRegistrarUsuario) {
      console.error('Error: No se encontró ningún botón para abrir el modal de registro (btnNuevoUsuario o btnRegistrarUsuario)');
    } else {
      console.log('✓ Botón para abrir modal encontrado');
    }
    
    console.log('Verificación DOM completada.');
  });
})();