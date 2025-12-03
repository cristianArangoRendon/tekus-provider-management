using Inventory.Core.Interfaces.Services;
using Tekus.Core.DTOs.Providers;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories;
using Tekus.infraestructure.Helpers;
using Tekus.Infrastructure.Helpers;

namespace task.infraestructure.Repositories
{
    public class ProviderRepository(IExecuteStoreProcedureService service) : IProviderRepository
    {
        private readonly IExecuteStoreProcedureService _executeStoreProcedureService = service;

        public async Task<ResponseDTO> GetProvidersPaged(GetProvidersPagedDTO filters)
        {
            return await _executeStoreProcedureService.ExecuteTableStoredProcedure(
                "dbo.sp_GetProvidersPaged",
                ObjectExtensionsHelper.ToObject<GetProvidersPagedDTO>(filters),
                MapToListHelper.MapToList<ProviderPagedDTO>
            );
        }

        public async Task<ResponseDTO> CreateProvider(CreateProviderDTO provider)
        {
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_CreateProvider",
                ObjectExtensionsHelper.ToObject<CreateProviderDTO>(provider)
            );
        }

        public async Task<ResponseDTO> DeleteProvider(int providerId)
        {
            object obj = new
            {
                ProviderId = providerId
            };
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_DeleteProvider",
                obj
            );
        }

        public async Task<ResponseDTO> AddCustomFieldToProvider(AddCustomFieldDTO customField)
        {
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_AddCustomFieldToProvider",
                ObjectExtensionsHelper.ToObject<AddCustomFieldDTO>(customField)
            );
        }
    }
}