using Inventory.Core.Interfaces.Services;
using Microsoft.Data.SqlClient;
using System.Data;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories.DataContext;
using Tekus.Core.Interfaces.Services;

namespace Inventory.Infrastructure.Services
{
    public class ExecuteStoreProcedureService(ILogService logService, IDataContextTekus dataContext, ISqlCommandService sqlCommandService) : IExecuteStoreProcedureService
    {
        private readonly ILogService _logService = logService;
        private readonly IDataContextTekus _dataContext = dataContext;
        private readonly ISqlCommandService _sqlCommandService = sqlCommandService;

        public async Task<ResponseDTO> ExecuteStoredProcedure(string storedProcedureName, object parameters)
        {
            var response = new ResponseDTO
            {
                IsSuccess = false
            };

            try
            {
                using var connection = _dataContext.CreateConnection();
                await connection.OpenAsync();

                using SqlCommand command = connection.CreateCommand();
                command.CommandText = storedProcedureName;
                command.CommandType = CommandType.StoredProcedure;
                _sqlCommandService.AddParameters(command, parameters);
                
                using SqlDataReader reader = await command.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    response.Message = reader.GetString(reader.GetOrdinal("Result"));
                    response.IsSuccess = reader.GetBoolean(reader.GetOrdinal("IsSuccess"));
                }
                else
                {
                    response.Message = "No data returned from the service.";
                }
            }
            catch (SqlException sqlEx)
            {
                await _logService.SaveLogsMessagesAsync($"SQL Error while executing stored procedure {storedProcedureName}: {sqlEx.Message}");
                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = sqlEx.Message
                };
            }
            catch (Exception ex)
            {
                await _logService.SaveLogsMessagesAsync($"An error occurred while executing stored procedure {storedProcedureName}: {ex.Message}");
                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }
            return response;
        }

        public async Task<ResponseDTO> ExecuteDataStoredProcedure<TResult>(string storedProcedureName, object parameters, Func<SqlDataReader, List<TResult>> mapFunction)
        {
            var response = new ResponseDTO
            {
                IsSuccess = false
            };

            try
            {
                using var connection = _dataContext.CreateConnection();
                await connection.OpenAsync();

                using SqlCommand command = connection.CreateCommand();
                command.CommandText = storedProcedureName;
                command.CommandType = CommandType.StoredProcedure;
                _sqlCommandService.AddParameters(command, parameters);
                
                using SqlDataReader reader = await command.ExecuteReaderAsync();
                var resultList = mapFunction(reader);
                if (resultList == null || !resultList.Any())
                {
                    response.Message = "No information found.";
                    response.Data = null;
                }
                else
                {
                    response.Data = resultList;
                    response.Message = "Operation completed successfully.";
                    response.IsSuccess = true;
                }
            }
            catch (SqlException sqlEx)
            {
                await _logService.SaveLogsMessagesAsync($"SQL Error while executing stored procedure {storedProcedureName}: {sqlEx.Message}");
                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = sqlEx.Message
                };
            }
            catch (Exception ex)
            {
                await _logService.SaveLogsMessagesAsync($"An error occurred while executing stored procedure {storedProcedureName}: {ex.Message}");
                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }

            return response;
        }

        public async Task<ResponseDTO> ExecuteSingleObjectStoredProcedure<TResult>(string storedProcedureName, object parameters, Func<SqlDataReader, TResult> mapFunction)
        {
            ResponseDTO response = new ResponseDTO
            {
                IsSuccess = false
            };

            try
            {
                using var connection = _dataContext.CreateConnection();
                await connection.OpenAsync();

                using SqlCommand command = connection.CreateCommand();
                command.CommandText = storedProcedureName;
                command.CommandType = CommandType.StoredProcedure;
                _sqlCommandService.AddParameters(command, parameters);
                
                using SqlDataReader reader = await command.ExecuteReaderAsync();
                TResult resultList = mapFunction(reader);
                response.Data = resultList;
                response.IsSuccess = true;
            }
            catch (Exception ex)
            {
                await _logService.SaveLogsMessagesAsync($"An error occurred while executing stored procedure {storedProcedureName}: {ex.Message}");
                response.Message = ex.ToString();
            }
            return response;
        }

        public async Task<ResponseDTO> ExecuteTableStoredProcedure<TResult>(string storedProcedureName, object? parameters, Func<SqlDataReader, List<TResult>> mapFunction)
        {
            var response = new ResponseDTO
            {
                IsSuccess = false
            };

            try
            {
                using var connection = _dataContext.CreateConnection();
                await connection.OpenAsync();

                using var command = connection.CreateCommand();
                command.CommandText = storedProcedureName;
                command.CommandType = CommandType.StoredProcedure;

                if (parameters != null)
                {
                    _sqlCommandService.AddParameters(command, parameters);
                }

                using var reader = await command.ExecuteReaderAsync();
                

                var resultList = mapFunction(reader);
                int totalRecords = resultList.Count;

                if (await reader.NextResultAsync() && await reader.ReadAsync())
                {
                    totalRecords = reader.GetInt32(reader.GetOrdinal("TotalRecords"));
                }

                response.Data = new { Results = resultList, TotalRecords = totalRecords };
                response.Message = "Operation completed successfully.";
                response.IsSuccess = true;
            }
            catch (SqlException sqlEx)
            {
                await _logService.SaveLogsMessagesAsync($"SQL Error while executing stored procedure {storedProcedureName}: {sqlEx.Message}");
                response.Message = $"Database error occurred: {sqlEx.Message}";
            }
            catch (Exception ex)
            {
                await _logService.SaveLogsMessagesAsync($"An error occurred while executing stored procedure {storedProcedureName}: {ex.Message}");
                response.Message = $"An error occurred while executing the operation: {ex.Message}";
            }

            return response;
        }

        public async Task<ResponseDTO> ExecuteJsonStoredProcedure(string storedProcedureName, object parameters)
        {
            var response = new ResponseDTO
            {
                IsSuccess = false
            };

            try
            {
                using var connection = _dataContext.CreateConnection();
                await connection.OpenAsync();

                using SqlCommand command = connection.CreateCommand();
                command.CommandText = storedProcedureName;
                command.CommandType = CommandType.StoredProcedure;
                _sqlCommandService.AddParameters(command, parameters);

                using SqlDataReader reader = await command.ExecuteReaderAsync();

                var jsonResults = new List<string>();

                while (await reader.ReadAsync())
                {
                    if (reader.FieldCount > 0 && !reader.IsDBNull(0))
                    {
                        jsonResults.Add(reader.GetString(0));
                    }
                }

                if (jsonResults.Any())
                {
                    var combinedJson = jsonResults.Count == 1
                        ? jsonResults[0]
                        : $"[{string.Join(",", jsonResults)}]";

                    response.Data = combinedJson;
                    response.Message = "Operation completed successfully.";
                    response.IsSuccess = true;
                }
                else
                {
                    response.Message = "No data returned from stored procedure.";
                    response.Data = "[]";
                    response.IsSuccess = true;
                }
            }
            catch (SqlException sqlEx)
            {
                await _logService.SaveLogsMessagesAsync($"SQL Error while executing stored procedure {storedProcedureName}: {sqlEx.Message}");
                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = sqlEx.Message
                };
            }
            catch (Exception ex)
            {
                await _logService.SaveLogsMessagesAsync($"An error occurred while executing stored procedure {storedProcedureName}: {ex.Message}");
                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = ex.Message
                };
            }

            return response;
        }
    }
}
