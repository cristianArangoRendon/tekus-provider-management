namespace Tekus.Core.DTOs.Auth
{
    public class UserByEmailDTO
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public string passwordHash { get; set; } = string.Empty;
        public string passwordSalt { get; set; } = string.Empty;
    }
}