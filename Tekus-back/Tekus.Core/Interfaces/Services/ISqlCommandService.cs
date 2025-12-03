using Microsoft.Data.SqlClient;

namespace Tekus.Core.Interfaces.Services
{
    public interface ISqlCommandService
    {
        void AddParameters<T>(SqlCommand command, T parameters);
    }
}
