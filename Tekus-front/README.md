Tekus Front

Proyecto Angular con arquitectura limpia basada en el patrón de casos de uso, servicios desacoplados e implementación modular. La estructura está diseñada para garantizar mantenibilidad, escalabilidad y claridad en el flujo de datos entre las capas.

Arquitectura del Proyecto

El proyecto sigue una arquitectura limpia, separada en capas con responsabilidades claramente definidas:

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
│   │   └── app/                   # Servicios específicos (ej. user.service.ts)
│   ├── use-cases/                 # Casos de uso (lógica de negocio)
│   │   └── app/
│   │       └── user.usecase.ts    # Caso de uso de usuarios
│   ├── guards/                    # Guards de Angular
│   └── helpers/                   # Funciones auxiliares
│
└── presentation/                  # Capa de presentación
    ├── components/                # Componentes reutilizables
    └── pages/                     # Páginas de la aplicación

Flujo de Datos

El flujo de comunicación entre capas sigue este orden:

El componente o página llama el caso de uso.

El caso de uso procesa reglas y llama al servicio correspondiente.

El servicio ejecuta las peticiones HTTP.

El HttpService arma la petición, maneja errores y retorna la respuesta.

La respuesta viaja de regreso hasta el componente.

Ejemplo completo de flujo
// 1. Componente invoca el caso de uso
this.userUseCase.getListUsers(searchTerm, paginator)
  .subscribe(result => {
    // Manejo del resultado final
  });

// 2. Caso de uso procesa y delega al servicio
getListUsers(searchTerm?: string, paginator?: PaginatorDTO): Observable<TableResultDTO> {
  return this.userService.getListUsers(searchTerm, paginator).pipe(
    map(response => this.transformResponse(response))
  );
}

// 3. Servicio arma la petición HTTP
getListUsers(searchTerm?: string, paginator?: PaginatorDTO): Observable<ResponseDTO> {
  return this.configService.getUrlApplication().pipe(
    switchMap(url =>
      this.httpService.get(url, 'users', params)
    )
  );
}

Características Principales del Proyecto
HttpService

Servicio base para todas las peticiones HTTP.
Incluye:

Manejo de autenticación mediante tokens JWT

Construcción dinámica de URLs

Encapsulación de manejo de errores

Respuestas homogéneas con ResponseDTO

Use Cases (Casos de Uso)

La capa que contiene la lógica de negocio.
Responsabilidades:

Aplicar lógica y transformaciones

Coordinar servicios

Mantener el flujo limpio entre front y API

Services (Servicios de Infraestructura)

Encargados de la comunicación con la API.
Funciones:

Realizar peticiones HTTP

Construir endpoints

Cumplir los contratos definidos en interfaces

DTOs

Objetos que definen los contratos de comunicación.
Beneficios:

Tipado fuerte

Documentación clara

Facilita escalabilidad

Instalación y Ejecución
npm install        # Instalar dependencias
npm start          # Ejecutar en modo desarrollo
npm run build      # Construir para producción

Configuración del Proyecto

La URL base de la API se administra desde el ConfigService:

this.configService.setUrlApplication('http://tu-api.com/api');


Para consultar el valor actual:

this.configService.getUrlApplication().subscribe(url => console.log(url));

Crear Nuevas Funcionalidades Paso a Paso
1. Crear DTOs
export interface TuEntidadDTO {
  id: number;
  nombre: string;
}

2. Crear la Interfaz del Servicio
export interface ITuModuloService {
  obtenerDatos(): Observable<ResponseDTO>;
}

3. Implementación del Servicio
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

4. Crear el Caso de Uso
@Injectable({ providedIn: 'root' })
export class TuModuloUseCase {

  constructor(private tuModuloService: TuModuloService) {}

  obtenerDatosTransformados(): Observable<TuEntidadDTO[]> {
    return this.tuModuloService.obtenerDatos().pipe(
      map(response => this.transformar(response))
    );
  }

  private transformar(response: ResponseDTO): TuEntidadDTO[] {
    return response.data;
  }
}

5. Invocarlo desde un Componente
export class TuComponente {

  constructor(private tuModuloUseCase: TuModuloUseCase) {}

  cargarDatos() {
    this.tuModuloUseCase.obtenerDatosTransformados()
      .subscribe(datos => {
        console.log(datos);
      });
  }
}

Mejores Prácticas

Mantener la separación de capas y responsabilidades

Usar siempre DTOs para comunicar datos

Implementar interfaces antes de servicios

Manejar errores siempre en los casos de uso

Aplicar tipado fuerte en todos los métodos

Nombrar las clases con patrones consistentes

Evitar lógica de negocio directamente en componentes

Tecnologías Utilizadas

Angular 18

RxJS 7.8

TypeScript 5.4

SCSS

Arquitectura basada en casos de uso

Servicios desacoplados mediante interfaces

Contribuir

Para contribuir se debe:

Respetar la arquitectura del proyecto

Organizar correctamente las carpetas

Documentar nuevas funcionalidades

Garantizar que el código sea limpio y legible

Mantener cohesión y bajo acoplamiento

Licencia

Este proyecto es privado, confidencial y no debe distribuirse sin autorización.

Si deseas, puedo generar también una versión corta, una versión corporativa, o una versión para presentación técnica.
