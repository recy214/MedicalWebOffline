# 🚨 AYUDA RÁPIDA: "Mi Login No Funciona"

## 🔴 ERROR CRÍTICO CORREGIDO

Si ves este error en consola:
```
Uncaught SyntaxError: HTML comments are not allowed in modules
```

**✅ Este error ya fue CORREGIDO en `index.html`**

**Solución:**
1. Refrescar con Ctrl+Shift+R (hard reload)
2. Si persiste: Limpiar cache del navegador
3. Ver `REPORTE_FIX_SINTAXIS_LOGIN.md` para detalles

---

## ⚡ Solución Rápida (2 minutos)

### Paso 1: Abrir Herramienta de Diagnóstico
```
http://localhost:3001/test-login.html
```

### Paso 2: Click en "🚀 Ejecutar Diagnóstico Completo"

### Paso 3: Leer resultados
- 🟢 **Verde** = Todo bien, continúa
- 🔴 **Rojo** = Problema encontrado, lee el mensaje
- 🟡 **Amarillo** = Advertencia, puede funcionar igual

---

## 🔴 Si Ves: "Service Worker NO INSTALADO"

### Problema
Nunca visitaste la app con conexión a internet.

### Solución
```bash
1. Conectar a internet
2. Abrir: http://localhost:3001
3. Esperar 5 segundos
4. Buscar en consola (F12): "[SW] Precache completado"
5. Ahora funciona offline para siempre
```

---

## 🔴 Si Ves: "Cache vacío o incompleto"

### Problema
El Service Worker no terminó de descargar archivos.

### Solución
```
1. Click en botón: "🧹 Limpiar Todo y Reiniciar"
2. Esperar 3 segundos
3. Página se recargará automáticamente
4. Esperar: "[SW] Precache completado"
```

---

## 🔴 Si Ves: "localStorage BLOQUEADO"

### Problema
Navegador bloqueando almacenamiento local.

### Solución
```
1. ¿Estás en modo incógnito? → Usar ventana normal
2. ¿Tienes extensiones? → Desactivar temporalmente
3. Verificar configuración → Permitir cookies/storage
```

---

## 🔴 Si Ves: "Service Worker no activo"

### Problema
SW instalado pero no activado.

### Solución
```
1. DevTools (F12) → Application → Service Workers
2. Click en "Update"
3. Refrescar página (F5)
```

---

## ✅ Si TODO Está Verde

### Problema
No es técnico, puede ser error de usuario.

### Verificar:
```
1. ¿Usuario correcto? → admin
2. ¿Contraseña correcta? → admin123
3. ¿Haces click en "Iniciar sesión"?
4. ¿Ves algún error en consola? → Presiona F12
```

---

## 🆘 Último Recurso: Reset Completo

Si nada funciona:

```bash
1. Cerrar TODOS los tabs de localhost:3001
2. Abrir test-login.html
3. Click: "🧹 Limpiar Todo y Reiniciar"
4. Esperar recarga automática
5. Ir a http://localhost:3001
6. Esperar precache
7. Intentar login de nuevo
```

---

## 📞 Reportar Problema

Si después de TODO esto no funciona, reporta:

1. **Captura del diagnóstico** (test-login.html con resultados)
2. **Captura de consola** (F12 → Console)
3. **Navegador y versión** (Chrome 120, Firefox 121, etc.)
4. **Sistema operativo** (Windows 11, macOS, Linux)
5. **¿Primera vez o funcionaba antes?**

---

## 💡 Datos Importantes

### Credenciales por defecto:
```
Usuario: admin
Contraseña: admin123
```

### Usuarios alternativos:
```
Usuario: pract
Contraseña: pract123
```

### Puerto del servidor:
```
http://localhost:3001
```

---

## 🎯 Recuerda

✅ El login **SÍ funciona offline**  
✅ Solo necesitas conexión **una vez** (para instalar SW)  
✅ Después funciona **100% sin internet**  
✅ No hay backend API, todo es local  

---

**¿Dudas?** Lee `DIAGNOSTICO_LOGIN.md` para más detalles.

