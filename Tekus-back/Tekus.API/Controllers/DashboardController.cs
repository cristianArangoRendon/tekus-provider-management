using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using task.infraestructure.Helpers;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace WMSGlobal.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]
    public class DashboardController(ILogService logService, IDashboardUseCase useCase) : ControllerBase
    {
        private readonly IDashboardUseCase _dashboardUseCase = useCase;
        private readonly ILogService _logService = logService;

        [HttpGet("summary")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDashboardSummary()
            => await HandleResponseHelper.HandleResponse(
                () => _dashboardUseCase.GetDashboardSummary(),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
    }
}
