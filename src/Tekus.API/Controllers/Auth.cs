using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using task.infraestructure.Helpers;
using Tekus.Core.DTOs.Auth;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace WMSGlobal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    public class AuthenticationController(ILogService logService, IAuthenticationUseCase useCase) : ControllerBase
    {
        private readonly IAuthenticationUseCase _authenticationUseCase = useCase;
        private readonly ILogService _logService = logService;

        [HttpPost("login")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status401Unauthorized)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
            => await HandleResponseHelper.HandleResponse(
                () => _authenticationUseCase.Authentication(loginDTO),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
    }
}