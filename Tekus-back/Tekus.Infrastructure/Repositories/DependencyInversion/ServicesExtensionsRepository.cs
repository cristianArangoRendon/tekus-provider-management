using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using task.core.Interfaces.Repositories;
using task.infraestructure.Repositories;
using Tekus.Core.Interfaces.Repositories;
using Tekus.Core.Interfaces.Repositories.DataContext;
using Tekus.Infrastructure.Repository.DataContext;

namespace Tekus.Infrastructure.Repository.DependencyInversion
{
    public static class ServicesExtensionsRepository
    {
        public static IServiceCollection AddRepositories(this IServiceCollection services, IConfiguration configuration)
        {
            services.AddSingleton(configuration);
            services.AddScoped<IDataContextTekus, DataContextTekus>();
            services.AddTransient<IProviderRepository, ProviderRepository>();
            services.AddTransient<IServiceRepository, ServiceRepository>();
            services.AddTransient<IDashboardRepository, DashboardRepository>();

            return services;
        }
    }
}
