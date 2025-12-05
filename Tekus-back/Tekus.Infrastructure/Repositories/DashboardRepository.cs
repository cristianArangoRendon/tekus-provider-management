using Inventory.Core.Interfaces.Services;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories;

namespace task.infraestructure.Repositories
{
    public class DashboardRepository(IExecuteStoreProcedureService service) : IDashboardRepository
    {
        private readonly IExecuteStoreProcedureService _spService = service;

        public async Task<ResponseDTO> GetDashboardSummary()
        {
            return await _spService.ExecuteJsonStoredProcedure(
                "dbo.sp_ResumenDashboard",
                new {}
            );
        }
    }
}
