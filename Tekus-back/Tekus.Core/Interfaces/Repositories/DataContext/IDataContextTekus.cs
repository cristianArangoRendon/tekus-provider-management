using Microsoft.Data.SqlClient;

namespace Tekus.Core.Interfaces.Repositories.DataContext
{
    public interface IDataContextTekus
    {
        SqlConnection CreateConnection();
        SqlCommand CreateCommand();
    }
}
