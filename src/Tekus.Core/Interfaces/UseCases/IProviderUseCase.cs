using Tekus.Core.DTOs.Providers;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.UseCases
{
    public interface IProviderUseCase
    {
        Task<ResponseDTO> GetProvidersPaged(GetProvidersPagedDTO filters);
        Task<ResponseDTO> CreateProvider(CreateProviderDTO provider);
        Task<ResponseDTO> DeleteProvider(int providerId);
        Task<ResponseDTO> AddCustomFieldToProvider(AddCustomFieldDTO customField); 

    }
}
