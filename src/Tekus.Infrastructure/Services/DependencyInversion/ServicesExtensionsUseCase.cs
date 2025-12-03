using Inventory.Core.Interfaces.Services;
using Inventory.Infrastructure.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tekus.Core.DTOs.Countries;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Infrastructure.Services.DependencyInversion
{
    public static class ServicesExtensionsService
    {
        public static IServiceCollection AddServices(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddTransient<ILogService, LogsService>();
            services.AddTransient<IExecuteStoreProcedureService, ExecuteStoreProcedureService>();
            services.AddTransient<ISqlCommandService, SqlCommandService>();
            services.AddTransient<ISecurityService, Argon2SecurityService>();
            services.AddTransient<ITokenService, TokenService>();

            services.Configure<RestCountriesSettingsDTO>(
                configuration.GetSection("RestCountries"));

            services.AddMemoryCache();

            services.AddHttpClient<ICountriesService, CountriesService>()
                .SetHandlerLifetime(TimeSpan.FromMinutes(5));

            return services;
        }
    }
}