using Tekus.Core.DTOs.ProviderServices;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.core.Interfaces.UseCases
{
    public interface IProviderServiceUseCase
    {
        Task<ResponseDTO> AssignServiceToProvider(AssignServiceToProviderDTO assignment);
    }
}