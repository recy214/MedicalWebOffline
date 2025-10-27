# 🔍 DIAGNÓSTICO: "El Login No Funciona"

## 📌 Resumen Ejecutivo

El login de esta aplicación **funciona 100% offline** porque:
- ✅ NO hay backend API (`/api/login` no existe)
- ✅ Validación local en `localStorage`
- ✅ JWT generado en el cliente
- ✅ Sin dependencia de red para autenticar

**Si el login no funciona, es por una de estas 4 razones:**

---

## 🔴 Razón #1: Primera Vez Sin Conexión

### Síntoma
```
- Usuario nuevo abre la app sin internet
- Ingresa credenciales (admin / admin123)
- Click en "Iniciar sesión"
- No pasa nada o aparece error de red
```

### Causa
El **Service Worker no está instalado** porque nunca se visitó la app con conexión.

### Solución
```bash
1. Conectar a internet
2. Visitar http://localhost:3001
3. Esperar en consola:
   [SW] Precache completado exitosamente
4. Ahora funciona offline permanentemente
```

### Explicación Técnica
El Service Worker es un "proxy" que intercepta peticiones y sirve archivos desde cache. **Necesita instalarse al menos una vez con conexión**.

---

## 🔴 Razón #2: Service Worker No Activo

### Síntoma
```
- Login funciona
- Redirige a menuInicio.html
- Aparecen errores 404 o pantalla en blanco
```

### Verificación
```
DevTools → Application → Service Workers
Estado actual: ¿"activated and is running"?
```

### Solución
```javascript
// Opción A: Actualizar SW
DevTools → Application → Service Workers → Update

// Opción B: Forzar activación
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
  location.reload();
});
```

---

## 🔴 Razón #3: Cache Corrupto

### Síntoma
```
- Service Worker activo
- Login funciona
- Errores 404 al navegar:
  Failed to load resource: net::ERR_FAILED
  404 (Not Found) /js/controllers/pacienteController.js
```

### Verificación
```javascript
// Ejecutar en consola
caches.open('medical-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('Archivos en cache:', keys.length);
    // Debe ser 41 archivos
  });
});
```

### Solución: Limpiar Todo
```
1. DevTools → Application → Clear Storage
2. Marcar:
   ☑ Service Workers
   ☑ Cache Storage
   ☑ Local Storage (opcional)
3. Click: "Clear site data"
4. Cerrar DevTools
5. Ctrl+Shift+R (hard reload)
6. Esperar precache
```

---

## 🔴 Razón #4: localStorage Bloqueado

### Síntoma
```
- Login parece funcionar
- Redirige pero vuelve al login
- No guarda la sesión
```

### Verificación
```javascript
// Ejecutar en consola
try {
  localStorage.setItem('test', '1');
  console.log('localStorage: FUNCIONA ✅');
  localStorage.removeItem('test');
} catch(e) {
  console.error('localStorage: BLOQUEADO ❌', e);
}
```

### Causas Comunes
- Modo incógnito/privado
- Extensiones de privacidad (Privacy Badger, uBlock)
- Configuración del navegador
- Cuota de storage llena

### Solución
```
1. Salir del modo incógnito
2. Desactivar extensiones temporalmente
3. Configuración → Privacidad → Permitir cookies/storage
4. Limpiar datos antiguos:
   localStorage.clear();
```

---

## 🧪 Script de Diagnóstico Completo

**Ejecutar en la consola del navegador:**

```javascript
// ============================================
// DIAGNÓSTICO COMPLETO DEL LOGIN
// ============================================

console.log('🔍 === INICIANDO DIAGNÓSTICO ===\n');

// 1. Verificar Service Worker
console.log('📡 1. Service Worker:');
navigator.serviceWorker.getRegistration().then(reg => {
  if (reg) {
    console.log('   ✅ Instalado');
    console.log('   Estado:', reg.active ? reg.active.state : 'NO ACTIVO');
    console.log('   Scope:', reg.scope);
  } else {
    console.error('   ❌ NO INSTALADO - INSTALAR CON CONEXIÓN');
  }
});

// 2. Verificar Cache
console.log('\n💾 2. Cache Storage:');
caches.open('medical-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('   Archivos:', keys.length, '(debe ser 41)');
    if (keys.length < 41) {
      console.warn('   ⚠️ CACHE INCOMPLETO - Limpiar y recargar');
    } else {
      console.log('   ✅ Cache completo');
    }
  });
}).catch(e => {
  console.error('   ❌ Error accediendo cache:', e);
});

// 3. Verificar localStorage
console.log('\n🗄️ 3. localStorage:');
try {
  localStorage.setItem('_test_', '1');
  localStorage.removeItem('_test_');
  console.log('   ✅ Funciona correctamente');
} catch(e) {
  console.error('   ❌ BLOQUEADO:', e.message);
}

// 4. Verificar usuarios
console.log('\n👤 4. Usuarios disponibles:');
import('./js/models/storageModel.js').then(m => {
  const users = m.authModel.getUsers();
  console.log('   Total:', users.length);
  users.forEach(u => {
    console.log(`   - ${u.matricula} (${u.rol})`);
  });
  
  if (users.length === 0) {
    console.error('   ❌ NO HAY USUARIOS - localStorage corrupto');
  } else {
    console.log('   ✅ Usuarios cargados');
  }
}).catch(e => {
  console.error('   ❌ Error cargando usuarios:', e);
});

// 5. Verificar JWT
console.log('\n🔐 5. Sistema JWT:');
const jwtEnabled = localStorage.getItem('jwtEnabled');
console.log('   Estado:', jwtEnabled === 'true' ? 'ACTIVO ✅' : 'DESACTIVADO');

// 6. Verificar conexión
console.log('\n🌐 6. Conexión:');
console.log('   navigator.onLine:', navigator.onLine ? 'ONLINE ✅' : 'OFFLINE');

setTimeout(() => {
  console.log('\n🎯 === DIAGNÓSTICO COMPLETADO ===');
  console.log('📋 Revisa los resultados arriba ⬆️');
}, 2000);
```

---

## ✅ Resultado Esperado (Todo OK)

```
🔍 === INICIANDO DIAGNÓSTICO ===

📡 1. Service Worker:
   ✅ Instalado
   Estado: activated
   Scope: http://localhost:3001/

💾 2. Cache Storage:
   Archivos: 41 (debe ser 41)
   ✅ Cache completo

🗄️ 3. localStorage:
   ✅ Funciona correctamente

👤 4. Usuarios disponibles:
   Total: 2
   - admin (admin)
   - pract (practicante)
   ✅ Usuarios cargados

🔐 5. Sistema JWT:
   Estado: ACTIVO ✅

🌐 6. Conexión:
   navigator.onLine: ONLINE ✅

🎯 === DIAGNÓSTICO COMPLETADO ===
```

---

## 🛠️ Soluciones Por Navegador

### Chrome/Edge
```
1. Limpiar: chrome://settings/clearBrowserData
2. Marcar: "Cookies" y "Archivos almacenados en caché"
3. Rango: "Desde siempre"
4. Borrar datos
5. Visitar app de nuevo
```

### Firefox
```
1. Limpiar: about:preferences#privacy
2. "Limpiar datos del sitio"
3. Marcar todo
4. Limpiar
5. Visitar app de nuevo
```

### Safari
```
1. Desarrollador → Vaciar cachés
2. Safari → Preferencias → Privacidad → Gestionar datos
3. Eliminar localhost:3001
4. Visitar app de nuevo
```

---

## 📞 Soporte Adicional

Si después de seguir todos los pasos el login sigue sin funcionar:

### Información a proporcionar:
1. Navegador y versión
2. Sistema operativo
3. Captura del diagnóstico completo (ver arriba)
4. Captura de errores en consola (F12)
5. ¿Primera vez usando la app o funcionaba antes?

### Verificación final:
```javascript
// Test de login manual
import('./js/models/storageModel.js').then(m => {
  const result = m.authModel.loginWithJWT('admin', 'admin123');
  console.log('Test login:', result);
  
  if (result.success) {
    console.log('✅ LOGIN FUNCIONA - El problema es otro');
  } else {
    console.error('❌ LOGIN FALLA:', result.error);
  }
});
```

---

## 📚 Referencias

- `GUIA_PRUEBAS_PWA.md` - Guía completa de pruebas
- `js/controllers/authController.js` - Lógica del login
- `js/models/storageModel.js` - Validación de usuarios
- `sw.js` - Service Worker y cache

**Última actualización:** 2025-01-26

