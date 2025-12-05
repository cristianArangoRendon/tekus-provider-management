using Inventory.Core.Interfaces.Services;
using Tekus.Core.DTOs.ProviderServices;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories;
using Tekus.infraestructure.Helpers;

namespace task.infraestructure.Repositories
{
    public class ProviderServiceRepository : IProviderServiceRepository
    {
        private readonly IExecuteStoreProcedureService _executeStoreProcedureService;

        public ProviderServiceRepository(IExecuteStoreProcedureService service)
        {
            _executeStoreProcedureService = service;
        }

        public async Task<ResponseDTO> AssignServiceToProvider(AssignServiceToProviderDTO assignment)
        {
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_AssignServiceToProvider",
                ObjectExtensionsHelper.ToObject<AssignServiceToProviderDTO>(assignment)
            );
        }
    }
}