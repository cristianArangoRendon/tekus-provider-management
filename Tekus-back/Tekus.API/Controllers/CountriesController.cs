using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using task.infraestructure.Helpers;
using Tekus.Core.DTOs.Countries;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace WMSGlobal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public class CountriesController(ILogService logService, ICountriesUseCase useCase) : ControllerBase
    {
        private readonly ICountriesUseCase _countriesUseCase = useCase;
        private readonly ILogService _logService = logService;

        [HttpGet("paged")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCountriesPaged([FromQuery] CountryFilterDTO filters)
            => await HandleResponseHelper.HandleResponse(
                () => _countriesUseCase.GetCountriesPaged(filters),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpGet("all")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAllCountries()
            => await HandleResponseHelper.HandleResponse(
                () => _countriesUseCase.GetAllCountries(),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpGet("{code}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetCountryByCode([FromRoute] string code)
            => await HandleResponseHelper.HandleResponse(
                () => _countriesUseCase.GetCountryByCode(code),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpGet("region/{region}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetCountriesByRegion([FromRoute] string region)
            => await HandleResponseHelper.HandleResponse(
                () => _countriesUseCase.GetCountriesByRegion(region),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpGet("search/{name}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> SearchCountriesByName([FromRoute] string name)
            => await HandleResponseHelper.HandleResponse(
                () => _countriesUseCase.SearchCountriesByName(name),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpGet("regions")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAvailableRegions()
            => await HandleResponseHelper.HandleResponse(
                () => _countriesUseCase.GetAvailableRegions(),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
    }
}