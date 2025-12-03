using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Tekus.Infrastructure.Repository.DependencyInversion;
using Tekus.Infrastructure.Services.DependencyInversion;
using Tekus.Infrastructure.UseCases.DependencyInversion;

namespace Tekus.Infrastructure.DependencyInversion
{
    public static class ServicesExtensions
    {
        public static IServiceCollection AddDependencies(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton(configuration);
            services.AddRepositories(configuration);
            services.AddUseCase(configuration);
            services.AddServices(configuration);
            return services;
        }
    }
}
