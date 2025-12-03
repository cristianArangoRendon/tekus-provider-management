using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Tekus.Infrastructure.UseCases.DependencyInversion
{
    public static class ServicesExtensionsUseCase
    {
        public static IServiceCollection AddUseCase(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton(configuration);



            return services;
        }
    }
}
