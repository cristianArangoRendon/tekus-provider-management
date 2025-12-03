# Tekus Front

Proyecto Angular con arquitectura limpia basada en el patrón de casos de uso, servicios y capas bien definidas.

## 🏗️ Arquitectura del Proyecto

Este proyecto sigue una arquitectura limpia con separación clara de responsabilidades:

```
src/app/
├── core/                          # Núcleo de la aplicación
│   ├── data-transfer-object/      # DTOs (Data Transfer Objects)
│   │   ├── common/                # DTOs comunes
│   │   │   ├── response/          # ResponseDTO
│   │   │   ├── paginator/         # PaginatorDTO
│   │   │   └── table-result/      # TableResultDTO
│   │   └── app/                   # DTOs específicos de la aplicación
│   │       └── user.dto.ts        # DTOs de usuarios
│   └── interfaces/                # Interfaces y contratos
│       ├── http-services/         # Interfaces de servicios HTTP
│       └── app/                   # Interfaces de servicios de aplicación
│
├── infrastructure/                # Capa de infraestructura
│   ├── services/                  # Servicios de peticiones HTTP
│   │   ├── http-services/         # Servicio HTTP base
│   │   ├── config/                # Servicio de configuración
│   │   └── app/                   # Servicios específicos
│   │       └── user.service.ts    # Servicio de usuarios
│   ├── use-cases/                 # Casos de uso (lógica de negocio)
│   │   └── app/
│   │       └── user.usecase.ts    # Caso de uso de usuarios
│   ├── guards/                    # Guards de Angular
│   └── helpers/                   # Funciones auxiliares
│
└── presentation/                  # Capa de presentación
    ├── components/                # Componentes reutilizables
    └── pages/                     # Páginas de la aplicación
```

## 📋 Flujo de Datos

1. **Component/Page** → Llama al caso de uso
2. **Use Case** → Procesa la lógica de negocio y llama al servicio
3. **Service** → Realiza la petición HTTP usando HttpService
4. **HttpService** → Ejecuta la petición y maneja errores
5. **Response** → Retorna por la cadena hasta el componente

### Ejemplo de flujo:

```typescript
// 1. Componente llama al caso de uso
this.userUseCase.getListUsers(searchTerm, paginator)
  .subscribe(result => {
    // Maneja el resultado
  });

// 2. Caso de uso procesa y llama al servicio
getListUsers(searchTerm?: string, paginator?: PaginatorDTO): Observable<TableResultDTO> {
  return this.userService.getListUsers(searchTerm, paginator).pipe(
    map(response => this.transformResponse(response))
  );
}

// 3. Servicio hace la petición HTTP
getListUsers(searchTerm?: string, paginator?: PaginatorDTO): Observable<ResponseDTO> {
  return this.configService.getUrlApplication().pipe(
    switchMap(url => this.httpService.get(url, 'users', params))
  );
}
```

## 🚀 Características Principales

### 1. HttpService
Servicio base para todas las peticiones HTTP con:
- Manejo automático de tokens JWT
- Interceptación de errores
- Construcción de URLs con parámetros
- Manejo de respuestas unificadas

### 2. Use Cases (Casos de Uso)
Capa de lógica de negocio que:
- Procesa y transforma datos
- Maneja la lógica específica de la aplicación
- Coordina múltiples servicios si es necesario
- Proporciona métodos de utilidad

### 3. Services (Servicios)
Capa de comunicación con APIs que:
- Realiza peticiones HTTP específicas
- Construye endpoints y parámetros
- Mantiene la firma de contratos con el backend

### 4. DTOs (Data Transfer Objects)
Objetos para transferencia de datos que:
- Definen la estructura de datos
- Facilitan el tipado fuerte
- Documentan los contratos de API

## 📦 Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm start

# Compilar para producción
npm run build
```

## 🔧 Configuración

La URL de la API se configura en el `ConfigService`:

```typescript
// Cambiar URL de la API
this.configService.setUrlApplication('http://tu-api.com/api');
```

## 📝 Crear Nuevas Funcionalidades

### 1. Crear DTOs

```typescript
// src/app/core/data-transfer-object/app/tu-modulo.dto.ts
export interface TuEntidadDTO {
  id: number;
  nombre: string;
}
```

### 2. Crear Interfaz del Servicio

```typescript
// src/app/core/interfaces/app/ITuModulo.service.ts
export interface ITuModuloService {
  obtenerDatos(): Observable<ResponseDTO>;
}
```

### 3. Crear Servicio

```typescript
// src/app/infrastructure/services/app/tu-modulo.service.ts
@Injectable({ providedIn: 'root' })
export class TuModuloService implements ITuModuloService {
  constructor(
    private httpService: HttpService,
    private configService: ConfigService
  ) {}
  
  obtenerDatos(): Observable<ResponseDTO> {
    return this.configService.getUrlApplication().pipe(
      switchMap(url => this.httpService.get(url, 'tu-endpoint'))
    );
  }
}
```

### 4. Crear Caso de Uso

```typescript
// src/app/infrastructure/use-cases/app/tu-modulo.usecase.ts
@Injectable({ providedIn: 'root' })
export class TuModuloUseCase {
  constructor(private tuModuloService: TuModuloService) {}
  
  obtenerDatosTransformados(): Observable<TuEntidadDTO[]> {
    return this.tuModuloService.obtenerDatos().pipe(
      map(response => this.transformar(response))
    );
  }
}
```

### 5. Usar en Componente

```typescript
export class TuComponente {
  constructor(private tuModuloUseCase: TuModuloUseCase) {}
  
  cargarDatos() {
    this.tuModuloUseCase.obtenerDatosTransformados()
      .subscribe(datos => {
        // Usar los datos
      });
  }
}
```

## 🎯 Mejores Prácticas

1. **Separación de Responsabilidades**: Cada capa tiene una responsabilidad específica
2. **Inyección de Dependencias**: Usar siempre DI de Angular
3. **Tipado Fuerte**: Usar DTOs e interfaces en todas partes
4. **Observables**: Preferir Observables sobre Promises
5. **Manejo de Errores**: Siempre manejar errores en los casos de uso
6. **Nomenclatura Consistente**: Seguir las convenciones establecidas

## 📚 Tecnologías

- Angular 18
- TypeScript 5.4
- RxJS 7.8
- SCSS

## 🤝 Contribuir

1. Seguir la arquitectura establecida
2. Mantener la separación de capas
3. Documentar el código
4. Escribir código limpio y mantenible

## 📄 Licencia

Este proyecto es privado y confidencial.
