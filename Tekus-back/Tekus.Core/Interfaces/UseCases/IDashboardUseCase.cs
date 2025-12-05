using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.UseCases
{
    public interface IDashboardUseCase
    {
        Task<ResponseDTO> GetDashboardSummary();
    }
}
