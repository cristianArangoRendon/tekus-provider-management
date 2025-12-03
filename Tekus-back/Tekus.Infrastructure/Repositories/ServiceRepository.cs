using Inventory.Core.Interfaces.Services;
using task.core.Interfaces.Repositories;
using Tekus.core.DTOs.Services;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.infraestructure.Helpers;
using Tekus.Infrastructure.Helpers;

namespace task.infraestructure.Repositories
{
    public class ServiceRepository : IServiceRepository
    {
        private readonly IExecuteStoreProcedureService _executeStoreProcedureService;

        public ServiceRepository(IExecuteStoreProcedureService service)
        {
            _executeStoreProcedureService = service;
        }

        public async Task<ResponseDTO> GetServicesPaged(GetServicesPagedDTO filters)
        {
            return await _executeStoreProcedureService.ExecuteTableStoredProcedure(
                "dbo.sp_GetServicesPaged",
                ObjectExtensionsHelper.ToObject<GetServicesPagedDTO>(filters),
                MapToListHelper.MapToList<ServicePagedDTO>
            );
        }

        public async Task<ResponseDTO> CreateService(CreateServiceDTO service)
        {
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_CreateService",
                ObjectExtensionsHelper.ToObject<CreateServiceDTO>(service)
            );
        }

        public async Task<ResponseDTO> UpdateService(UpdateServiceDTO service)
        {
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_UpdateService",
                ObjectExtensionsHelper.ToObject<UpdateServiceDTO>(service)
            );
        }

        public async Task<ResponseDTO> DeleteService(int serviceId)
        {
            object obj = new
            {
                ServiceId = serviceId
            };
            return await _executeStoreProcedureService.ExecuteStoredProcedure(
                "dbo.sp_DeleteService",
                obj
            );
        }


    }
}