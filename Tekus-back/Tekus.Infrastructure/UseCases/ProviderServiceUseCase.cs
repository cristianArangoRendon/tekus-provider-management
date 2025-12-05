using task.infraestructure.Helpers;
using Tekus.core.Interfaces.UseCases;
using Tekus.Core.DTOs.ProviderServices;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories;
using Tekus.Core.Interfaces.Services;

namespace task.Infrastructure.UseCases
{
    public class ProviderServiceUseCase(IProviderServiceRepository providerServiceRepository, ILogService logService) : IProviderServiceUseCase
    {
        private readonly IProviderServiceRepository _providerServiceRepository = providerServiceRepository;
        private readonly ILogService _logService = logService;

        public async Task<ResponseDTO> AssignServiceToProvider(AssignServiceToProviderDTO assignment)
        {
            try
            {
                return await _providerServiceRepository.AssignServiceToProvider(assignment);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }
    }
}