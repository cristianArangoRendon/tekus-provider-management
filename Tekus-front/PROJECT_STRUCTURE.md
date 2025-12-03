# Estructura del Proyecto Tekus-Front

```
Tekus-front/
│
├── 📄 Configuration Files
│   ├── angular.json              # Configuración de Angular CLI
│   ├── package.json              # Dependencias del proyecto
│   ├── tsconfig.json             # Configuración TypeScript principal
│   ├── tsconfig.app.json         # Configuración TypeScript para app
│   ├── tsconfig.spec.json        # Configuración TypeScript para tests
│   ├── .gitignore                # Archivos ignorados por Git
│   ├── README.md                 # Documentación principal
│   └── ARCHITECTURE.md           # Documentación de arquitectura
│
└── 📁 src/
    │
    ├── 📄 index.html             # HTML principal
    ├── 📄 main.ts                # Punto de entrada de la aplicación
    ├── 📄 styles.scss            # Estilos globales
    ├── 📄 config.json            # Configuración de la aplicación
    ├── 🖼️  favicon.ico            # Icono de la aplicación
    │
    ├── 📁 environments/          # Configuraciones por ambiente
    │   ├── environment.ts        # Ambiente de desarrollo
    │   └── environment.prod.ts   # Ambiente de producción
    │
    ├── 📁 assets/                # Recursos estáticos
    │   ├── images/               # Imágenes
    │   ├── fonts/                # Fuentes
    │   └── icons/                # Iconos
    │
    └── 📁 app/                   # Aplicación principal
        │
        ├── 📄 app.module.ts              # Módulo raíz
        ├── 📄 app-routing.module.ts      # Configuración de rutas
        ├── 📄 app.component.ts           # Componente raíz
        ├── 📄 app.component.html         # Template raíz
        └── 📄 app.component.scss         # Estilos raíz
        │
        ├── 📁 core/                      # ⚡ CAPA DE NÚCLEO
        │   │
        │   ├── 📁 data-transfer-object/  # DTOs (Data Transfer Objects)
        │   │   │
        │   │   ├── 📁 common/            # DTOs Comunes
        │   │   │   ├── 📁 response/
        │   │   │   │   └── response.dto.ts
        │   │   │   ├── 📁 paginator/
        │   │   │   │   └── paginator.dto.ts
        │   │   │   └── 📁 table-result/
        │   │   │       └── table-result.dto.ts
        │   │   │
        │   │   └── 📁 app/               # DTOs Específicos
        │   │       ├── user.dto.ts
        │   │       ├── product.dto.ts     # (ejemplo)
        │   │       └── order.dto.ts       # (ejemplo)
        │   │
        │   └── 📁 interfaces/            # Interfaces y Contratos
        │       ├── 📁 http-services/
        │       │   └── Ihttp.service.ts
        │       └── 📁 app/
        │           ├── IUser.service.ts
        │           ├── IProduct.service.ts  # (ejemplo)
        │           └── IOrder.service.ts    # (ejemplo)
        │
        ├── 📁 infrastructure/            # 🔧 CAPA DE INFRAESTRUCTURA
        │   │
        │   ├── 📁 services/              # Servicios de Peticiones HTTP
        │   │   │
        │   │   ├── 📁 http-services/     # Servicio HTTP Base
        │   │   │   └── http.service.ts   # ⭐ Servicio central de HTTP
        │   │   │
        │   │   ├── 📁 config/            # Configuración
        │   │   │   └── config.service.ts
        │   │   │
        │   │   ├── 📁 auth/              # Autenticación
        │   │   │   ├── auth.service.ts
        │   │   │   └── token.service.ts
        │   │   │
        │   │   └── 📁 app/               # Servicios Específicos
        │   │       ├── user.service.ts   # ⭐ Ejemplo implementado
        │   │       ├── product.service.ts  # (ejemplo)
        │   │       └── order.service.ts    # (ejemplo)
        │   │
        │   ├── 📁 use-cases/             # Casos de Uso (Lógica de Negocio)
        │   │   │
        │   │   ├── 📁 auth/              # Casos de uso de autenticación
        │   │   │   ├── login.usecase.ts
        │   │   │   └── register.usecase.ts
        │   │   │
        │   │   └── 📁 app/               # Casos de uso específicos
        │   │       ├── user.usecase.ts   # ⭐ Ejemplo implementado
        │   │       ├── product.usecase.ts  # (ejemplo)
        │   │       └── order.usecase.ts    # (ejemplo)
        │   │
        │   ├── 📁 guards/                # Guards de Angular
        │   │   ├── auth.guard.ts
        │   │   └── role.guard.ts
        │   │
        │   └── 📁 helpers/               # Funciones Auxiliares
        │       ├── date.helper.ts
        │       ├── validation.helper.ts
        │       └── format.helper.ts
        │
        └── 📁 presentation/              # 🎨 CAPA DE PRESENTACIÓN
            │
            ├── 📁 components/            # Componentes Reutilizables
            │   ├── 📁 shared/            # Componentes compartidos
            │   │   ├── button/
            │   │   ├── input/
            │   │   ├── table/
            │   │   ├── modal/
            │   │   └── card/
            │   │
            │   └── 📁 layout/            # Componentes de layout
            │       ├── header/
            │       ├── sidebar/
            │       └── footer/
            │
            └── 📁 pages/                 # Páginas de la Aplicación
                ├── 📁 home/
                │   ├── home.component.ts
                │   ├── home.component.html
                │   └── home.component.scss
                │
                ├── 📁 users/             # Ejemplo de módulo de usuarios
                │   ├── user-list/
                │   ├── user-detail/
                │   └── user-form/
                │
                ├── 📁 products/          # (ejemplo)
                └── 📁 orders/            # (ejemplo)
```

## 📊 Leyenda de Colores y Símbolos

- ⚡ **Core**: Núcleo de la aplicación (DTOs e Interfaces)
- 🔧 **Infrastructure**: Implementaciones y lógica de negocio
- 🎨 **Presentation**: Capa de UI y componentes visuales
- ⭐ **Archivos Implementados**: Archivos de ejemplo ya creados
- 📁 **Carpeta**: Directorio
- 📄 **Archivo**: Archivo individual

## 🎯 Flujo de Trabajo por Capas

### 1️⃣ CORE (Núcleo)
```
Define QUÉ datos se transfieren y QUÉ contratos existen
└── Sin dependencias de otras capas
    └── Puras definiciones TypeScript
```

### 2️⃣ INFRASTRUCTURE (Infraestructura)
```
Implementa CÓMO se obtienen y procesan los datos
├── Services: Comunicación con APIs
└── Use Cases: Lógica de negocio y transformación
```

### 3️⃣ PRESENTATION (Presentación)
```
Muestra CÓMO se visualiza la información al usuario
├── Components: Elementos reutilizables de UI
└── Pages: Páginas completas que usan los casos de uso
```

## 📦 Módulos Recomendados (Futuros)

```
app/
└── presentation/
    └── modules/
        ├── 📁 user-management/
        │   ├── user-management.module.ts
        │   ├── user-management-routing.module.ts
        │   └── pages/
        │
        ├── 📁 product-catalog/
        │   ├── product-catalog.module.ts
        │   └── ...
        │
        └── 📁 order-processing/
            ├── order-processing.module.ts
            └── ...
```

## 🔄 Patrón de Comunicación

```
Component
    ↓ (usa)
Use Case
    ↓ (llama a)
Service
    ↓ (usa)
HttpService
    ↓ (hace petición)
Backend API
```

## 📝 Notas Importantes

1. **Core**: Solo definiciones, sin lógica
2. **Infrastructure**: Toda la lógica de negocio
3. **Presentation**: Solo lógica de presentación
4. **Separation of Concerns**: Cada capa tiene su responsabilidad
5. **Dependency Flow**: Las dependencias fluyen hacia adentro (Core)
