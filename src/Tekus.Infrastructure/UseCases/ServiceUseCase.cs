using task.core.Interfaces.Repositories;
using task.infraestructure.Helpers;
using Tekus.core.DTOs.Services;
using Tekus.core.Interfaces.UseCases;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Services;

namespace task.Infrastructure.UseCases
{
    public class ServiceUseCase(IServiceRepository serviceRepository, ILogService logService) : IServiceUseCase
    {
        private readonly IServiceRepository _serviceRepository = serviceRepository;
        private readonly ILogService _logService = logService;

        public async Task<ResponseDTO> GetServicesPaged(GetServicesPagedDTO filters)
        {
            try
            {
                return await _serviceRepository.GetServicesPaged(filters);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> CreateService(CreateServiceDTO service)
        {
            try
            {
                return await _serviceRepository.CreateService(service);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> UpdateService(UpdateServiceDTO service)
        {
            try
            {
                return await _serviceRepository.UpdateService(service);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> DeleteService(int serviceId)
        {
            try
            {
                return await _serviceRepository.DeleteService(serviceId);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }
    }
}