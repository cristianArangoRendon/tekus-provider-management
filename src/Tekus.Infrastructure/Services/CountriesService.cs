using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System.Net.Http.Json;
using task.infraestructure.Helpers;
using Tekus.Core.DTOs.Countries;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Services;
using Tekus.Infrastructure.ExternalModels;

namespace Tekus.Infrastructure.Services
{
    public class CountriesService : ICountriesService
    {
        private readonly HttpClient _httpClient;
        private readonly IMemoryCache _cache;
        private readonly RestCountriesSettingsDTO _settings;
        private readonly ILogService _logService;

        private const string CACHE_KEY_ALL_COUNTRIES = "all_countries";
        private const string FIELDS_QUERY = "?fields=name,cca3,capital,region,subregion,population,flags,languages,currencies";

        public CountriesService(
            HttpClient httpClient,
            IMemoryCache cache,
            IOptions<RestCountriesSettingsDTO> settings,
            ILogService logService)
        {
            _httpClient = httpClient;
            _cache = cache;
            _settings = settings.Value;
            _logService = logService;

            _httpClient.BaseAddress = new Uri(_settings.BaseUrl);
            _httpClient.Timeout = TimeSpan.FromSeconds(_settings.TimeoutSeconds);
        }

        public async Task<ResponseDTO> GetAllCountriesAsync()
        {
            try
            {
                if (_settings.UseCache && _cache.TryGetValue(CACHE_KEY_ALL_COUNTRIES, out List<CountryDTO> cachedCountries))
                {
                    return CreateSuccessResponse("Países obtenidos exitosamente del caché", cachedCountries);
                }

                var endpoint = $"all{FIELDS_QUERY}";
                var response = await _httpClient.GetAsync(endpoint);

                if (!response.IsSuccessStatusCode)
                {
                    return await HandleErrorResponseAsync(response, "Error al consultar el servicio externo de países");
                }

                var externalCountries = await response.Content.ReadFromJsonAsync<List<RestCountriesResponse>>();

                if (externalCountries == null || !externalCountries.Any())
                {
                    return CreateSuccessResponse("No se encontraron países", new List<CountryDTO>());
                }

                var countries = externalCountries.Select(MapToCountryDTO).ToList();

                if (_settings.UseCache)
                {
                    CacheCountries(countries);
                }

                return CreateSuccessResponse($"{countries.Count} países obtenidos exitosamente", countries);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> GetCountryByCodeAsync(string code)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(code))
                {
                    return CreateErrorResponse("El código del país es requerido");
                }

                code = code.ToUpperInvariant();
                var endpoint = $"alpha/{code}";
                var response = await _httpClient.GetAsync(endpoint);

                if (!response.IsSuccessStatusCode)
                {
                    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        return CreateErrorResponse($"País no encontrado con código: {code}");
                    }

                    return await HandleErrorResponseAsync(response, "Error al consultar el servicio externo");
                }

                var externalCountries = await response.Content.ReadFromJsonAsync<List<RestCountriesResponse>>();

                if (externalCountries == null || !externalCountries.Any())
                {
                    return CreateErrorResponse($"No se encontró información para el código: {code}");
                }

                var country = MapToCountryDTO(externalCountries.First());

                return CreateSuccessResponse("País obtenido exitosamente", country);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> GetCountriesByRegionAsync(string region)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(region))
                {
                    return CreateErrorResponse("La región es requerida");
                }

                var endpoint = $"region/{region}";
                var response = await _httpClient.GetAsync(endpoint);

                if (!response.IsSuccessStatusCode)
                {
                    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        return CreateErrorResponse($"Región no encontrada: {region}", new List<CountryDTO>());
                    }

                    return await HandleErrorResponseAsync(response, "Error al consultar el servicio externo");
                }

                var externalCountries = await response.Content.ReadFromJsonAsync<List<RestCountriesResponse>>();

                if (externalCountries == null || !externalCountries.Any())
                {
                    return CreateSuccessResponse($"No se encontraron países en la región: {region}", new List<CountryDTO>());
                }

                var countries = externalCountries.Select(MapToCountryDTO).ToList();

                return CreateSuccessResponse($"{countries.Count} países obtenidos de la región {region}", countries);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> SearchCountriesByNameAsync(string name)
        {
            try
            {
                if (string.IsNullOrWhiteSpace(name))
                {
                    return CreateErrorResponse("El nombre es requerido");
                }

                var endpoint = $"name/{name}";
                var response = await _httpClient.GetAsync(endpoint);

                if (!response.IsSuccessStatusCode)
                {
                    if (response.StatusCode == System.Net.HttpStatusCode.NotFound)
                    {
                        return CreateSuccessResponse($"No se encontraron países con el nombre: {name}", new List<CountryDTO>());
                    }

                    return await HandleErrorResponseAsync(response, "Error al consultar el servicio externo");
                }

                var externalCountries = await response.Content.ReadFromJsonAsync<List<RestCountriesResponse>>();

                if (externalCountries == null || !externalCountries.Any())
                {
                    return CreateSuccessResponse($"No se encontraron países con el nombre: {name}", new List<CountryDTO>());
                }

                var countries = externalCountries.Select(MapToCountryDTO).ToList();

                return CreateSuccessResponse($"{countries.Count} países encontrados", countries);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        private CountryDTO MapToCountryDTO(RestCountriesResponse external)
        {
            var country = new CountryDTO
            {
                Code = external.Cca3 ?? "N/A",
                Name = external.Name?.Common ?? "N/A",
                OfficialName = external.Name?.Official ?? "N/A",
                Region = external.Region ?? string.Empty,
                SubRegion = external.Subregion ?? string.Empty,
                Population = external.Population,
                Capitals = external.Capital ?? new List<string>(),
                FlagUrl = external.Flags?.Svg ?? external.Flags?.Png ?? string.Empty,
                Languages = external.Languages?.Values.ToList() ?? new List<string>(),
                Currency = MapCurrencyInfo(external.Currencies)
            };

            return country;
        }

        private static CurrencyInfoDTO MapCurrencyInfo(Dictionary<string, CurrencyInfo>? currencies)
        {
            var firstCurrency = currencies?.FirstOrDefault();

            if (firstCurrency.HasValue && firstCurrency.Value.Value != null)
            {
                return new CurrencyInfoDTO
                {
                    Code = firstCurrency.Value.Key,
                    Name = firstCurrency.Value.Value.Name ?? string.Empty,
                    Symbol = firstCurrency.Value.Value.Symbol ?? string.Empty
                };
            }

            return new CurrencyInfoDTO
            {
                Code = string.Empty,
                Name = string.Empty,
                Symbol = string.Empty
            };
        }

        private void CacheCountries(List<CountryDTO> countries)
        {
            var cacheOptions = new MemoryCacheEntryOptions()
                .SetAbsoluteExpiration(TimeSpan.FromMinutes(_settings.CacheExpirationMinutes));

            _cache.Set(CACHE_KEY_ALL_COUNTRIES, countries, cacheOptions);
        }

        private static ResponseDTO CreateSuccessResponse(string message, object data)
        {
            return new ResponseDTO
            {
                IsSuccess = true,
                Message = message,
                Data = data
            };
        }

        private static ResponseDTO CreateErrorResponse(string message, object? data = null)
        {
            return new ResponseDTO
            {
                IsSuccess = false,
                Message = message,
                Data = data
            };
        }

        private static async Task<ResponseDTO> HandleErrorResponseAsync(HttpResponseMessage response, string baseMessage)
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            return CreateErrorResponse($"{baseMessage}: {response.StatusCode} - {errorContent}");
        }
    }
}