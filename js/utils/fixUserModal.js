// js/utils/fixUserModal.js

/**
 * Script para reparar automáticamente la estructura del modal de usuarios
 * Incluir temporalmente en menuInicio.html para solucionar problemas
 */
(function() {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('Verificando y arreglando el modal de usuarios...');
    
    // 1. Verificar si existe el modal, si no, crearlo
    let modalUsuario = document.getElementById('modalUsuario');
    if (!modalUsuario) {
      console.log('Creando modal de usuarios...');
      modalUsuario = document.createElement('div');
      modalUsuario.id = 'modalUsuario';
      modalUsuario.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100%; height:100%; background-color:rgba(0,0,0,0.5); justify-content:center; align-items:center; z-index:1000;';
      
      const modalContent = document.createElement('div');
      modalContent.style.cssText = 'background-color:white; padding:20px; border-radius:5px; min-width:400px; max-width:600px; position:relative;';
      
      const closeBtn = document.createElement('span');
      closeBtn.id = 'cerrarUsuario';
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = 'position:absolute; top:10px; right:15px; font-size:24px; cursor:pointer;';
      
      const title = document.createElement('h3');
      title.textContent = 'Registrar Nuevo Usuario';
      title.style.cssText = 'margin-top:0; margin-bottom:20px;';
      
      modalContent.appendChild(closeBtn);
      modalContent.appendChild(title);
      modalUsuario.appendChild(modalContent);
      document.body.appendChild(modalUsuario);
    }
    
    // 2. Verificar si existe el formulario, si no, crearlo
    let formUsuario = document.getElementById('formUsuario');
    if (!formUsuario) {
      console.log('Creando formulario de usuarios...');
      formUsuario = document.createElement('form');
      formUsuario.id = 'formUsuario';
      
      // Campos del formulario
      const campos = [
        { name: 'id', label: 'ID:', type: 'text', required: true },
        { name: 'nombre', label: 'Nombre:', type: 'text', required: true },
        { name: 'apellidos', label: 'Apellidos:', type: 'text' },
        { name: 'matricula', label: 'Matrícula:', type: 'text', required: true },
        { name: 'contrasena', label: 'Contraseña:', type: 'password', required: true },
        { name: 'rol', label: 'Rol:', type: 'select', options: ['admin', 'practicante'], required: true }
      ];
      
      campos.forEach(campo => {
        const div = document.createElement('div');
        div.style.marginBottom = '15px';
        
        const label = document.createElement('label');
        label.textContent = campo.label;
        label.htmlFor = campo.name;
        label.style.display = 'block';
        label.style.marginBottom = '5px';
        
        div.appendChild(label);
        
        if (campo.type === 'select') {
          const select = document.createElement('select');
          select.name = campo.name;
          select.id = campo.name;
          if (campo.required) select.required = true;
          
          campo.options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option === 'admin' ? 'Administrador' : 'Practicante';
            select.appendChild(opt);
          });
          
          div.appendChild(select);
        } else {
          const input = document.createElement('input');
          input.type = campo.type;
          input.name = campo.name;
          input.id = campo.name;
          if (campo.required) input.required = true;
          
          div.appendChild(input);
        }
        
        formUsuario.appendChild(div);
      });
      
      // Botones del formulario
      const buttonsDiv = document.createElement('div');
      buttonsDiv.style.display = 'flex';
      buttonsDiv.style.gap = '10px';
      buttonsDiv.style.marginTop = '20px';
      
      const submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.textContent = 'Registrar';
      submitBtn.style.cssText = 'padding:8px 16px; background:#1976d2; color:white; border:none; border-radius:4px; cursor:pointer; flex:1;';
      
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.id = 'btnCancelarUsuario';
      cancelBtn.textContent = 'Cancelar';
      cancelBtn.style.cssText = 'padding:8px 16px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer; flex:1;';
      
      buttonsDiv.appendChild(submitBtn);
      buttonsDiv.appendChild(cancelBtn);
      formUsuario.appendChild(buttonsDiv);
      
      // Añadir el formulario al modal
      modalUsuario.querySelector('div').appendChild(formUsuario);
    } else {
      // Verificar si existe el botón cancelar
      let cancelBtn = document.getElementById('btnCancelarUsuario');
      if (!cancelBtn) {
        console.log('Agregando botón de cancelar...');
        cancelBtn = document.createElement('button');
        cancelBtn.type = 'button';
        cancelBtn.id = 'btnCancelarUsuario';
        cancelBtn.textContent = 'Cancelar';
        cancelBtn.style.cssText = 'padding:8px 16px; background:#f44336; color:white; border:none; border-radius:4px; cursor:pointer; margin-left:10px;';
        
        const submitBtn = formUsuario.querySelector('button[type="submit"]');
        if (submitBtn) {
          submitBtn.parentNode.insertBefore(cancelBtn, submitBtn.nextSibling);
        } else {
          formUsuario.appendChild(cancelBtn);
        }
      }
    }
    
    // 3. Verificar si existe el botón para abrir el modal
    let btnNuevoUsuario = document.getElementById('btnNuevoUsuario');
    let btnRegistrarUsuario = document.getElementById('btnRegistrarUsuario');
    
    if (!btnNuevoUsuario && !btnRegistrarUsuario) {
      console.log('Creando botón para abrir el modal...');
      btnNuevoUsuario = document.createElement('button');
      btnNuevoUsuario.id = 'btnNuevoUsuario';
      btnNuevoUsuario.textContent = 'Registrar Nuevo Usuario';
      btnNuevoUsuario.style.cssText = 'padding:8px 16px; background:#4caf50; color:white; border:none; border-radius:4px; cursor:pointer; margin:10px;';
      
      // Buscar el modal de personal para añadirlo allí
      const modalPersonal = document.getElementById('modalPersonal');
      if (modalPersonal) {
        modalPersonal.querySelector('div').insertAdjacentElement('afterbegin', btnNuevoUsuario);
      } else {
        document.body.insertAdjacentElement('beforeend', btnNuevoUsuario);
      }
    }
    
    console.log('¡Arreglos completados! Recarga la página para aplicar los controladores.');
  });
})();