using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using task.Infrastructure.UseCases;
using Tekus.core.Interfaces.UseCases;
using Tekus.Core.Interfaces.UseCases;

namespace Tekus.Infrastructure.UseCases.DependencyInversion
{
    public static class ServicesExtensionsUseCase
    {
        public static IServiceCollection AddUseCase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton(configuration);
            services.AddTransient<IProviderUseCase, ProviderUseCase>();
            services.AddTransient<IServiceUseCase, ServiceUseCase>();
            services.AddTransient<IAuthenticationUseCase, AuthenticationUseCase>();
            services.AddTransient<ICountriesUseCase, CountriesUseCase>();
            services.AddTransient<IDashboardUseCase, DashboardUseCase>();



            return services;
        }
    }
}
