using Tekus.Core.DTOs.Providers;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.Repositories
{
    public interface IProviderRepository
    {
        Task<ResponseDTO> GetProvidersPaged(GetProvidersPagedDTO filters);
        Task<ResponseDTO> CreateProvider(CreateProviderDTO provider);
        Task<ResponseDTO> DeleteProvider(int providerId);
        Task<ResponseDTO> AddCustomFieldToProvider(AddCustomFieldDTO customField); 

    }
}
