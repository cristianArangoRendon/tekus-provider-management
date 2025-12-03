using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Reflection;
using task.infraestructure.Helpers;
using Tekus.core.DTOs.Services;
using Tekus.core.Interfaces.UseCases;
using Tekus.Core.Interfaces.Services;

namespace Tekus.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Produces("application/json")]
    [Authorize]

    public class ServicesController : ControllerBase
    {
        private readonly IServiceUseCase _serviceUseCase;
        private readonly ILogService _logService;

        public ServicesController(ILogService logService, IServiceUseCase useCase)
        {
            _serviceUseCase = useCase;
            _logService = logService;
        }
  

        [HttpGet("paged")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetServicesPaged([FromQuery] GetServicesPagedDTO filters)
            => await HandleResponseHelper.HandleResponse(
                () => _serviceUseCase.GetServicesPaged(filters),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );


        [HttpPost]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateService([FromBody] CreateServiceDTO serviceDTO)
            => await HandleResponseHelper.HandleResponse(
                () => _serviceUseCase.CreateService(serviceDTO),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );

        [HttpPut("{serviceId:int}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateService(
            [FromRoute] int serviceId,
            [FromBody] UpdateServiceDTO serviceDTO)
        {
            serviceDTO.ServiceId = serviceId; 
            return await HandleResponseHelper.HandleResponse(
                () => _serviceUseCase.UpdateService(serviceDTO),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
        }


        [HttpDelete("{serviceId:int}")]
        [ProducesResponseType(typeof(object), StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> DeleteService([FromRoute] int serviceId)
            => await HandleResponseHelper.HandleResponse(
                () => _serviceUseCase.DeleteService(serviceId),
                _logService,
                MethodBase.GetCurrentMethod()?.Name ?? string.Empty
            );
    }
}