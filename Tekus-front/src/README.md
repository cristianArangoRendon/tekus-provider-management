# TEKUS - Sistema de Gestión de Proveedores

## 🚀 Prueba Técnica - Frontend

Sistema web profesional para la administración de proveedores y sus servicios, desarrollado con Angular 18 y Material Design.

---

## 📋 Descripción del Proyecto

Aplicación web para TEKUS S.A.S. que permite gestionar proveedores, servicios y países donde se ofrecen dichos servicios. Implementa autenticación, guards, routing y una interfaz profesional con Material Design.

---

## 🔐 Sistema de Autenticación

### Credenciales por Defecto

Para acceder al sistema, utilice las siguientes credenciales:

```
Usuario:    admin@tekus.com
Contraseña: Tekus2024!
```

### Características del Login

- ✅ Validación de formularios reactivos
- ✅ Mensajes de error descriptivos
- ✅ Botón para autocompletar credenciales de prueba
- ✅ Indicador de carga durante el login
- ✅ Toggle para mostrar/ocultar contraseña
- ✅ Checkbox "Recordarme"
- ✅ Diseño responsive y profesional
- ✅ Animaciones suaves
- ✅ Guards para protección de rutas

---

## 🛠️ Tecnologías Utilizadas

- **Angular 18** - Framework principal
- **Angular Material** - Componentes UI
- **TypeScript** - Lenguaje de programación
- **SCSS** - Estilos avanzados
- **RxJS** - Programación reactiva
- **Reactive Forms** - Manejo de formularios

---

## 📁 Estructura del Proyecto

```
src/
├── app/
│   ├── auth/                           # Módulo de autenticación
│   │   ├── guards/
│   │   │   └── auth.guard.ts          # Guard para proteger rutas
│   │   ├── login/
│   │   │   ├── login.component.ts     # Lógica del login
│   │   │   ├── login.component.html   # Template del login
│   │   │   └── login.component.scss   # Estilos del login
│   │   ├── services/
│   │   │   └── auth.service.ts        # Servicio de autenticación
│   │   ├── auth.module.ts             # Módulo de autenticación
│   │   └── auth-routing.module.ts     # Rutas de autenticación
│   ├── dashboard/
│   │   ├── dashboard.component.ts     # Componente principal
│   │   ├── dashboard.component.html
│   │   └── dashboard.component.scss
│   ├── core/                          # DTOs y modelos
│   ├── infrastructure/                # Servicios compartidos
│   ├── app-routing.module.ts          # Rutas principales
│   └── app.module.ts                  # Módulo principal
└── styles.scss                        # Estilos globales
```

---

## 🚦 Instalación y Ejecución

### Requisitos Previos

- Node.js (v18 o superior)
- npm (v9 o superior)
- Angular CLI (v18 o superior)

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd Tekus-front
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar la aplicación**
   ```bash
   npm start
   # o
   ng serve
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:4200
   ```

---

## 🎯 Funcionalidades Implementadas

### ✅ Fase 1: Autenticación y Navegación

- [x] Login profesional con Material Design
- [x] Validación de formularios
- [x] Servicio de autenticación (sin backend)
- [x] Guards para protección de rutas
- [x] Lazy loading de módulos
- [x] Dashboard inicial
- [x] Logout funcional
- [x] Almacenamiento en localStorage
- [x] Token simulado (JWT-like)

### 🔄 Fase 2: Gestión de Proveedores (Por Implementar)

- [ ] CRUD de proveedores
- [ ] Campos personalizados dinámicos
- [ ] Paginación, búsqueda y ordenamiento
- [ ] Validaciones de negocio
- [ ] Integración con API backend

### 🔄 Fase 3: Gestión de Servicios (Por Implementar)

- [ ] CRUD de servicios
- [ ] Relación servicios-proveedores
- [ ] Asignación de países
- [ ] Consulta de países desde servicio externo
- [ ] Indicadores y reportes

---

## 🔒 Seguridad

### Características de Seguridad Implementadas

1. **Auth Guard**: Protege rutas que requieren autenticación
2. **Token Storage**: Almacena token de sesión en localStorage
3. **Session Management**: Manejo de sesión del usuario
4. **Auto Redirect**: Redirección automática según estado de autenticación

### Usuario por Defecto

Por seguridad, el usuario y contraseña están definidos únicamente en el `AuthService` y no están expuestos en variables de entorno en esta versión de prueba.

---

## 📱 Responsive Design

La aplicación es completamente responsive y se adapta a diferentes tamaños de pantalla:

- **Desktop**: Experiencia completa con todas las funcionalidades
- **Tablet**: Layout optimizado para pantallas medianas
- **Mobile**: Interfaz simplificada para dispositivos móviles

---

## 🎨 Diseño y UX

### Paleta de Colores

- **Primario**: `#667eea` (Azul violeta)
- **Secundario**: `#764ba2` (Púrpura)
- **Gradiente**: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`

### Características de Diseño

- Material Design como base
- Animaciones suaves y profesionales
- Feedback visual en todas las interacciones
- Iconografía consistente
- Tipografía Roboto

---

## 🧪 Testing

### Comandos de Testing

```bash
# Ejecutar pruebas unitarias
npm test

# Ejecutar pruebas con coverage
npm run test:coverage

# Ejecutar pruebas e2e
npm run e2e
```

---

## 🔧 Configuración de Desarrollo

### Variables de Entorno

Los archivos de entorno están en:
- `src/environments/environment.ts` (desarrollo)
- `src/environments/environment.prod.ts` (producción)

### Scripts Disponibles

```json
{
  "start": "ng serve",
  "build": "ng build",
  "watch": "ng build --watch --configuration development",
  "test": "ng test"
}
```

---

## 📝 Arquitectura y Patrones

### Patrones Implementados

1. **Lazy Loading**: Carga diferida de módulos para optimizar rendimiento
2. **Guards**: Protección de rutas con CanActivate
3. **Services**: Separación de lógica de negocio
4. **Reactive Forms**: Manejo robusto de formularios
5. **Observables**: Programación reactiva con RxJS
6. **Separation of Concerns**: Separación clara entre capas

### Estructura de Carpetas

- `core/`: DTOs, interfaces, modelos
- `infrastructure/`: Servicios compartidos, HTTP
- `auth/`: Módulo de autenticación completo
- `dashboard/`: Componente principal de la aplicación

---

## 🚀 Próximos Pasos

1. **Backend Integration**: Conectar con API REST
2. **Proveedores CRUD**: Implementar gestión completa
3. **Servicios CRUD**: Implementar gestión completa
4. **Países Service**: Integrar servicio externo de países
5. **Reports & Analytics**: Implementar indicadores
6. **Testing**: Pruebas unitarias y e2e
7. **Documentation**: Documentación técnica completa

---

## 👨‍💻 Autor

Desarrollado como prueba técnica para **TEKUS S.A.S.**

---

## 📄 Licencia

Este proyecto es parte de una prueba técnica y es de uso exclusivo para evaluación.

---

## 📞 Contacto

Para cualquier consulta sobre el proyecto:
- Email: [TU_EMAIL]
- LinkedIn: [TU_LINKEDIN]

---

## 🎉 ¡Gracias por revisar este proyecto!

Este es un sistema base que demuestra las capacidades de desarrollo frontend con Angular y Material Design. El proyecto está preparado para escalar e implementar todas las funcionalidades requeridas en la prueba técnica.
