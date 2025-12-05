using Microsoft.Data.SqlClient;
using System.Runtime.Serialization;
using System.Reflection;

namespace Tekus.Tests.Helpers
{
    /// <summary>
    /// Clase auxiliar para crear instancias de SqlException en pruebas unitarias.
    /// 
    /// PROBLEMA QUE RESUELVE:
    /// SqlException es una clase "sealed" (sellada) con constructor interno,
    /// lo que hace imposible crearla directamente o hacer mock con Moq.
    /// 
    /// SOLUCIÓN:
    /// Utiliza reflexión para acceder a campos privados y crear instancias
    /// de SqlException para simular errores de SQL Server en tests.
    /// 
    /// USO TÍPICO:
    /// var sqlEx = SqlExceptionHelper.CreateSqlException(
    ///     message: "Timeout expired",
    ///     errorNumber: -2
    /// );
    /// 
    /// ADVERTENCIA:
    /// Esta clase usa APIs obsoletas (FormatterServices) porque son la única
    /// forma de crear SqlException en tests. El warning SYSLIB0050 es esperado.
    /// </summary>
    public static class SqlExceptionHelper
    {
        /// <summary>
        /// Crea una instancia de SqlException para usar en pruebas unitarias.
        /// 
        /// PARÁMETROS IMPORTANTES:
        /// - message: Mensaje de error que verá el usuario
        /// - errorNumber: Código de error de SQL Server (ej: -2 = timeout, 2601 = duplicado)
        /// - errorState: Estado interno del error (normalmente 0)
        /// - errorClass: Severidad del error (10 = info, 16 = error usuario, 20+ = fatal)
        /// 
        /// CÓDIGOS DE ERROR COMUNES DE SQL SERVER:
        /// -2: Timeout expired
        /// 2601: Cannot insert duplicate key
        /// 2627: Violation of PRIMARY KEY constraint
        /// 18456: Login failed
        /// 1205: Deadlock victim
        /// 
        /// EJEMPLO DE USO:
        /// // Simular un timeout
        /// var timeoutEx = SqlExceptionHelper.CreateSqlException(
        ///     message: "Timeout expired. The timeout period elapsed.",
        ///     errorNumber: -2
        /// );
        /// </summary>
        public static SqlException CreateSqlException(
            string message = "SQL Error occurred",
            int errorNumber = 0,
            byte errorState = 0,
            byte errorClass = 10)
        {
            // Paso 1: Crear un SqlError individual
            var sqlError = CreateSqlError(
                number: errorNumber,
                state: errorState,
                errorClass: errorClass,
                message: message);

            // Paso 2: Crear una colección de errores (SqlException puede contener múltiples errores)
            var errorCollection = CreateSqlErrorCollection(sqlError);

            // Paso 3: Crear SqlException sin llamar al constructor
            // (porque el constructor es interno y no podemos acceder a él normalmente)
            var sqlException = (SqlException)FormatterServices
                .GetUninitializedObject(typeof(SqlException));

            // Paso 4: Establecer los campos privados usando reflexión
            SetPrivateFieldValue(sqlException, "_message", message);
            SetPrivateFieldValue(sqlException, "_errors", errorCollection);

            return sqlException;
        }

        /// <summary>
        /// Crea un objeto SqlError usando reflexión.
        /// 
        /// PROPÓSITO:
        /// SqlError representa un error individual de SQL Server y contiene
        /// información detallada como número de error, servidor, procedimiento, línea, etc.
        /// 
        /// CAMPOS DEL ERROR:
        /// - number: Código numérico del error
        /// - state: Estado del error
        /// - errorClass: Nivel de severidad
        /// - server: Nombre del servidor SQL
        /// - message: Descripción del error
        /// - procedure: Procedimiento almacenado donde ocurrió
        /// - lineNumber: Línea de código SQL donde ocurrió
        /// 
        /// NOTA: Este método es privado porque solo se usa internamente
        /// </summary>
        private static object CreateSqlError(
            int number = 0,
            byte state = 0,
            byte errorClass = 0,
            string server = "TestServer",
            string message = "Test SQL Error",
            string procedure = "",
            int lineNumber = 0)
        {
            // Crear instancia de SqlError sin constructor
            var sqlError = FormatterServices
                .GetUninitializedObject(typeof(SqlError));

            // Establecer todos los campos del error usando reflexión
            SetPrivateFieldValue(sqlError, "number", number);
            SetPrivateFieldValue(sqlError, "state", state);
            SetPrivateFieldValue(sqlError, "errorClass", errorClass);
            SetPrivateFieldValue(sqlError, "server", server);
            SetPrivateFieldValue(sqlError, "message", message);
            SetPrivateFieldValue(sqlError, "procedure", procedure);
            SetPrivateFieldValue(sqlError, "lineNumber", lineNumber);

            return sqlError;
        }

        /// <summary>
        /// Crea una colección de errores SQL (SqlErrorCollection).
        /// 
        /// PROPÓSITO:
        /// SQL Server puede retornar múltiples errores en una sola excepción.
        /// Por ejemplo, si un trigger falla, se pueden reportar tanto el error
        /// del trigger como el error de la operación principal.
        /// 
        /// PARÁMETRO:
        /// errors: Uno o más objetos SqlError a incluir en la colección
        /// 
        /// NOTA: En la mayoría de tests, solo se necesita un error,
        /// pero el sistema soporta múltiples para casos avanzados.
        /// </summary>
        private static SqlErrorCollection CreateSqlErrorCollection(params object[] errors)
        {
            // Crear instancia de SqlErrorCollection sin constructor
            var collection = (SqlErrorCollection)FormatterServices
                .GetUninitializedObject(typeof(SqlErrorCollection));

            // Convertir el array de errores a lista
            var errorList = new List<object>(errors);

            // Establecer la lista de errores en el campo privado
            SetPrivateFieldValue(collection, "errors", errorList);

            return collection;
        }

        /// <summary>
        /// Establece el valor de un campo privado usando reflexión.
        /// 
        /// PROPÓSITO:
        /// Los campos internos de SqlException, SqlError y SqlErrorCollection
        /// son privados y no se pueden acceder normalmente. Esta función usa
        /// reflexión para modificarlos.
        /// 
        /// PARÁMETROS:
        /// - obj: El objeto cuyo campo queremos modificar
        /// - fieldName: Nombre del campo privado (ej: "_message", "_errors")
        /// - value: Nuevo valor para el campo
        /// 
        /// EXCEPCIÓN:
        /// Lanza ArgumentException si el campo no existe.
        /// Esto ayuda a detectar errores si Microsoft cambia la estructura interna.
        /// 
        /// IMPORTANTE:
        /// Esta técnica depende de la estructura interna de las clases de ADO.NET.
        /// Si Microsoft cambia estos nombres en futuras versiones, este código
        /// deberá actualizarse.
        /// </summary>
        private static void SetPrivateFieldValue(object obj, string fieldName, object value)
        {
            // Buscar el campo privado por nombre usando reflexión
            var field = obj.GetType().GetField(
                fieldName,
                BindingFlags.NonPublic | BindingFlags.Instance);

            // Validar que el campo existe
            if (field == null)
            {
                throw new ArgumentException(
                    $"Field '{fieldName}' not found in type '{obj.GetType().Name}'");
            }

            // Establecer el valor del campo
            field.SetValue(obj, value);
        }
    }
}