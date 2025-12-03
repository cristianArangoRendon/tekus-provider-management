namespace Tekus.Core.Interfaces.Services
{
    public interface ISecurityService
    {
        (string hash, string salt) HashPassword(string password);
        bool VerifyPassword(string inputPassword, string storedHash, string storedSalt);
    }
}
