using Tekus.Core.DTOs.Countries;
using Tekus.Core.DTOs.ResponseDTO;

namespace Tekus.Core.Interfaces.UseCases
{
    public interface ICountriesUseCase
    {
        Task<ResponseDTO> GetAllCountries();
        Task<ResponseDTO> GetCountryByCode(string code);
        Task<ResponseDTO> GetCountriesPaged(CountryFilterDTO filter);
        Task<ResponseDTO> GetCountriesByRegion(string region);
        Task<ResponseDTO> SearchCountriesByName(string name);
        Task<ResponseDTO> GetAvailableRegions();
    }
}
