# Arquitectura del Proyecto Tekus-Front

## 📐 Visión General

Este documento describe la arquitectura implementada en el proyecto Tekus-Front, basada en principios de arquitectura limpia (Clean Architecture) y el patrón de casos de uso.

## 🏛️ Capas de la Arquitectura

### 1. Core (Núcleo)
Contiene las definiciones fundamentales del dominio:

#### Data Transfer Objects (DTOs)
- **Ubicación**: `src/app/core/data-transfer-object/`
- **Propósito**: Definir las estructuras de datos que se transfieren entre capas
- **Tipos**:
  - **Common**: DTOs compartidos en toda la aplicación (ResponseDTO, PaginatorDTO, etc.)
  - **App**: DTOs específicos de cada módulo de negocio

**Ejemplo**:
```typescript
export interface UserDTO {
    userId: number;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    isActive: boolean;
}
```

#### Interfaces
- **Ubicación**: `src/app/core/interfaces/`
- **Propósito**: Definir contratos y abstracciones
- **Beneficios**:
  - Inversión de dependencias
  - Facilita testing con mocks
  - Desacoplamiento entre capas

**Ejemplo**:
```typescript
export interface IUserService {
    getListUsers(searchTerm?: string): Observable<ResponseDTO>;
    createUser(user: CreateUserDTO): Observable<ResponseDTO>;
}
```

### 2. Infrastructure (Infraestructura)
Implementaciones concretas de servicios y lógica de negocio:

#### Services (Servicios)
- **Ubicación**: `src/app/infrastructure/services/`
- **Propósito**: Comunicación con APIs externas
- **Responsabilidades**:
  - Construir URLs y parámetros
  - Realizar peticiones HTTP
  - Manejar autenticación
  - Serializar/deserializar datos

**Estructura**:
```
services/
├── http-services/      # Servicio HTTP base
├── config/            # Configuración de la app
├── auth/              # Servicios de autenticación
└── app/               # Servicios específicos de negocio
```

**Ejemplo de Servicio**:
```typescript
@Injectable({ providedIn: 'root' })
export class UserService implements IUserService {
    constructor(
        private httpService: HttpService,
        private configService: ConfigService
    ) {}

    getListUsers(searchTerm?: string): Observable<ResponseDTO> {
        return this.configService.getUrlApplication().pipe(
            switchMap(url => 
                this.httpService.get(url, 'users', { searchTerm })
            )
        );
    }
}
```

#### Use Cases (Casos de Uso)
- **Ubicación**: `src/app/infrastructure/use-cases/`
- **Propósito**: Implementar la lógica de negocio de la aplicación
- **Responsabilidades**:
  - Orquestar múltiples servicios
  - Transformar datos entre formatos
  - Aplicar reglas de negocio
  - Manejar errores de negocio
  - Proporcionar utilidades específicas del dominio

**Ejemplo de Caso de Uso**:
```typescript
@Injectable({ providedIn: 'root' })
export class UserUseCase {
    constructor(private userService: UserService) {}

    getListUsers(searchTerm?: string, paginator?: PaginatorDTO): Observable<TableResultDTO> {
        return this.userService.getListUsers(searchTerm, paginator).pipe(
            map(response => {
                // Transformación y lógica de negocio
                if (!response.isSuccess) {
                    return { results: [], totalRecords: 0 };
                }
                return this.transformToTableResult(response.data);
            }),
            catchError(error => {
                // Manejo de errores
                console.error('Error:', error);
                return of({ results: [], totalRecords: 0 });
            })
        );
    }

    // Lógica de negocio adicional
    getActiveUsers(paginator?: PaginatorDTO): Observable<UserDTO[]> {
        return this.getListUsers(undefined, paginator).pipe(
            map(result => result.results.filter(user => user.isActive))
        );
    }
}
```

#### Guards
- **Ubicación**: `src/app/infrastructure/guards/`
- **Propósito**: Proteger rutas y controlar accesos

#### Helpers
- **Ubicación**: `src/app/infrastructure/helpers/`
- **Propósito**: Funciones auxiliares reutilizables

### 3. Presentation (Presentación)
Capa de interfaz de usuario:

#### Components
- **Ubicación**: `src/app/presentation/components/`
- **Propósito**: Componentes reutilizables de UI
- **Ejemplos**: Botones, tablas, modales, formularios

#### Pages
- **Ubicación**: `src/app/presentation/pages/`
- **Propósito**: Páginas completas de la aplicación
- **Características**:
  - Componen múltiples componentes
  - Conectan con casos de uso
  - Manejan el estado de la página

## 🔄 Flujo de Datos Detallado

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │ Interacción
       ▼
┌─────────────────┐
│  Component/Page │ ← Capa de Presentación
└────────┬────────┘
         │ Llama al método
         ▼
┌─────────────────┐
│    Use Case     │ ← Capa de Lógica de Negocio
└────────┬────────┘
         │ • Valida datos
         │ • Aplica reglas
         │ • Transforma datos
         ▼
┌─────────────────┐
│     Service     │ ← Capa de Infraestructura
└────────┬────────┘
         │ • Construye URL
         │ • Serializa datos
         ▼
┌─────────────────┐
│   HttpService   │ ← Servicio HTTP Base
└────────┬────────┘
         │ • Añade headers
         │ • Maneja tokens
         │ • Intercepta errores
         ▼
┌─────────────────┐
│   Backend API   │
└─────────────────┘
```

## 🎯 Principios de Diseño

### 1. Separation of Concerns (SoC)
Cada capa tiene una responsabilidad única y bien definida:
- **Presentación**: UI y experiencia de usuario
- **Casos de Uso**: Lógica de negocio
- **Servicios**: Comunicación con APIs
- **Core**: Definiciones y contratos

### 2. Dependency Inversion
Las capas superiores no dependen de las inferiores, sino de abstracciones (interfaces):
```typescript
// ✅ Correcto
constructor(private userService: IUserService) {}

// ❌ Incorrecto (acoplamiento directo)
constructor(private userService: UserService) {}
```

### 3. Single Responsibility
Cada clase tiene una única razón para cambiar:
- **Service**: Solo cambia si cambia la API
- **Use Case**: Solo cambia si cambia la lógica de negocio
- **Component**: Solo cambia si cambia la UI

### 4. Open/Closed Principle
Abierto para extensión, cerrado para modificación:
```typescript
// Se pueden crear nuevos casos de uso sin modificar los existentes
export class UserUseCase {
    // Métodos base
}

export class ExtendedUserUseCase extends UserUseCase {
    // Nuevas funcionalidades
}
```

## 📊 Ventajas de esta Arquitectura

### 1. Testabilidad
- Cada capa se puede testear independientemente
- Fácil crear mocks de servicios
- Tests unitarios más simples

### 2. Mantenibilidad
- Código organizado y predecible
- Cambios localizados en capas específicas
- Fácil de entender para nuevos desarrolladores

### 3. Escalabilidad
- Agregar nuevas funcionalidades sin afectar las existentes
- Múltiples desarrolladores pueden trabajar en paralelo
- Módulos independientes

### 4. Reutilización
- Componentes y servicios reutilizables
- DTOs compartidos
- Lógica de negocio centralizada

### 5. Flexibilidad
- Fácil cambiar implementaciones
- Cambiar backend sin afectar la UI
- Reemplazar servicios sin romper casos de uso

## 🔧 Patrones Implementados

### 1. Repository Pattern (Servicios)
Los servicios actúan como repositorios que abstraen el acceso a datos.

### 2. Use Case Pattern
Cada funcionalidad de negocio es un caso de uso independiente.

### 3. DTO Pattern
Transferencia de datos estructurada y tipada.

### 4. Observer Pattern (RxJS)
Comunicación reactiva entre capas usando Observables.

### 5. Dependency Injection
Angular DI para gestionar dependencias y ciclo de vida.

## 📝 Convenciones de Nomenclatura

### Archivos
- DTOs: `*.dto.ts`
- Interfaces: `I*.service.ts`
- Servicios: `*.service.ts`
- Casos de Uso: `*.usecase.ts`
- Componentes: `*.component.ts`

### Clases y Tipos
- DTOs: `UserDTO`, `CreateUserDTO`
- Interfaces: `IUserService`, `IHttpService`
- Servicios: `UserService`, `HttpService`
- Casos de Uso: `UserUseCase`, `AuthUseCase`

## 🚀 Extensiones Futuras

### 1. State Management
Considerar Redux/NgRx para aplicaciones más complejas.

### 2. Caching
Implementar estrategias de cache en los servicios.

### 3. Offline Support
Añadir soporte offline con IndexedDB.

### 4. Real-time
Integrar WebSockets para datos en tiempo real.

## 📚 Referencias

- [Clean Architecture - Robert C. Martin](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Angular Style Guide](https://angular.io/guide/styleguide)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Domain-Driven Design](https://en.wikipedia.org/wiki/Domain-driven_design)
