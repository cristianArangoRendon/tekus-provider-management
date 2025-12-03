using Microsoft.OpenApi;

namespace Tekus.Extensions;

public static class ServiceExtensions
{
    public static void AddSwaggerDocumentation(this IServiceCollection services)
    {
        services.AddEndpointsApiExplorer();
        services.AddSwaggerGen(c =>
        {
            c.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "Prueba final para Desarrollador Fullstack .Net",
                Version = "v1",
                Description = "API para evaluación técnica",
                Contact = new OpenApiContact
                {
                    Name = "Desarrollador",
                    Email = "developer@empresa.com"
                }
            });

            c.OrderActionsBy((apiDesc) => $"{apiDesc.HttpMethod}");

        });
    }
}