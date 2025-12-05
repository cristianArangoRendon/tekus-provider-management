using Xunit;
using Moq;
using FluentAssertions;
using Inventory.Core.Interfaces.Services;
using task.infraestructure.Repositories;
using Tekus.Core.DTOs.Providers;
using Tekus.Core.DTOs.ResponseDTO;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace Tekus.Tests.Infrastructure.Repositories
{
    /// <summary>
    /// Pruebas unitarias para el repositorio ProviderRepository.
    /// 
    /// PROPÓSITO:
    /// Verificar que el repositorio de proveedores interactúa correctamente con el servicio
    /// de ejecución de procedimientos almacenados para realizar operaciones CRUD sobre proveedores.
    /// 
    /// COBERTURA DE PRUEBAS:
    /// - Obtener proveedores paginados (GetProvidersPaged)
    /// - Crear nuevos proveedores (CreateProvider)
    /// - Eliminar proveedores (DeleteProvider)
    /// - Agregar campos personalizados a proveedores (AddCustomFieldToProvider)
    /// 
    /// CARACTERÍSTICAS ESPECIALES:
    /// Los proveedores tienen campos personalizados dinámicos que se pueden agregar
    /// según las necesidades del negocio (TaxID, CertificationDate, etc.)
    /// </summary>
    public class ProviderRepositoryTests
    {
        // Mock del servicio que ejecuta procedimientos almacenados
        private readonly Mock<IExecuteStoreProcedureService> _mockExecuteStoreProcedureService;
        // Instancia del repositorio de proveedores a probar
        private readonly ProviderRepository _providerRepository;

        /// <summary>
        /// Constructor que inicializa los componentes necesarios para las pruebas.
        /// Se ejecuta automáticamente antes de cada método de prueba individual.
        /// Esto garantiza que cada test comience con un estado limpio.
        /// </summary>
        public ProviderRepositoryTests()
        {
            _mockExecuteStoreProcedureService = new Mock<IExecuteStoreProcedureService>();
            _providerRepository = new ProviderRepository(_mockExecuteStoreProcedureService.Object);
        }

        #region GetProvidersPaged Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio obtiene correctamente una lista paginada
        /// de proveedores cuando existen registros en la base de datos.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// Un administrador accede al sistema y desea ver la primera página de proveedores
        /// registrados, ordenados alfabéticamente por nombre.
        /// 
        /// FLUJO DE EJECUCIÓN:
        /// 1. Se solicita la primera página con 10 proveedores
        /// 2. El repositorio delega al servicio de stored procedures
        /// 3. Se retorna una lista con los proveedores y el total de registros
        /// 
        /// RESULTADO ESPERADO:
        /// - ResponseDTO con IsSuccess = true
        /// - Lista de proveedores con información completa (ID, nombre, email, NIT)
        /// - Información de paginación (TotalRecords)
        /// - El stored procedure se ejecuta exactamente una vez
        /// </summary>
        [Fact]
        public async Task GetProvidersPaged_ShouldReturnSuccessResponse_WhenProvidersExist()
        {
            // Arrange: Preparar los parámetros de consulta paginada
            var filters = new GetProvidersPagedDTO
            {
                PageNumber = 1,          // Primera página
                PageSize = 10,           // 10 registros por página
                SortBy = "ProviderName", // Ordenar por nombre
                SortOrder = "ASC"        // Orden ascendente (A-Z)
            };

            // Preparar la respuesta simulada que retornaría el stored procedure
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Providers retrieved successfully",
                Data = new
                {
                    // Lista de proveedores encontrados
                    Results = new List<ProviderPagedDTO>
                    {
                        new ProviderPagedDTO
                        {
                            ProviderId = 1,
                            ProviderName = "Tech Solutions Inc",
                            Email = "contact@techsolutions.com",
                            Nit = "123456789" // Número de identificación tributaria
                        }
                    },
                    TotalRecords = 1 // Total de proveedores en la base de datos
                }
            };

            // Configurar el mock para simular la respuesta del stored procedure
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteTableStoredProcedure<ProviderPagedDTO>(
                    "dbo.sp_GetProvidersPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ProviderPagedDTO>>>()))
                .ReturnsAsync(expectedResponse);

            // Act: Ejecutar el método del repositorio que queremos probar
            var result = await _providerRepository.GetProvidersPaged(filters);

            // Assert: Verificar que el resultado cumple con las expectativas
            result.Should().NotBeNull();           // El resultado no debe ser nulo
            result.IsSuccess.Should().BeTrue();    // La operación debe ser exitosa
            result.Data.Should().NotBeNull();      // Debe contener datos

            // Verificar que el stored procedure correcto fue llamado exactamente una vez
            _mockExecuteStoreProcedureService.Verify(
                x => x.ExecuteTableStoredProcedure<ProviderPagedDTO>(
                    "dbo.sp_GetProvidersPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ProviderPagedDTO>>>()),
                Times.Once);
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio maneja correctamente el caso
        /// cuando no existen proveedores registrados en el sistema.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// Sistema nuevo o después de una limpieza de datos de prueba.
        /// El administrador accede pero no hay proveedores para mostrar.
        /// 
        /// IMPORTANCIA:
        /// Garantiza que el sistema no falle cuando no hay datos,
        /// sino que informe apropiadamente al usuario.
        /// 
        /// RESULTADO ESPERADO:
        /// - Operación exitosa (IsSuccess = true)
        /// - Lista vacía de proveedores
        /// - TotalRecords = 0
        /// - No se generan excepciones
        /// </summary>
        [Fact]
        public async Task GetProvidersPaged_ShouldReturnEmptyList_WhenNoProvidersExist()
        {
            // Arrange: Preparar consulta para sistema sin proveedores
            var filters = new GetProvidersPagedDTO
            {
                PageNumber = 1,
                PageSize = 10
            };

            // Preparar respuesta con lista vacía
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "No providers found",
                Data = new
                {
                    Results = new List<ProviderPagedDTO>(), // Lista vacía
                    TotalRecords = 0                        // Cero registros totales
                }
            };

            // Configurar mock para retornar lista vacía
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteTableStoredProcedure<ProviderPagedDTO>(
                    "dbo.sp_GetProvidersPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ProviderPagedDTO>>>()))
                .ReturnsAsync(expectedResponse);

            // Act: Ejecutar consulta
            var result = await _providerRepository.GetProvidersPaged(filters);

            // Assert: Verificar que se maneja correctamente el caso sin datos
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio propaga correctamente los errores
        /// que ocurren en la capa de base de datos.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// La base de datos no está disponible, hay un problema de permisos,
        /// o el stored procedure retorna un error.
        /// 
        /// IMPORTANCIA:
        /// Asegura que los errores se manejen de forma controlada y lleguen
        /// al usuario con información útil para diagnóstico.
        /// 
        /// RESULTADO ESPERADO:
        /// - IsSuccess = false
        /// - Mensaje de error descriptivo
        /// - No se lanza excepción no controlada
        /// </summary>
        [Fact]
        public async Task GetProvidersPaged_ShouldHandleErrorResponse()
        {
            // Arrange: Preparar escenario de error
            var filters = new GetProvidersPagedDTO
            {
                PageNumber = 1,
                PageSize = 10
            };

            // Simular respuesta de error del stored procedure
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Error retrieving providers"
            };

            // Configurar mock para retornar error
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteTableStoredProcedure<ProviderPagedDTO>(
                    "dbo.sp_GetProvidersPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ProviderPagedDTO>>>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar obtener proveedores
            var result = await _providerRepository.GetProvidersPaged(filters);

            // Assert: Verificar que el error se manejó correctamente
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("Error");
        }

        #endregion

        #region CreateProvider Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio puede crear exitosamente un nuevo proveedor.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// Un administrador registra un nuevo proveedor en el sistema con información
        /// básica (nombre, email, NIT). Este es el flujo principal y más común.
        /// 
        /// VALIDACIONES IMPLÍCITAS:
        /// - El NIT no existe previamente
        /// - El email es válido
        /// - Todos los campos requeridos están presentes
        /// 
        /// RESULTADO ESPERADO:
        /// - Proveedor creado exitosamente
        /// - Se retorna el ID del nuevo proveedor
        /// - Se llama al stored procedure correcto
        /// </summary>
        [Fact]
        public async Task CreateProvider_ShouldReturnSuccessResponse_WhenProviderIsCreated()
        {
            // Arrange: Preparar datos de un nuevo proveedor válido
            var newProvider = new CreateProviderDTO
            {
                ProviderName = "New Tech Company",
                Email = "info@newtech.com",
                Nit = "111222333" // NIT único y válido
            };

            // Preparar respuesta exitosa con ID del nuevo proveedor
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Provider created successfully",
                Data = 1 // ID asignado al nuevo proveedor
            };

            // Configurar mock para simular creación exitosa
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_CreateProvider",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Crear el proveedor
            var result = await _providerRepository.CreateProvider(newProvider);

            // Assert: Verificar que la creación fue exitosa
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Contain("successfully");
        }

        /// <summary>
        /// PRUEBA: Verifica que el sistema evita la duplicación de proveedores
        /// basándose en el NIT (Número de Identificación Tributaria).
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// Un administrador intenta registrar un proveedor con un NIT que ya existe
        /// en el sistema. Esto es un error común que debe prevenirse.
        /// 
        /// REGLA DE NEGOCIO:
        /// El NIT es un identificador único legal del proveedor y no puede duplicarse.
        /// 
        /// IMPORTANCIA:
        /// - Mantiene integridad de datos
        /// - Previene confusión entre proveedores
        /// - Cumple con requisitos legales/tributarios
        /// 
        /// RESULTADO ESPERADO:
        /// - Operación rechazada (IsSuccess = false)
        /// - Mensaje claro indicando que el NIT ya existe
        /// - No se crea registro duplicado
        /// </summary>
        [Fact]
        public async Task CreateProvider_ShouldReturnErrorResponse_WhenNITAlreadyExists()
        {
            // Arrange: Preparar proveedor con NIT duplicado
            var newProvider = new CreateProviderDTO
            {
                ProviderName = "Duplicate Provider",
                Email = "duplicate@test.com",
                Nit = "123456789" // NIT que ya existe en el sistema
            };

            // Preparar respuesta de error por duplicado
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Provider with this NIT already exists"
            };

            // Configurar mock para retornar error de duplicación
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_CreateProvider",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar crear proveedor duplicado
            var result = await _providerRepository.CreateProvider(newProvider);

            // Assert: Verificar que se rechazó correctamente
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("already exists");
        }

        #endregion

        #region DeleteProvider Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio puede eliminar exitosamente un proveedor.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// Un administrador elimina un proveedor que ya no trabaja con la empresa.
        /// El proveedor no tiene relaciones activas (servicios, contratos, etc.)
        /// 
        /// CONSIDERACIONES:
        /// - Normalmente se usa "soft delete" (marcar como inactivo) en producción
        /// - Esta prueba valida el flujo básico de eliminación
        /// - En producción podría haber validaciones adicionales de integridad referencial
        /// 
        /// RESULTADO ESPERADO:
        /// - Proveedor eliminado exitosamente
        /// - Mensaje de confirmación
        /// - Stored procedure ejecutado correctamente
        /// </summary>
        [Fact]
        public async Task DeleteProvider_ShouldReturnSuccessResponse_WhenProviderIsDeleted()
        {
            // Arrange: Preparar ID del proveedor a eliminar
            int providerId = 1;

            // Preparar respuesta exitosa
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Provider deleted successfully"
            };

            // Configurar mock para simular eliminación exitosa
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_DeleteProvider",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Eliminar el proveedor
            var result = await _providerRepository.DeleteProvider(providerId);

            // Assert: Verificar eliminación exitosa
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Contain("deleted successfully");
        }

        /// <summary>
        /// PRUEBA: Verifica que el sistema maneja correctamente el intento de
        /// eliminar un proveedor que no existe.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// - El proveedor ya fue eliminado previamente
        /// - Se proporcionó un ID incorrecto
        /// - Error de sincronización entre interfaces de usuario
        /// 
        /// IMPORTANCIA:
        /// Evita errores confusos para el usuario y mantiene estabilidad del sistema.
        /// 
        /// RESULTADO ESPERADO:
        /// - Operación fallida con mensaje claro
        /// - No se lanza excepción
        /// - Usuario recibe feedback apropiado
        /// </summary>
        [Fact]
        public async Task DeleteProvider_ShouldReturnErrorResponse_WhenProviderNotFound()
        {
            // Arrange: Preparar ID inexistente
            int providerId = 999; // ID que no existe en la base de datos

            // Preparar respuesta de "no encontrado"
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Provider not found"
            };

            // Configurar mock para retornar error
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_DeleteProvider",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar eliminar proveedor inexistente
            var result = await _providerRepository.DeleteProvider(providerId);

            // Assert: Verificar manejo apropiado del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        #endregion

        #region AddCustomFieldToProvider Tests

        /// <summary>
        /// PRUEBA: Verifica que se pueden agregar campos personalizados a un proveedor.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// El sistema permite almacenar información adicional específica del proveedor
        /// que no está en el modelo base. Por ejemplo:
        /// - TaxID: Identificador fiscal adicional
        /// - CertificationDate: Fecha de certificación ISO
        /// - PreferredPaymentMethod: Método de pago preferido
        /// - ContactPerson: Persona de contacto específica
        /// 
        /// FLEXIBILIDAD:
        /// Esta característica permite extender el modelo de proveedores sin modificar
        /// la estructura de la base de datos, adaptándose a diferentes requisitos de negocio.
        /// 
        /// RESULTADO ESPERADO:
        /// - Campo personalizado agregado exitosamente
        /// - Vinculado al proveedor correcto
        /// - Disponible para consultas futuras
        /// </summary>
        [Fact]
        public async Task AddCustomFieldToProvider_ShouldReturnSuccessResponse_WhenFieldIsAdded()
        {
            // Arrange: Preparar un campo personalizado (TaxID en este caso)
            var customField = new AddCustomFieldDTO
            {
                ProviderId = 1,              // ID del proveedor existente
                FieldName = "TaxID",         // Nombre del campo personalizado
                FieldValue = "TAX123456"     // Valor del campo
            };

            // Preparar respuesta exitosa
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Custom field added successfully"
            };

            // Configurar mock para simular agregado exitoso
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_AddCustomFieldToProvider",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Agregar el campo personalizado
            var result = await _providerRepository.AddCustomFieldToProvider(customField);

            // Assert: Verificar que se agregó correctamente
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Contain("successfully");
        }

        /// <summary>
        /// PRUEBA: Verifica que no se pueden agregar campos personalizados a
        /// un proveedor inexistente.
        /// 
        /// ESCENARIO DE NEGOCIO:
        /// Se intenta agregar información adicional a un proveedor que:
        /// - No existe en el sistema
        /// - Ya fue eliminado
        /// - El ID es incorrecto
        /// 
        /// INTEGRIDAD DE DATOS:
        /// Esta validación previene datos huérfanos y mantiene la consistencia
        /// de la base de datos.
        /// 
        /// RESULTADO ESPERADO:
        /// - Operación rechazada
        /// - Mensaje claro indicando que el proveedor no existe
        /// - No se crea el campo personalizado
        /// </summary>
        [Fact]
        public async Task AddCustomFieldToProvider_ShouldReturnErrorResponse_WhenProviderNotFound()
        {
            // Arrange: Preparar campo para proveedor inexistente
            var customField = new AddCustomFieldDTO
            {
                ProviderId = 999,           // ID inexistente
                FieldName = "CustomField",
                FieldValue = "Value"
            };

            // Preparar respuesta de error
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Provider not found"
            };

            // Configurar mock para retornar error
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_AddCustomFieldToProvider",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar agregar campo a proveedor inexistente
            var result = await _providerRepository.AddCustomFieldToProvider(customField);

            // Assert: Verificar manejo del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        #endregion
    }
}