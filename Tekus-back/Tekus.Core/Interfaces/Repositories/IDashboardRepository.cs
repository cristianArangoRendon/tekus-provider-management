using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.Repositories
{
    public interface IDashboardRepository
    {
        Task<ResponseDTO> GetDashboardSummary();
    }
}
