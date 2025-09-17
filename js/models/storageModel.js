// js/models/storageModel.js

// --- Gestión de Usuarios ---
const USERS_KEY = 'usuarios';
const CURRENT_USER_KEY = 'usuarioActual';
const ACTIVITY_LOG_KEY = 'registroActividad';

// Datos iniciales para asegurar que siempre haya usuarios de prueba
const usuariosFijos = [
  { id: 'admin', nombre: 'Administrador', apellidos: '', matricula: 'admin', contrasena: 'admin123', rol: 'admin' },
  { id: 'pract', nombre: 'Practicante', apellidos: '', matricula: 'pract', contrasena: 'pract123', rol: 'practicante' }
];

// Inicializar usuarios si no existen
if (!localStorage.getItem(USERS_KEY)) {
  localStorage.setItem(USERS_KEY, JSON.stringify(usuariosFijos));
}

// Inicializar registro de actividad si no existe
if (!localStorage.getItem(ACTIVITY_LOG_KEY)) {
  localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify([]));
}

export const authModel = {
  getUsers: () => JSON.parse(localStorage.getItem(USERS_KEY)) || [],
  
  validateUser: (matriculaOId, contrasena) => {
    const usuarios = authModel.getUsers();
    return usuarios.find(u => 
      ((u.rol === 'admin' && (u.id === matriculaOId || u.matricula === matriculaOId)) || 
       (u.rol === 'practicante' && u.matricula === matriculaOId)) && 
      u.contrasena === contrasena
    );
  },

  setCurrentUser: (usuario) => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(usuario));
  },

  getCurrentUser: () => JSON.parse(localStorage.getItem(CURRENT_USER_KEY)),

  logout: () => {
    // Registrar salida antes de eliminar el usuario actual
    const usuario = authModel.getCurrentUser();
    if (usuario) {
      authModel.registrarActividad(usuario.id, 'salida');
    }
    localStorage.removeItem(CURRENT_USER_KEY);
  },
  
  // Funciones para el registro de actividad
  registrarActividad: (usuarioId, tipo, detalles = '') => {
    const registro = {
      usuarioId,
      tipo, // 'entrada', 'salida', etc.
      timestamp: new Date().toISOString(),
      detalles
    };
    
    const registros = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY)) || [];
    registros.push(registro);
    localStorage.setItem(ACTIVITY_LOG_KEY, JSON.stringify(registros));
    
    return registro;
  },
  
  obtenerRegistros: (filtro = {}) => {
    const registros = JSON.parse(localStorage.getItem(ACTIVITY_LOG_KEY)) || [];
    
    // Aplicar filtros si existen
    if (Object.keys(filtro).length > 0) {
      return registros.filter(reg => {
        let coincide = true;
        
        if (filtro.usuarioId && reg.usuarioId !== filtro.usuarioId) {
          coincide = false;
        }
        
        if (filtro.tipo && reg.tipo !== filtro.tipo) {
          coincide = false;
        }
        
        if (filtro.desde) {
          const desde = new Date(filtro.desde);
          const timestamp = new Date(reg.timestamp);
          if (timestamp < desde) {
            coincide = false;
          }
        }
        
        if (filtro.hasta) {
          const hasta = new Date(filtro.hasta);
          const timestamp = new Date(reg.timestamp);
          if (timestamp > hasta) {
            coincide = false;
          }
        }
        
        return coincide;
      });
    }
    
    return registros;
  },

  addUser: (newUser) => {
    const usuarios = authModel.getUsers();
    if (usuarios.some(u => u.matricula === newUser.matricula || u.id === newUser.id)) {
      alert('Error: La matrícula o el ID ya existen.');
      return false;
    }
    usuarios.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
    return true;
  },

  deleteUser: (userIndex) => {
    let usuarios = authModel.getUsers();
    const userToDelete = usuarios[userIndex];
    const currentUser = authModel.getCurrentUser();
    if (userToDelete.id === currentUser.id) {
        alert('No puedes eliminar tu propia cuenta de administrador.');
        return;
    }
    usuarios.splice(userIndex, 1);
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
  },

  updateUser: (userIndex, updatedUser) => {
    let usuarios = authModel.getUsers();
    const userToUpdate = usuarios[userIndex];
    const currentUser = authModel.getCurrentUser();
    
    // Verificar si está intentando modificar su propia matrícula o ID siendo administrador
    if (userToUpdate.id === currentUser.id && 
        (userToUpdate.matricula !== updatedUser.matricula || userToUpdate.id !== updatedUser.id)) {
        alert('No puedes modificar tu propia matrícula o ID como administrador.');
        return false;
    }
    
    // Verificar que la nueva matrícula o ID no existan ya (excepto el usuario actual)
    const duplicado = usuarios.find((u, i) => 
        i !== parseInt(userIndex) && 
        (u.matricula === updatedUser.matricula || u.id === updatedUser.id)
    );
    
    if (duplicado) {
        alert('Error: La matrícula o el ID ya existen en otro usuario.');
        return false;
    }
    
    // Actualizar el usuario
    usuarios[userIndex] = {
        ...userToUpdate,
        ...updatedUser
    };
    
    localStorage.setItem(USERS_KEY, JSON.stringify(usuarios));
    
    // Si se modificó el usuario actual, actualizar la sesión
    if (userToUpdate.id === currentUser.id) {
        authModel.setCurrentUser({
            nombre: updatedUser.nombre,
            rol: updatedUser.rol,
            id: updatedUser.id
        });
    }
    
    return true;
  },

  getUserByIndex: (userIndex) => {
    const usuarios = authModel.getUsers();
    return usuarios[userIndex] || null;
  }
};