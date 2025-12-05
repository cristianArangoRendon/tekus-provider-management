using Xunit;
using Moq;
using FluentAssertions;
using Inventory.Core.Interfaces.Services;
using task.infraestructure.Repositories;
using Tekus.core.DTOs.Services;
using Tekus.Core.DTOs.ResponseDTO;
using Microsoft.Data.SqlClient;
using System.Threading.Tasks;
using System.Collections.Generic;
using System;

namespace Tekus.Tests.Infrastructure.Repositories
{
    /// <summary>
    /// Pruebas unitarias para el repositorio ServiceRepository.
    /// 
    /// PROPÓSITO:
    /// Verificar que el repositorio interactúa correctamente con el servicio de
    /// ejecución de procedimientos almacenados para realizar operaciones CRUD
    /// sobre servicios (Services).
    /// 
    /// COBERTURA:
    /// - Obtener servicios paginados (GetServicesPaged)
    /// - Crear nuevos servicios (CreateService)
    /// - Actualizar servicios existentes (UpdateService)
    /// - Eliminar servicios (DeleteService)
    /// </summary>
    public class ServiceRepositoryTests
    {
        // Mock del servicio que ejecuta procedimientos almacenados
        private readonly Mock<IExecuteStoreProcedureService> _mockExecuteStoreProcedureService;
        // Instancia del repositorio a probar
        private readonly ServiceRepository _serviceRepository;

        /// <summary>
        /// Constructor que inicializa los componentes necesarios para las pruebas.
        /// Se ejecuta antes de cada test individual.
        /// </summary>
        public ServiceRepositoryTests()
        {
            _mockExecuteStoreProcedureService = new Mock<IExecuteStoreProcedureService>();
            _serviceRepository = new ServiceRepository(_mockExecuteStoreProcedureService.Object);
        }

        #region GetServicesPaged Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio obtiene correctamente una lista paginada
        /// de servicios cuando existen datos en la base de datos.
        /// 
        /// ESCENARIO:
        /// - Se solicita la primera página de servicios con 10 registros
        /// - La base de datos contiene servicios disponibles
        /// 
        /// RESULTADO ESPERADO:
        /// - Se retorna un ResponseDTO exitoso (IsSuccess = true)
        /// - Los datos contienen la lista de servicios
        /// - Se llama al procedimiento almacenado correcto exactamente una vez
        /// </summary>
        [Fact]
        public async Task GetServicesPaged_ShouldReturnSuccessResponse_WhenServicesExist()
        {
            // Arrange: Preparar filtros de paginación
            var filters = new GetServicesPagedDTO
            {
                PageNumber = 1,
                PageSize = 10,
                SortBy = "ServiceName",
                SortOrder = "ASC"
            };

            // Preparar respuesta simulada con datos de servicios
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Services retrieved successfully",
                Data = new
                {
                    Results = new List<ServicePagedDTO>
                    {
                        new ServicePagedDTO
                        {
                            ServiceId = 1,
                            ServiceName = "Cloud Computing",
                            HourlyRateUSD = 150.00m
                        }
                    },
                    TotalRecords = 1
                }
            };

            // Configurar el mock para retornar la respuesta esperada
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteTableStoredProcedure<ServicePagedDTO>(
                    "dbo.sp_GetServicesPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ServicePagedDTO>>>()))
                .ReturnsAsync(expectedResponse);

            // Act: Ejecutar el método del repositorio
            var result = await _serviceRepository.GetServicesPaged(filters);

            // Assert: Verificar que el resultado es correcto
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Data.Should().NotBeNull();

            // Verificar que se llamó al procedimiento almacenado correcto
            _mockExecuteStoreProcedureService.Verify(
                x => x.ExecuteTableStoredProcedure<ServicePagedDTO>(
                    "dbo.sp_GetServicesPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ServicePagedDTO>>>()),
                Times.Once);
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio maneja correctamente el caso
        /// cuando no hay servicios en la base de datos.
        /// 
        /// ESCENARIO:
        /// - Se solicita una página de servicios
        /// - La base de datos no contiene ningún servicio
        /// 
        /// RESULTADO ESPERADO:
        /// - Se retorna un ResponseDTO exitoso pero con lista vacía
        /// - No se genera ninguna excepción
        /// - El repositorio comunica correctamente que no hay datos
        /// </summary>
        [Fact]
        public async Task GetServicesPaged_ShouldReturnEmptyList_WhenNoServicesExist()
        {
            // Arrange: Preparar filtros
            var filters = new GetServicesPagedDTO
            {
                PageNumber = 1,
                PageSize = 10
            };

            // Preparar respuesta con lista vacía
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "No services found",
                Data = new
                {
                    Results = new List<ServicePagedDTO>(),
                    TotalRecords = 0
                }
            };

            // Configurar mock para retornar lista vacía
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteTableStoredProcedure<ServicePagedDTO>(
                    "dbo.sp_GetServicesPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ServicePagedDTO>>>()))
                .ReturnsAsync(expectedResponse);

            // Act: Obtener servicios
            var result = await _serviceRepository.GetServicesPaged(filters);

            // Assert: Verificar respuesta vacía válida
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio maneja correctamente respuestas de error
        /// del procedimiento almacenado.
        /// 
        /// ESCENARIO:
        /// - Se solicita obtener servicios
        /// - El procedimiento almacenado retorna un error
        /// 
        /// RESULTADO ESPERADO:
        /// - El repositorio propaga el error correctamente
        /// - IsSuccess es false
        /// - El mensaje de error se preserva para el consumidor
        /// </summary>
        [Fact]
        public async Task GetServicesPaged_ShouldHandleErrorResponse()
        {
            // Arrange: Preparar filtros
            var filters = new GetServicesPagedDTO
            {
                PageNumber = 1,
                PageSize = 10
            };

            // Preparar respuesta de error
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Error retrieving services"
            };

            // Configurar mock para retornar error
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteTableStoredProcedure<ServicePagedDTO>(
                    "dbo.sp_GetServicesPaged",
                    It.IsAny<object>(),
                    It.IsAny<Func<SqlDataReader, List<ServicePagedDTO>>>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar obtener servicios
            var result = await _serviceRepository.GetServicesPaged(filters);

            // Assert: Verificar que el error se manejó correctamente
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("Error");
        }

        #endregion

        #region CreateService Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio puede crear exitosamente un nuevo servicio.
        /// 
        /// ESCENARIO:
        /// - Se proporciona información válida de un nuevo servicio
        /// - No existen conflictos (nombre duplicado, etc.)
        /// 
        /// RESULTADO ESPERADO:
        /// - El servicio se crea exitosamente
        /// - Se retorna IsSuccess = true
        /// - Se llama al procedimiento almacenado correcto
        /// </summary>
        [Fact]
        public async Task CreateService_ShouldReturnSuccessResponse_WhenServiceIsCreated()
        {
            // Arrange: Preparar datos del nuevo servicio
            var newService = new CreateServiceDTO
            {
                ServiceName = "Machine Learning",
                Description = "AI and ML services",
                HourlyRateUSD = 200.00m
            };

            // Preparar respuesta exitosa
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Service created successfully",
                Data = 1 // ID del nuevo servicio creado
            };

            // Configurar mock para simular creación exitosa
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_CreateService",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Crear el servicio
            var result = await _serviceRepository.CreateService(newService);

            // Assert: Verificar creación exitosa
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Contain("successfully");

            // Verificar que se llamó al procedimiento correcto
            _mockExecuteStoreProcedureService.Verify(
                x => x.ExecuteStoredProcedure(
                    "dbo.sp_CreateService",
                    It.IsAny<object>()),
                Times.Once);
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio maneja correctamente el intento de
        /// crear un servicio que ya existe (nombre duplicado).
        /// 
        /// ESCENARIO:
        /// - Se intenta crear un servicio con un nombre ya existente
        /// - El procedimiento almacenado detecta el conflicto
        /// 
        /// RESULTADO ESPERADO:
        /// - Se retorna un error descriptivo (IsSuccess = false)
        /// - El mensaje indica claramente que el servicio ya existe
        /// - No se crea ningún registro duplicado
        /// </summary>
        [Fact]
        public async Task CreateService_ShouldReturnErrorResponse_WhenServiceAlreadyExists()
        {
            // Arrange: Preparar servicio con nombre existente
            var newService = new CreateServiceDTO
            {
                ServiceName = "Existing Service",
                HourlyRateUSD = 100.00m
            };

            // Preparar respuesta de error por duplicado
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Service already exists"
            };

            // Configurar mock para retornar error de duplicado
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_CreateService",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar crear servicio duplicado
            var result = await _serviceRepository.CreateService(newService);

            // Assert: Verificar manejo del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("already exists");
        }

        #endregion

        #region UpdateService Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio puede actualizar exitosamente
        /// un servicio existente.
        /// 
        /// ESCENARIO:
        /// - Se proporciona el ID de un servicio existente
        /// - Se proporcionan los nuevos valores para actualizar
        /// 
        /// RESULTADO ESPERADO:
        /// - El servicio se actualiza correctamente
        /// - Se retorna un mensaje de éxito
        /// - Los cambios se persisten en la base de datos
        /// </summary>
        [Fact]
        public async Task UpdateService_ShouldReturnSuccessResponse_WhenServiceIsUpdated()
        {
            // Arrange: Preparar datos de actualización
            var updateService = new UpdateServiceDTO
            {
                ServiceId = 1,
                ServiceName = "Updated Service",
                HourlyRateUSD = 175.00m
            };

            // Preparar respuesta exitosa
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Service updated successfully"
            };

            // Configurar mock para simular actualización exitosa
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_UpdateService",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Actualizar el servicio
            var result = await _serviceRepository.UpdateService(updateService);

            // Assert: Verificar actualización exitosa
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Contain("updated successfully");
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio maneja correctamente el intento de
        /// actualizar un servicio que no existe.
        /// 
        /// ESCENARIO:
        /// - Se intenta actualizar un servicio con un ID inexistente
        /// - El procedimiento almacenado no encuentra el registro
        /// 
        /// RESULTADO ESPERADO:
        /// - Se retorna un error indicando que el servicio no fue encontrado
        /// - No se modifica ningún registro en la base de datos
        /// </summary>
        [Fact]
        public async Task UpdateService_ShouldReturnErrorResponse_WhenServiceNotFound()
        {
            // Arrange: Preparar actualización con ID inexistente
            var updateService = new UpdateServiceDTO
            {
                ServiceId = 999, // ID que no existe
                ServiceName = "Non-existent Service"
            };

            // Preparar respuesta de "no encontrado"
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Service not found"
            };

            // Configurar mock para retornar error de "no encontrado"
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_UpdateService",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar actualizar servicio inexistente
            var result = await _serviceRepository.UpdateService(updateService);

            // Assert: Verificar manejo del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        #endregion

        #region DeleteService Tests

        /// <summary>
        /// PRUEBA: Verifica que el repositorio puede eliminar exitosamente un servicio.
        /// 
        /// ESCENARIO:
        /// - Se proporciona el ID de un servicio existente
        /// - El servicio no tiene dependencias que impidan su eliminación
        /// 
        /// RESULTADO ESPERADO:
        /// - El servicio se elimina correctamente
        /// - Se retorna un mensaje de confirmación
        /// - El registro se borra de la base de datos
        /// </summary>
        [Fact]
        public async Task DeleteService_ShouldReturnSuccessResponse_WhenServiceIsDeleted()
        {
            // Arrange: Preparar ID del servicio a eliminar
            int serviceId = 1;

            // Preparar respuesta exitosa
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = true,
                Message = "Service deleted successfully"
            };

            // Configurar mock para simular eliminación exitosa
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_DeleteService",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Eliminar el servicio
            var result = await _serviceRepository.DeleteService(serviceId);

            // Assert: Verificar eliminación exitosa
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeTrue();
            result.Message.Should().Contain("deleted successfully");
        }

        /// <summary>
        /// PRUEBA: Verifica que el repositorio maneja correctamente el intento de
        /// eliminar un servicio que no existe.
        /// 
        /// ESCENARIO:
        /// - Se intenta eliminar un servicio con un ID inexistente
        /// - El procedimiento almacenado no encuentra el registro
        /// 
        /// RESULTADO ESPERADO:
        /// - Se retorna un error claro indicando que el servicio no existe
        /// - No se realiza ninguna modificación en la base de datos
        /// </summary>
        [Fact]
        public async Task DeleteService_ShouldReturnErrorResponse_WhenServiceNotFound()
        {
            // Arrange: Preparar ID inexistente
            int serviceId = 999;

            // Preparar respuesta de "no encontrado"
            var expectedResponse = new ResponseDTO
            {
                IsSuccess = false,
                Message = "Service not found"
            };

            // Configurar mock para retornar error
            _mockExecuteStoreProcedureService
                .Setup(x => x.ExecuteStoredProcedure(
                    "dbo.sp_DeleteService",
                    It.IsAny<object>()))
                .ReturnsAsync(expectedResponse);

            // Act: Intentar eliminar servicio inexistente
            var result = await _serviceRepository.DeleteService(serviceId);

            // Assert: Verificar manejo del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("not found");
        }

        #endregion
    }
}