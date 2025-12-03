using Tekus.Core.DTOs.Countries;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.UseCases
{
    public interface ICountries
    {
        Task<ResponseDTO> GetAllCountriesAsync();
        Task<ResponseDTO> GetCountryByCodeAsync(string code);
        Task<ResponseDTO> GetCountriesPagedAsync(CountryFilterDTO filter);
        Task<ResponseDTO> GetCountriesByRegionAsync(string region);
        Task<ResponseDTO> SearchCountriesByNameAsync(string name);
        Task<ResponseDTO> GetAvailableRegionsAsync();
    }
}
