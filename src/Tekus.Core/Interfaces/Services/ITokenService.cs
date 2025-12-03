using Tekus.Core.DTOs.Auth;

namespace Tekus.Infrastructure.Services
{
    public interface ITokenService
    {
        Task<TokenResultDTO> GenerateTokenAsync(object userData);
    }
}
