using task.infraestructure.Helpers;
using Tekus.Core.DTOs.Providers;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Repositories;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;

namespace task.Infrastructure.UseCases
{
    public class ProviderUseCase(IProviderRepository providerRepository, ILogService logService) : IProviderUseCase
    {
        private readonly IProviderRepository _providerRepository = providerRepository;
        private readonly ILogService _logService = logService;

        public async Task<ResponseDTO> GetProvidersPaged(GetProvidersPagedDTO filters)
        {
            try
            {
                return await _providerRepository.GetProvidersPaged(filters);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> CreateProvider(CreateProviderDTO provider)
        {
            try
            {
                return await _providerRepository.CreateProvider(provider);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> DeleteProvider(int providerId)
        {
            try
            {
                return await _providerRepository.DeleteProvider(providerId);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }

        public async Task<ResponseDTO> AddCustomFieldToProvider(AddCustomFieldDTO customField)
        {
            try
            {
                return await _providerRepository.AddCustomFieldToProvider(customField);
            }
            catch (Exception ex) when (ExceptionHelper.HandleException(_logService, System.Reflection.MethodBase.GetCurrentMethod()?.Name ?? string.Empty, ex) is var response)
            {
                return response;
            }
        }
    }
}