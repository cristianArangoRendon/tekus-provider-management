using Inventory.Core.Interfaces.Services;
using Inventory.Infrastructure.Services;
using Microsoft.Extensions.DependencyInjection;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Infrastructure.Services.DependencyInversion
{
    public static class ServicesExtensionsService
    {
        public static IServiceCollection AddServices(this IServiceCollection services)
        {
            services.AddTransient<ILogService, LogsService>();
            services.AddTransient<IExecuteStoreProcedureService, ExecuteStoreProcedureService>();
            services.AddTransient<ISqlCommandService, SqlCommandService>();
            return services;
        }
    }
}
