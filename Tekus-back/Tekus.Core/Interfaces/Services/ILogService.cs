namespace Tekus.Core.Interfaces.Services
{
    public interface ILogService
    {
        Task SaveLogsMessagesAsync(string messages);
    }
}
