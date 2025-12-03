using task.infraestructure.Helpers;
using Tekus.Core.DTOs.Countries;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace task.Infrastructure.UseCases
{
    public class CountriesUseCase(ICountriesService countriesService, ILogService logService) : ICountriesUseCase
    {
        private readonly ICountriesService _countriesService = countriesService;
        private readonly ILogService _logService = logService;

        public async Task<ResponseDTO> GetAllCountries()
        {
            try
            {
                return await _countriesService.GetAllCountriesAsync();
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> GetCountryByCode(string code)
        {
            try
            {
                return await _countriesService.GetCountryByCodeAsync(code);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> GetCountriesPaged(CountryFilterDTO filter)
        {
            try
            {
                var allCountriesResponse = await _countriesService.GetAllCountriesAsync();

                if (!allCountriesResponse.IsSuccess || allCountriesResponse.Data == null)
                {
                    return allCountriesResponse;
                }

                var allCountries = (List<CountryDTO>)allCountriesResponse.Data;
                var query = allCountries.AsQueryable();

                if (!string.IsNullOrWhiteSpace(filter.SearchTerm))
                {
                    var searchTerm = filter.SearchTerm.ToLower();
                    query = query.Where(c =>
                        c.Name.ToLower().Contains(searchTerm) ||
                        c.Code.ToLower().Contains(searchTerm) ||
                        c.OfficialName.ToLower().Contains(searchTerm));
                }

                if (!string.IsNullOrWhiteSpace(filter.Region))
                {
                    query = query.Where(c => c.Region.Equals(filter.Region, StringComparison.OrdinalIgnoreCase));
                }

                if (!string.IsNullOrWhiteSpace(filter.Language))
                {
                    var language = filter.Language.ToLower();
                    query = query.Where(c => c.Languages != null && c.Languages.Any(l => l.ToLower().Contains(language)));
                }

                query = filter.SortBy?.ToLower() switch
                {
                    "name" => filter.Ascending ? query.OrderBy(c => c.Name) : query.OrderByDescending(c => c.Name),
                    "population" => filter.Ascending ? query.OrderBy(c => c.Population) : query.OrderByDescending(c => c.Population),
                    "code" => filter.Ascending ? query.OrderBy(c => c.Code) : query.OrderByDescending(c => c.Code),
                    "region" => filter.Ascending ? query.OrderBy(c => c.Region) : query.OrderByDescending(c => c.Region),
                    _ => query.OrderBy(c => c.Name)
                };

                var totalCount = query.Count();

                var items = query
                    .Skip((filter.PageNumber - 1) * filter.PageSize)
                    .Take(filter.PageSize)
                    .ToList();

                var pagedResult = new PagedResultDTO<CountryDTO>
                {
                    Items = items,
                    TotalCount = totalCount,
                    PageNumber = filter.PageNumber,
                    PageSize = filter.PageSize
                };

                return new ResponseDTO
                {
                    IsSuccess = true,
                    Message = $"Página {filter.PageNumber} de {pagedResult.TotalPages} obtenida exitosamente",
                    Data = pagedResult
                };
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> GetCountriesByRegion(string region)
        {
            try
            {
                return await _countriesService.GetCountriesByRegionAsync(region);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> SearchCountriesByName(string name)
        {
            try
            {
                return await _countriesService.SearchCountriesByNameAsync(name);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> GetAvailableRegions()
        {
            try
            {
                var countriesResponse = await _countriesService.GetAllCountriesAsync();

                if (!countriesResponse.IsSuccess || countriesResponse.Data == null)
                {
                    return countriesResponse;
                }

                var countries = (List<CountryDTO>)countriesResponse.Data;
                var regions = countries
                    .Where(c => !string.IsNullOrWhiteSpace(c.Region))
                    .Select(c => c.Region)
                    .Distinct()
                    .OrderBy(r => r)
                    .ToList();

                return new ResponseDTO
                {
                    IsSuccess = true,
                    Message = $"{regions.Count} regiones disponibles",
                    Data = regions
                };
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }
    }
}