using FluentAssertions;
using Inventory.Infrastructure.Services;
using Microsoft.Data.SqlClient;
using Moq;
using Tekus.Core.Interfaces.Repositories.DataContext;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Tests.Infrastructure.Services
{
    /// <summary>
    /// Pruebas unitarias para el servicio ExecuteStoreProcedureService.
    /// Este servicio es responsable de ejecutar procedimientos almacenados en la base de datos.
    /// Se prueban diferentes escenarios de ejecución y manejo de errores.
    /// </summary>
    public class ExecuteStoreProcedureServiceTests
    {
        // Mocks (objetos simulados) para las dependencias del servicio
        private readonly Mock<ILogService> _mockLogService;
        private readonly Mock<IDataContextTekus> _mockDataContext;
        private readonly Mock<ISqlCommandService> _mockSqlCommandService;
        private readonly ExecuteStoreProcedureService _service;

        /// <summary>
        /// Constructor que inicializa los mocks y crea una instancia del servicio a probar.
        /// Se ejecuta antes de cada test individual.
        /// </summary>
        public ExecuteStoreProcedureServiceTests()
        {
            _mockLogService = new Mock<ILogService>();
            _mockDataContext = new Mock<IDataContextTekus>();
            _mockSqlCommandService = new Mock<ISqlCommandService>();
            _service = new ExecuteStoreProcedureService(
                _mockLogService.Object,
                _mockDataContext.Object,
                _mockSqlCommandService.Object
            );
        }

        #region ExecuteStoredProcedure Tests

        /// <summary>
        /// PRUEBA: Verifica que el servicio maneje correctamente una excepción de base de datos
        /// al intentar crear una conexión.
        /// 
        /// ESCENARIO: 
        /// - Se intenta ejecutar un procedimiento almacenado
        /// - La creación de la conexión a la base de datos falla
        /// 
        /// RESULTADO ESPERADO:
        /// - El servicio retorna un ResponseDTO con IsSuccess = false
        /// - El mensaje de error contiene la descripción del problema
        /// - Se registra el error en el log una vez
        /// </summary>
        [Fact]
        public async Task ExecuteStoredProcedure_ShouldHandleDatabaseException_AndLogError()
        {
            // Arrange (Preparación): Configurar el escenario de prueba
            var storedProcedureName = "dbo.sp_TestProcedure";
            var parameters = new { Id = 1 };

            // Simular que CreateConnection lanza una excepción de base de datos
            _mockDataContext
                .Setup(x => x.CreateConnection())
                .Throws(new InvalidOperationException("Database connection failed"));

            // Act (Acción): Ejecutar el método que queremos probar
            var result = await _service.ExecuteStoredProcedure(storedProcedureName, parameters);

            // Assert (Verificación): Comprobar que el resultado es el esperado
            result.Should().NotBeNull(); // El resultado no debe ser nulo
            result.IsSuccess.Should().BeFalse(); // La operación debe haber fallado
            result.Message.Should().Contain("Database connection failed"); // El mensaje debe contener el error

            // Verificar que se registró el error en el log exactamente una vez
            _mockLogService.Verify(
                x => x.SaveLogsMessagesAsync(It.Is<string>(s => s.Contains("An error occurred"))),
                Times.Once);
        }

        /// <summary>
        /// PRUEBA: Verifica que el servicio maneje correctamente excepciones genéricas
        /// que no sean específicas de la base de datos.
        /// 
        /// ESCENARIO:
        /// - Se intenta ejecutar un procedimiento almacenado
        /// - Ocurre una excepción genérica durante la ejecución
        /// 
        /// RESULTADO ESPERADO:
        /// - El servicio captura la excepción y retorna un error controlado
        /// - El mensaje de error es exactamente el de la excepción original
        /// - Se registra el error en el sistema de logs
        /// </summary>
        [Fact]
        public async Task ExecuteStoredProcedure_ShouldHandleGenericException_AndLogError()
        {
            // Arrange: Preparar una excepción genérica
            var storedProcedureName = "dbo.sp_TestProcedure";
            var parameters = new { Id = 1 };
            var exception = new Exception("Test exception");

            // Configurar el mock para lanzar una excepción genérica
            _mockDataContext
                .Setup(x => x.CreateConnection())
                .Throws(exception);

            // Act: Ejecutar el procedimiento almacenado
            var result = await _service.ExecuteStoredProcedure(storedProcedureName, parameters);

            // Assert: Verificar el manejo correcto del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Be("Test exception"); // El mensaje debe ser exacto

            // Verificar que el error se registró en el log
            _mockLogService.Verify(
                x => x.SaveLogsMessagesAsync(It.Is<string>(s => s.Contains("An error occurred"))),
                Times.Once);
        }

        #endregion

        #region ExecuteDataStoredProcedure Tests

        /// <summary>
        /// PRUEBA: Verifica que el método ExecuteDataStoredProcedure maneje correctamente
        /// errores de conexión a la base de datos al intentar obtener datos.
        /// 
        /// ESCENARIO:
        /// - Se intenta ejecutar un procedimiento que retorna datos (lista de objetos)
        /// - La conexión a la base de datos falla
        /// 
        /// RESULTADO ESPERADO:
        /// - El método no lanza excepciones no controladas
        /// - Retorna un ResponseDTO con IsSuccess = false
        /// - El error se registra apropiadamente en el log
        /// </summary>
        [Fact]
        public async Task ExecuteDataStoredProcedure_ShouldHandleDatabaseException()
        {
            // Arrange: Preparar el escenario con función de mapeo
            var storedProcedureName = "dbo.sp_GetData";
            var parameters = new { Id = 1 };
            // Función que mapearía los resultados del SqlDataReader a objetos
            Func<SqlDataReader, List<TestDTO>> mapFunction = (reader) => new List<TestDTO>();

            // Simular fallo de conexión
            _mockDataContext
                .Setup(x => x.CreateConnection())
                .Throws(new InvalidOperationException("SQL connection error"));

            // Act: Intentar ejecutar el procedimiento
            var result = await _service.ExecuteDataStoredProcedure(
                storedProcedureName,
                parameters,
                mapFunction);

            // Assert: Verificar manejo del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("SQL connection error");

            // Verificar registro del error
            _mockLogService.Verify(
                x => x.SaveLogsMessagesAsync(It.Is<string>(s => s.Contains("An error occurred"))),
                Times.Once);
        }

        #endregion

        #region ExecuteTableStoredProcedure Tests

        /// <summary>
        /// PRUEBA: Verifica que el método ExecuteTableStoredProcedure maneje errores
        /// al ejecutar procedimientos con soporte de paginación.
        /// 
        /// ESCENARIO:
        /// - Se intenta ejecutar un procedimiento almacenado con paginación
        /// - Ocurre un error de base de datos durante la ejecución
        /// 
        /// RESULTADO ESPERADO:
        /// - El método retorna un error controlado con mensaje descriptivo
        /// - IsSuccess es false
        /// - El error se registra en el sistema de logs
        /// 
        /// NOTA: Este método es especialmente importante porque maneja resultados paginados
        /// con información de TotalRecords.
        /// </summary>
        [Fact]
        public async Task ExecuteTableStoredProcedure_ShouldHandleDatabaseException_AndReturnError()
        {
            // Arrange: Configurar escenario de paginación
            var storedProcedureName = "dbo.sp_GetPagedData";
            var parameters = new { PageNumber = 1 };
            Func<SqlDataReader, List<TestDTO>> mapFunction = (reader) => new List<TestDTO>();

            // Simular error de base de datos
            _mockDataContext
                .Setup(x => x.CreateConnection())
                .Throws(new InvalidOperationException("Database error"));

            // Act: Ejecutar el procedimiento paginado
            var result = await _service.ExecuteTableStoredProcedure(
                storedProcedureName,
                parameters,
                mapFunction);

            // Assert: Verificar respuesta de error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("An error occurred while executing the operation");

            // Verificar que el error fue registrado
            _mockLogService.Verify(
                x => x.SaveLogsMessagesAsync(It.Is<string>(s => s.Contains("An error occurred"))),
                Times.Once);
        }

        #endregion

        #region ExecuteJsonStoredProcedure Tests

        /// <summary>
        /// PRUEBA: Verifica que el método ExecuteJsonStoredProcedure maneje correctamente
        /// errores al intentar ejecutar procedimientos que retornan datos en formato JSON.
        /// 
        /// ESCENARIO:
        /// - Se intenta ejecutar un procedimiento que retorna JSON
        /// - La conexión a la base de datos se pierde durante la ejecución
        /// 
        /// RESULTADO ESPERADO:
        /// - El método no falla completamente sino que retorna un error controlado
        /// - El mensaje de error indica claramente el problema de conexión
        /// - El error se registra para auditoría y debugging
        /// </summary>
        [Fact]
        public async Task ExecuteJsonStoredProcedure_ShouldHandleDatabaseException()
        {
            // Arrange: Preparar parámetros para procedimiento JSON
            var storedProcedureName = "dbo.sp_GetJsonData";
            var parameters = new { Id = 1 };

            // Simular pérdida de conexión
            _mockDataContext
                .Setup(x => x.CreateConnection())
                .Throws(new InvalidOperationException("Database connection lost"));

            // Act: Intentar ejecutar el procedimiento
            var result = await _service.ExecuteJsonStoredProcedure(storedProcedureName, parameters);

            // Assert: Verificar manejo del error
            result.Should().NotBeNull();
            result.IsSuccess.Should().BeFalse();
            result.Message.Should().Contain("Database connection lost");

            // Verificar registro del error
            _mockLogService.Verify(
                x => x.SaveLogsMessagesAsync(It.Is<string>(s => s.Contains("An error occurred"))),
                Times.Once);
        }

        #endregion

        #region Helper Classes

        /// <summary>
        /// Clase de prueba (DTO) utilizada para las pruebas unitarias.
        /// Representa un objeto simple con propiedades básicas.
        /// </summary>
        private class TestDTO
        {
            public int Id { get; set; }
            public string Name { get; set; } = string.Empty;
        }

        #endregion
    }
}