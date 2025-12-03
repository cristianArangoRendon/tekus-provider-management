using Microsoft.Data.SqlClient;
using System.Reflection;
using Tekus.Core.Interfaces.Services;

namespace Tekus.Infrastructure.Services
{
    public class SqlCommandService : ISqlCommandService
    {
        public void AddParameters<T>(SqlCommand command, T parameters)
        {
            if (parameters == null) throw new ArgumentNullException(nameof(parameters));
            PropertyInfo[] properties = parameters.GetType().GetProperties(BindingFlags.Public | BindingFlags.Instance);
            foreach (PropertyInfo property in properties)
            {
                object? value = property.GetValue(parameters);
                string parameterName = $"@{property.Name}";
                command.Parameters.Add(new SqlParameter(parameterName, value ?? DBNull.Value));
            }
        }

    }
}
