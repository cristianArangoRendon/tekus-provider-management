using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using task.infraestructure.Helpers;
using Tekus.Core.DTOs.Providers;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace WMSGlobal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public class ProvidersController(ILogService logService, IProviderUseCase useCase) : ControllerBase
    {
        private readonly IProviderUseCase _providerUseCase = useCase;
        private readonly ILogService _logService = logService;


        [HttpGet("paged")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetProvidersPaged([FromQuery] GetProvidersPagedDTO filters)
            => await HandleResponseHelper.HandleResponse(
                () => _providerUseCase.GetProvidersPaged(filters),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateProvider([FromBody] CreateProviderDTO providerDTO)
            => await HandleResponseHelper.HandleResponse(
                () => _providerUseCase.CreateProvider(providerDTO),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );


        [HttpDelete("{providerId:int}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteProvider([FromRoute] int providerId)
            => await HandleResponseHelper.HandleResponse(
                () => _providerUseCase.DeleteProvider(providerId),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpPost("{providerId:int}/custom-fields")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AddCustomFieldToProvider(
        [FromRoute] int providerId,
        [FromBody] AddCustomFieldDTO customFieldDTO)
        {
            customFieldDTO.ProviderId = providerId;
            return await HandleResponseHelper.HandleResponse(
                () => _providerUseCase.AddCustomFieldToProvider(customFieldDTO),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
        }
    }
}