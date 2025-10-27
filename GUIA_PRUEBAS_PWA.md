# 🧪 GUÍA RÁPIDA DE PRUEBAS PWA

## ⚡ Prueba Rápida (5 minutos)

### 1. Iniciar Servidor
```bash
cd "VERSION 0.001 24-10-2025"
node server.js
```

Deberías ver:
```
Servidor ejecutandose en http://localhost:3001
```

---

### 2. Abrir Aplicación
1. Navegar a: `http://localhost:3001`
2. Abrir **DevTools** (F12)
3. Ir a **Application** → **Service Workers**

**✅ Verificación:**
- Estado: `activated and is running`
- Scope: `http://localhost:3001/`

---

### 3. Login (Funciona Online Y Offline)
**Credenciales de prueba:**
- Usuario: `admin`
- Contraseña: `admin123`

**✅ IMPORTANTE:** El login funciona **completamente offline** porque:
- ✅ No requiere servidor backend (no hay `/api/login`)
- ✅ Validación local contra `localStorage`
- ✅ JWT generado localmente con `jwtUtil.js`
- ✅ Usuarios almacenados en el navegador

**Observar en consola:**
```
🔐 === INICIO LOGIN JWT ===
🔐 Usuario solicitado: admin
✅ Usuario validado: Administrador ( admin )
🔧 Generando token JWT...
✅ Token JWT generado exitosamente
💾 Guardando token y usuario en localStorage...
✅ Datos guardados correctamente en localStorage
🔐 === LOGIN JWT COMPLETADO EXITOSAMENTE ===
```

**Nota:** Si hay conexión, se precargan recursos adicionales en `localStorage` para mejorar el rendimiento. Si estás offline, esta precarga se omite automáticamente.

---

### 4. Verificar Cache
**DevTools → Application → Cache Storage → `medical-v1`**

**✅ Verificación:**
- Debe contener **41 archivos**
- Buscar: `/js/controllers/pacienteController.js` ✅
- Buscar: `/manifest.webmanifest` ✅

---

### 5. Probar Offline
1. **DevTools → Network** → Marcar **Offline** ☑️
2. **Refrescar página** (F5 o Ctrl+R)
3. La app debe cargar completamente
4. Navegar a **"Pacientes"**

**Observar en consola:**
```
[PWA-LOAD-1] 🔑 Controlador: "/js/controllers/pacienteController.js"
[PWA-LOAD-2] 🚀 Intentando import() dinámico...
[PWA-LOAD-3] ✅ Import exitoso
[PWA-LOAD-5] ✅ initPacienteController() ejecutado exitosamente
```

**✅ Verificación:**
- Sin errores 404
- Página de Pacientes carga correctamente
- Formularios funcionan
- Modal funciona

---

### 6. Navegar Entre Secciones (Offline)
---

## 🔒 Entendiendo el Login Offline

### Escenario 1: Primer Uso (Con Conexión)
1. Usuario abre la app por primera vez
2. Service Worker se instala y cachea 41 archivos
3. Login valida credenciales desde `localStorage`
4. Se precargan recursos adicionales
5. **Resultado:** App lista para funcionar offline

### Escenario 2: Uso Offline (Después del Primer Uso)
1. Usuario abre la app sin conexión
2. Service Worker sirve archivos desde cache
3. Login valida credenciales desde `localStorage` (sin red)
4. Detección automática de offline omite precarga
5. **Resultado:** Login exitoso sin conexión

### Escenario 3: Primer Uso SIN Conexión ⚠️
**⚠️ LIMITACIÓN:** Si nunca has visitado la app con conexión:
- El Service Worker no está instalado
- No hay archivos en cache
- **Solución:** Necesitas conexión al menos UNA VEZ para instalar el SW

**Después de esa primera visita, la app funciona 100% offline.**

---

**Probar navegar a:**
- ✅ Usuarios y Personal
- ✅ Operaciones → Entrada/Salida
- ✅ Reportes
- ✅ Gestión Administrativa (solo admin)

**Cada navegación debe:**
- Cargar instantáneamente
- Sin errores en consola
- Controlador ejecutarse correctamente

---

## 🔍 Verificaciones Avanzadas

### A. Verificar Imports ESM
**Consola → Buscar:**
```
✅ "Import exitoso"
❌ "Failed to resolve module specifier"
❌ "Cannot use import statement"
```

---

### B. Verificar Detección de Conexión
**DevTools → Network → Buscar peticiones a:**
```
❌ google.com (NO debe existir)
✅ /img/uat-logo-2023.png (debe usar HEAD)
```

---

### C. Verificar Manifest
**DevTools → Application → Manifest**

**✅ Verificar:**
- Name: "Medical Web Offline"
- Theme Color: `#0f5671`
- Display: `standalone`
- Icons: 2 iconos

---

### D. Verificar Instalabilidad
**Escritorio:**
- Icono de instalación en barra de direcciones ⊕

**Móvil:**
- Opción "Agregar a pantalla de inicio"

---

## ❌ Errores Comunes

### Error: "Service Worker registration failed"
**Solución:**
1. Verificar que `sw.js` existe en la raíz
2. Verificar consola del servidor:
   ```
   GET /sw.js
   ```
3. Refrescar con Ctrl+Shift+R (hard reload)

---

### Error: "El login no funciona" 🔴
**Diagnóstico:**

**Caso A: Primera vez sin conexión**
- **Síntoma:** Botón de login no hace nada
- **Causa:** Service Worker no instalado (nunca se visitó online)
- **Solución:** 
  1. Conectar a internet
  2. Visitar la app una vez
  3. Esperar a que aparezca: `[SW] Precache completado exitosamente`
  4. Ahora funciona offline permanentemente

**Caso B: Service Worker no activo**
- **Síntoma:** Login funciona pero aparecen errores al navegar
- **Solución:**
  1. Abrir DevTools → Application → Service Workers
  2. Verificar estado: `activated and is running`
  3. Si no está activo, hacer click en **Update**
  4. Refrescar la página

**Caso C: Cache corrupto**
- **Síntoma:** Errores 404 al navegar después del login
- **Solución:**
  1. DevTools → Application → Clear Storage
  2. Marcar: **Service Workers** y **Cache Storage**
  3. Click en **Clear site data**
  4. Refrescar página (Ctrl+Shift+R)
  5. Esperar a que precache complete

**Caso D: localStorage bloqueado**
- **Síntoma:** Login no guarda la sesión
- **Solución:**
  1. Verificar modo incógnito (puede bloquear localStorage)
  2. Verificar configuración del navegador: permitir cookies/storage
  3. Consola: ejecutar `localStorage.setItem('test', '1')`
  4. Si falla, problema de permisos del navegador

**Verificación rápida (ejecutar en consola):**
```javascript
// Verificar Service Worker
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW:', reg ? 'INSTALADO ✅' : 'NO INSTALADO ❌');
});

// Verificar cache
caches.open('medical-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('Archivos en cache:', keys.length);
  });
});

// Verificar localStorage
console.log('localStorage funciona:', 
  typeof Storage !== 'undefined' ? 'SÍ ✅' : 'NO ❌');

// Verificar usuarios disponibles
import('./js/models/storageModel.js').then(m => {
  console.log('Usuarios:', m.authModel.getUsers().length);
});
```

---

### Error: "Cache is empty"
**Solución:**
1. DevTools → Application → Service Workers → **Unregister**
2. DevTools → Application → Clear Storage → **Clear site data**
3. Refrescar página (F5)
4. Esperar a que precache complete

---

### Error: "Failed to resolve module"
**Solución:**
1. Verificar rutas en `MenuInicio.js`:
   ```javascript
   '/js/controllers/pacienteController.js' // ✅ Correcto
   ```
2. Verificar que el archivo existe en cache
3. Verificar consola: debe usar `import()` dinámico

---

### Error: 404 en archivos
**Solución:**
1. Verificar que TODOS los archivos están en `URLS_TO_CACHE`
2. DevTools → Application → Service Workers → **Update**
3. Refrescar página

---

## 📋 Checklist Final

```
☑ Servidor iniciado en puerto 3001
☑ Service Worker registrado y activo
☑ Cache poblado con 41 archivos
☑ Login funciona online
☑ App funciona offline (F5 en modo offline)
☑ Navegación SPA funciona offline
☑ Controladores se cargan con import()
☑ Sin errores 404 en consola
☑ Sin errores de ESM en consola
☑ Detección de conexión usa recurso local
☑ Manifest válido e instalable
```

---

## 🎯 Prueba Completa (15 minutos)

### Escenario Real:

1. **Día 1 - Online:**
   - Iniciar servidor
   - Login como admin
   - Navegar por todas las secciones
   - Agregar un paciente de prueba
   - Cerrar navegador

2. **Día 2 - Sin Internet:**
   - Desconectar WiFi/Ethernet
   - Abrir navegador
   - Ir a `http://localhost:3001`
   - Login (credenciales en localStorage)
   - **✅ App debe funcionar completamente**
   - Ver pacientes agregados
   - Navegar entre secciones
   - Todo debe funcionar sin red

3. **Día 3 - Online de nuevo:**
   - Conectar internet
   - Banner: "🌐 Conexión restaurada"
   - SW actualiza cache en background
   - App funciona con últimas actualizaciones

---

## 🚀 Comandos Útiles

### Ver logs del SW en tiempo real:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  console.log('SW State:', reg.active.state);
  console.log('SW Scope:', reg.scope);
});
```

### Ver contenido del cache:
```javascript
caches.open('medical-v1').then(cache => {
  cache.keys().then(keys => {
    console.log('Archivos en cache:', keys.length);
    keys.forEach(k => console.log(k.url));
  });
});
```

### Forzar actualización del SW:
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.update();
  console.log('SW actualizado');
});
```

### Desregistrar SW (reset completo):
```javascript
navigator.serviceWorker.getRegistration().then(reg => {
  reg.unregister();
  caches.keys().then(keys => {
    keys.forEach(key => caches.delete(key));
  });
  console.log('SW y caches eliminados');
});
```

---

## 📱 Prueba en Móvil

### Android Chrome:
1. Conectar a la misma red que el servidor
2. Obtener IP del servidor: `ipconfig` (Windows) o `ifconfig` (Linux/Mac)
3. Navegar a: `http://[IP]:3001`
4. Menú → **Agregar a pantalla de inicio**
5. Icono aparece en launcher
6. Abrir app → Funciona como nativa

### iOS Safari:
1. Mismo procedimiento de conexión
2. Botón **Compartir** → **Agregar a pantalla de inicio**
3. App instalada con icono personalizado

---

## ✅ Resultado Esperado Final

**Después de completar todas las pruebas:**

```
✅ PWA instalada en el dispositivo
✅ Funciona offline 100%
✅ Navegación fluida entre secciones
✅ Controladores ESM funcionan correctamente
✅ No hay errores en consola
✅ Detección de conexión sin dependencias externas
✅ Cache estratégico optimizado
✅ Actualización automática en background
```

**Estado:** 🎉 **PWA FUNCIONAL COMPLETO**

---

**Tiempo Total de Pruebas:** 5-15 minutos  
**Resultado:** 95% de éxito esperado

