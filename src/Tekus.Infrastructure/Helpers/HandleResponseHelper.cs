using Microsoft.AspNetCore.Mvc;
using System.ComponentModel.DataAnnotations;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Services;

namespace task.infraestructure.Helpers
{
    public class HandleResponseHelper
    {
        public static async Task<ActionResult> HandleResponse(Func<Task<ResponseDTO>> action, ILogService _logService, string controllerName)
        {
            try
            {
                ResponseDTO response = await action.Invoke();

                return new OkObjectResult(response);

            }
            catch (ValidationException ex)
            {
                await _logService.SaveLogsMessagesAsync($"Error desde :: {controllerName} :: {ex.Message}");
                return new BadRequestObjectResult(new ResponseDTO { Message = ex.Message });
            }
            catch (Exception ex)
            {
                await _logService.SaveLogsMessagesAsync($"Error desde :: {controllerName} :: {ex.Message}");
                return new StatusCodeResult(500);
            }
        }
    }
}
