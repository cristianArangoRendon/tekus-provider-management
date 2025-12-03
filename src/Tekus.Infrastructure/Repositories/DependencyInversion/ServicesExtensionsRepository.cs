using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
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
            return services;
        }
    }
}
