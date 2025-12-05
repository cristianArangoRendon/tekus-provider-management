using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using task.infraestructure.Helpers;
using Tekus.core.Interfaces.UseCases;
using Tekus.Core.DTOs.ProviderServices;
using Tekus.Core.Interfaces.Services;

namespace Tekus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public class ProviderServicesController(ILogService logService, IProviderServiceUseCase useCase) : ControllerBase
    {
        private readonly IProviderServiceUseCase _providerServiceUseCase = useCase;
        private readonly ILogService _logService = logService;

        [HttpPost("assign")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AssignServiceToProvider([FromBody] AssignServiceToProviderDTO assignmentDTO)
            => await HandleResponseHelper.HandleResponse(
                () => _providerServiceUseCase.AssignServiceToProvider(assignmentDTO),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
    }
}