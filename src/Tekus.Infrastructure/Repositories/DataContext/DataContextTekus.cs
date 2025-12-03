using Microsoft.Data.SqlClient;
using Microsoft.Extensions.Configuration;
using System.Data;
using Tekus.Core.Interfaces.Repositories.DataContext;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Infrastructure.Repository.DataContext
{
    public class DataContextTekus(IConfiguration configuration, ILogService logService) : IDataContextTekus
    {
        private readonly string _connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is missing from configuration");
        private readonly ILogService _logService = logService ?? throw new ArgumentNullException(nameof(logService));

        public SqlConnection CreateConnection()
        {
            try
            {
                return new SqlConnection(_connectionString);
            }
            catch (Exception ex)
            {
                _ = _logService.SaveLogsMessagesAsync($"Error creating SQL connection: {ex.Message}");
                throw;
            }
        }

        public SqlCommand CreateCommand()
        {
            try
            {
                var connection = CreateConnection();
                return new SqlCommand
                {
                    Connection = connection,
                    CommandType = CommandType.Text
                };
            }
            catch (Exception ex)
            {
                _ = _logService.SaveLogsMessagesAsync($"Error creating SQL command: {ex.Message}");
                throw;
            }
        }
    }
}
