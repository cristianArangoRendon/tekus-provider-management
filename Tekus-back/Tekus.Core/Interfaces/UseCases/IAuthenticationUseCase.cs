using Tekus.Core.DTOs.Auth;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.UseCases
{
    public interface IAuthenticationUseCase
    {
        Task<ResponseDTO> Authentication(LoginDTO loginDTO);
    }
}
