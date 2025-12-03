using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.Services
{
    public interface ICountriesService
    {
        Task<ResponseDTO> GetAllCountriesAsync();
        Task<ResponseDTO> GetCountryByCodeAsync(string code);
        Task<ResponseDTO> GetCountriesByRegionAsync(string region);
        Task<ResponseDTO> SearchCountriesByNameAsync(string name);
    }
}
