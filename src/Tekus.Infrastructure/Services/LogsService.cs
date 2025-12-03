using Microsoft.Extensions.Configuration;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Infrastructure.Services
{
    public class LogsService(IConfiguration configuration) : ILogService
    {
        private readonly IConfiguration _configuration = configuration;

        public async Task SaveLogsMessagesAsync(string messages)
        {
            try
            {
                string logPath = _configuration["PathLogs"] ?? "./logs";
                
                if (!Path.IsPathRooted(logPath))
                {
                    logPath = Path.Combine(Directory.GetCurrentDirectory(), logPath);
                }

                if (!Directory.Exists(logPath))
                {
                    Directory.CreateDirectory(logPath);
                }

                string fileName = $"log_{DateTime.Now:yyyyMMdd}.txt";
                string filePath = Path.Combine(logPath, fileName);

                if (File.Exists(filePath) && new FileInfo(filePath).Length > 100 * 1024 * 1024)
                {
                    string backupFilePath = $"{filePath}.{DateTime.Now:yyyyMMddHHmmss}.bak";
                    File.Move(filePath, backupFilePath);
                }

                await using StreamWriter writer = new(filePath, append: true);
                await writer.WriteLineAsync($"[{DateTime.Now:yyyy-MM-dd HH:mm:ss}] {messages}");
            }
            catch (Exception ex)
            {

            }
        }
    }
}
