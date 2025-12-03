using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Tekus.Core.DTOs.Auth;
namespace Tekus.Infrastructure.Services 
{
    public class TokenService(IConfiguration configuration) : ITokenService
    {
        private readonly IConfiguration _configuration = configuration;

        public async Task<TokenResultDTO> GenerateTokenAsync(object userData)
        {
            UserByEmailDTO? user = userData as UserByEmailDTO
                ?? throw new ArgumentException("El objeto userData no es de tipo UserByEmailDTO", nameof(userData));

            var claims = new List<Claim>
            {
                new("IdUser", user.UserId.ToString()),
                new("UserName", user.Username),
                new("Email", user.Email ?? string.Empty),
                new("IsActiveUser", user.IsActive.ToString()),
                new("CreatedAtUser", user.CreatedAt.ToString("O")),
                new("UpdatedAtUser", user.UpdatedAt.ToString("O")),
                new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var expirationHours = _configuration["JWT:ExpirationHours"];
            if (!double.TryParse(expirationHours, out double expHours))
            {
                expHours = 6.0;  
            }

            var expirationTime = DateTime.Now.AddHours(expHours);
            var secretKey = _configuration["JWT:SecretKey"];

            if (string.IsNullOrEmpty(secretKey))
            {
                throw new InvalidOperationException("JWT SecretKey is not configured");
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                claims: claims,
                expires: expirationTime,
                signingCredentials: creds
            );

            var tokenString = new JwtSecurityTokenHandler().WriteToken(token);

            var result = new TokenResultDTO
            {
                Token = tokenString,
                Expiration = expirationTime
            };

            return await Task.FromResult(result);
        }
    }
}