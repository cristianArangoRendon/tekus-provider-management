using Tekus.core.DTOs.Services;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.core.Interfaces.UseCases
{
    public interface IServiceUseCase
    {
        Task<ResponseDTO> GetServicesPaged(GetServicesPagedDTO filters);
        Task<ResponseDTO> CreateService(CreateServiceDTO service);
        Task<ResponseDTO> UpdateService(UpdateServiceDTO service);
        Task<ResponseDTO> DeleteService(int serviceId);
    }
}