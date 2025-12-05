using Tekus.Core.DTOs.ProviderServices;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.Repositories
{
    public interface IProviderServiceRepository
    {
        Task<ResponseDTO> AssignServiceToProvider(AssignServiceToProviderDTO assignment);
    }
}
