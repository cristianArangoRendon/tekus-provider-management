namespace Tekus.Core.DTOs.Auth
{
    public class TokenResultDTO
    {
        public string Token { get; set; } = string.Empty;
        public DateTime Expiration { get; set; }
    }
}
