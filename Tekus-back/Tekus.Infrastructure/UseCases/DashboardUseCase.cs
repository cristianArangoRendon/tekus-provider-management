using System.Text.Json;
using task.infraestructure.Helpers;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace task.Infrastructure.UseCases
{
    public class DashboardUseCase : IDashboardUseCase
    {
        private readonly IDashboardRepository _dashboardRepository;
        private readonly ILogService _logService;

        public DashboardUseCase(
            IDashboardRepository dashboardRepository,
            ILogService logService)
        {
            _dashboardRepository = dashboardRepository;
            _logService = logService;
        }

        public async Task<ResponseDTO> GetDashboardSummary()
        {
            try
            {
                var response = await _dashboardRepository.GetDashboardSummary();

                if (!response.IsSuccess || response.Data == null)
                    return response;

                var json = response.Data.ToString();

                var summary = JsonSerializer.Deserialize<DashboardSummaryDTO>(
                    json,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );

                return new ResponseDTO
                {
                    IsSuccess = true,
                    Message = "Resumen obtenido exitosamente",
                    Data = summary
                };
            }
            catch (JsonException ex)
            {
                await _logService.SaveLogsMessagesAsync(
                    $"Error deserializando JSON del dashboard: {ex.Message}"
                );

                return new ResponseDTO
                {
                    IsSuccess = false,
                    Message = $"Error al procesar datos: {ex.Message}",
                    Data = null
                };
            }
            catch (Exception ex) when (
                ExceptionHelper.HandleException(
                    _logService,
                    System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty,
                    ex
                ) is var errorResponse
            )
            {
                return errorResponse;
            }
        }
    }
}