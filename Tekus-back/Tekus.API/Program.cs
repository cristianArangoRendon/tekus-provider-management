using Tekus.API.Extensions;
using Tekus.Infrastructure.DependencyInversion;

var builder = WebApplication.CreateBuilder(args);
var configuration = builder.Configuration;

builder.Services.AddDependencies(configuration);
builder.Services.AddCorsPolicies();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddTekusJwtAuthentication(configuration);

builder.Services.AddSwaggerDocumentation();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwaggerDocumentation();
}

app.UseCorsPolicies();
app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();