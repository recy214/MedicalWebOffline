# Medical Developer Web - Refactorización MVC

## Descripción
Este proyecto consiste en una refactorización del código original de Medical Developer a una arquitectura MVC (Modelo-Vista-Controlador), mejorando la organización, mantenibilidad y escalabilidad del código.

## Cambios Implementados

### 1. Arquitectura MVC
- **Modelos**: Se crearon modelos para manejar el almacenamiento y la lógica de negocio.
- **Vistas**: Se separaron las vistas para manejar la presentación de datos.
- **Controladores**: Se implementaron controladores para conectar modelos y vistas.

### 2. Sistema de Registro de Actividad
- Seguimiento de inicios y cierres de sesión de usuarios
- Visualización de registros en una tabla
- Exportación de registros a formato CSV

### 3. Mejoras en la Interfaz de Usuario
- Menú desplegable para usuario con opciones adicionales
- Botón mejorado para cerrar sesión
- Confirmación antes de cerrar sesión para evitar cierres accidentales

### 4. Otras Mejoras
- Manejo mejorado de modales y formularios
- Correcciones en la funcionalidad de cerrar/cancelar formularios
- Mayor seguridad en la gestión de usuarios

## Estructura del Proyecto

```
MedicalWebOffline/
├── js/
│   ├── controllers/      # Controladores para la lógica de negocio
│   ├── middleware/       # Middleware como authGuard
│   ├── models/           # Modelos para manejar datos
│   └── views/            # Vistas para la presentación
├── img/                  # Recursos gráficos
├── index.html            # Página de inicio de sesión
├── menuInicio.html       # Menú principal
├── ModalPersonal.html    # Modal para gestión de personal
└── ModalUsuario.html     # Modal para gestión de usuarios
```

## Cómo Usar

### Iniciar Sesión
- Usuario administrador: admin / admin123
- Usuario practicante: pract / pract123

### Registro de Actividad
1. Inicia sesión en el sistema
2. Haz clic en "Registro de Entradas/Salidas" en el menú principal
3. Visualiza el historial de actividad de usuarios
4. Opcionalmente, exporta los datos a CSV

### Cerrar Sesión
1. Haz clic en el icono de usuario en la esquina superior derecha
2. Selecciona "Cerrar sesión" del menú desplegable
3. Confirma la acción cuando se te solicite

## Notas Técnicas
- Los datos se almacenan en localStorage del navegador
- Se utiliza JavaScript modular con import/export
- La aplicación debe ejecutarse en un servidor web para funcionar correctamente (debido a los módulos ES6)