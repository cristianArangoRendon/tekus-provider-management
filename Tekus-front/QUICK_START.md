# 🚀 Guía de Inicio Rápido - Tekus-Front

## ✅ Verificación de la Instalación

El proyecto **Tekus-front** ha sido creado con la siguiente estructura:

### 📁 Archivos de Configuración Creados
- ✅ `package.json` - Dependencias del proyecto
- ✅ `angular.json` - Configuración de Angular CLI
- ✅ `tsconfig.json` - Configuración principal de TypeScript
- ✅ `tsconfig.app.json` - Configuración TypeScript para la aplicación
- ✅ `tsconfig.spec.json` - Configuración TypeScript para tests
- ✅ `.gitignore` - Archivos ignorados por Git

### 📚 Documentación Creada
- ✅ `README.md` - Documentación principal del proyecto
- ✅ `ARCHITECTURE.md` - Documentación detallada de la arquitectura
- ✅ `PROJECT_STRUCTURE.md` - Estructura visual del proyecto

### 🏗️ Estructura del Proyecto Creada

#### Core Layer (Capa de Núcleo)
- ✅ `ResponseDTO` - DTO para respuestas HTTP
- ✅ `PaginatorDTO` - DTO para paginación
- ✅ `TableResultDTO` - DTO para resultados de tablas
- ✅ `UserDTO` - DTO de ejemplo para usuarios
- ✅ `IHttpService` - Interfaz del servicio HTTP
- ✅ `IUserService` - Interfaz del servicio de usuarios

#### Infrastructure Layer (Capa de Infraestructura)
- ✅ `HttpService` - Servicio base para peticiones HTTP
- ✅ `ConfigService` - Servicio de configuración
- ✅ `UserService` - Servicio de ejemplo para usuarios
- ✅ `UserUseCase` - Caso de uso de ejemplo para usuarios

#### Presentation Layer (Capa de Presentación)
- ✅ `AppComponent` - Componente raíz
- ✅ `AppModule` - Módulo principal
- ✅ `AppRoutingModule` - Módulo de rutas

### 🎨 Archivos de UI
- ✅ `index.html` - HTML principal
- ✅ `main.ts` - Punto de entrada
- ✅ `styles.scss` - Estilos globales
- ✅ `environment.ts` - Variables de ambiente (dev)
- ✅ `environment.prod.ts` - Variables de ambiente (prod)

## 🔧 Pasos para Ejecutar el Proyecto

### 1. Instalar Dependencias
```bash
cd Tekus-front
npm install
```

### 2. Configurar URL del Backend
Edita `src/app/infrastructure/services/config/config.service.ts`:
```typescript
private apiUrl: string = 'http://tu-backend-url.com/api';
```

O usa el método `setUrlApplication`:
```typescript
configService.setUrlApplication('http://localhost:3000/api');
```

### 3. Ejecutar en Modo Desarrollo
```bash
npm start
```

El proyecto estará disponible en: `http://localhost:4200`

### 4. Compilar para Producción
```bash
npm run build
```

Los archivos compilados estarán en: `dist/tekus-front/`

## 📖 Cómo Usar la Arquitectura

### Ejemplo: Crear un Nuevo Módulo de Productos

#### 1. Crear DTOs
```typescript
// src/app/core/data-transfer-object/app/product.dto.ts
export interface ProductDTO {
    productId: number;
    name: string;
    price: number;
    stock: number;
}

export interface CreateProductDTO {
    name: string;
    price: number;
    stock: number;
}
```

#### 2. Crear Interfaz del Servicio
```typescript
// src/app/core/interfaces/app/IProduct.service.ts
export interface IProductService {
    getProducts(): Observable<ResponseDTO>;
    createProduct(product: CreateProductDTO): Observable<ResponseDTO>;
}
```

#### 3. Crear Servicio
```typescript
// src/app/infrastructure/services/app/product.service.ts
@Injectable({ providedIn: 'root' })
export class ProductService implements IProductService {
    constructor(
        private httpService: HttpService,
        private configService: ConfigService
    ) {}

    getProducts(): Observable<ResponseDTO> {
        return this.configService.getUrlApplication().pipe(
            switchMap(url => this.httpService.get(url, 'products'))
        );
    }

    createProduct(product: CreateProductDTO): Observable<ResponseDTO> {
        return this.configService.getUrlApplication().pipe(
            switchMap(url => 
                this.httpService.post(url, 'products', null, product)
            )
        );
    }
}
```

#### 4. Crear Caso de Uso
```typescript
// src/app/infrastructure/use-cases/app/product.usecase.ts
@Injectable({ providedIn: 'root' })
export class ProductUseCase {
    constructor(private productService: ProductService) {}

    getProductList(): Observable<TableResultDTO> {
        return this.productService.getProducts().pipe(
            map(response => ({
                results: response.data || [],
                totalRecords: response.data?.length || 0
            }))
        );
    }

    createProduct(product: CreateProductDTO): Observable<boolean> {
        return new Observable<boolean>((observer) => {
            this.productService.createProduct(product).subscribe({
                next: (response) => {
                    observer.next(response.isSuccess);
                    observer.complete();
                },
                error: () => {
                    observer.next(false);
                    observer.complete();
                }
            });
        });
    }
}
```

#### 5. Usar en un Componente
```typescript
// src/app/presentation/pages/products/product-list.component.ts
export class ProductListComponent implements OnInit {
    products: ProductDTO[] = [];

    constructor(private productUseCase: ProductUseCase) {}

    ngOnInit(): void {
        this.loadProducts();
    }

    loadProducts(): void {
        this.productUseCase.getProductList().subscribe(
            result => this.products = result.results
        );
    }

    createProduct(product: CreateProductDTO): void {
        this.productUseCase.createProduct(product).subscribe(
            success => {
                if (success) {
                    this.loadProducts();
                }
            }
        );
    }
}
```

## 🎯 Ventajas de esta Arquitectura

### ✨ Testeable
Cada capa se puede testear independientemente con mocks

### 🔄 Mantenible
Código organizado y fácil de entender

### 📈 Escalable
Agregar nuevas funcionalidades sin romper las existentes

### 🔌 Desacoplado
Cambios en una capa no afectan a las otras

### 🚀 Reutilizable
Componentes, servicios y casos de uso reutilizables

## 📝 Checklist de Implementación

Para cada nueva funcionalidad:

- [ ] Crear DTOs en `core/data-transfer-object/app/`
- [ ] Crear interface en `core/interfaces/app/`
- [ ] Implementar servicio en `infrastructure/services/app/`
- [ ] Implementar caso de uso en `infrastructure/use-cases/app/`
- [ ] Crear componentes en `presentation/components/` o `presentation/pages/`
- [ ] Agregar rutas en `app-routing.module.ts`
- [ ] Registrar servicios en `app.module.ts` (si no usan providedIn: 'root')

## 🐛 Debugging

### Verificar Peticiones HTTP
Las peticiones HTTP se pueden monitorear en:
- DevTools de Chrome > Network tab
- Console logs en `HttpService`

### Verificar Configuración
```typescript
// En cualquier componente
constructor(private configService: ConfigService) {
    console.log('API URL:', this.configService.getApiUrl());
}
```

## 📞 Soporte

Para más información, consulta:
- `README.md` - Documentación general
- `ARCHITECTURE.md` - Detalles de arquitectura
- `PROJECT_STRUCTURE.md` - Estructura del proyecto

## 🎉 ¡Proyecto Listo!

El proyecto **Tekus-front** está completamente configurado y listo para desarrollar.

**Siguiente paso**: Ejecuta `npm install` y comienza a agregar tus módulos de negocio.
