using Microsoft.Extensions.Configuration;
using Tekus.Core.DTOs.Auth;
using Tekus.Core.DTOs.ResponseDTO;
using Tekus.Core.Interfaces.Services;
using Tekus.Core.Interfaces.UseCases;
using Tekus.Infrastructure.Services;

namespace Tekus.Infrastructure.UseCases
{
    public class AuthenticationUseCase(
        IConfiguration configuration,
        ILogService logService,
        ITokenService tokenService,
        ISecurityService securityService) : IAuthenticationUseCase
    {
        private readonly IConfiguration _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
        private readonly ILogService _logService = logService ?? throw new ArgumentNullException(nameof(logService));
        private readonly ITokenService _tokenService = tokenService ?? throw new ArgumentNullException(nameof(tokenService));
        private readonly ISecurityService _securityService = securityService ?? throw new ArgumentNullException(nameof(securityService));

        private const string CONFIG_EMAIL = "Authentication:Admin:Email";
        private const string CONFIG_PASSWORD_HASH = "Authentication:Admin:PasswordHash";
        private const string CONFIG_PASSWORD_SALT = "Authentication:Admin:PasswordSalt";
        private const string CONFIG_USERNAME = "Authentication:Admin:Username";
        private const string CONFIG_USER_ID = "Authentication:Admin:UserId";

        public async Task<ResponseDTO> Authentication(LoginDTO loginDTO)
        {
            var response = new ResponseDTO { IsSuccess = false };

            try
            {
                if (string.IsNullOrWhiteSpace(loginDTO.Email) || string.IsNullOrWhiteSpace(loginDTO.Password))
                {
                    response.Message = "Invalid credentials.";
                    await SimulatePasswordVerificationAsync();
                    return response;
                }

                var configEmail = _configuration[CONFIG_EMAIL];
                var configPasswordHash = _configuration[CONFIG_PASSWORD_HASH];
                var configPasswordSalt = _configuration[CONFIG_PASSWORD_SALT];
                var configUsername = _configuration[CONFIG_USERNAME];
                var configUserId = _configuration[CONFIG_USER_ID];

                if (string.IsNullOrWhiteSpace(configEmail) ||
                    string.IsNullOrWhiteSpace(configPasswordHash) ||
                    string.IsNullOrWhiteSpace(configPasswordSalt))
                {
                    response.Message = "Authentication service unavailable.";
                    await SimulatePasswordVerificationAsync();
                    return response;
                }

                var normalizedEmail = loginDTO.Email.Trim().ToLowerInvariant();
                var normalizedConfigEmail = configEmail.Trim().ToLowerInvariant();

                bool isValidUser = normalizedEmail == normalizedConfigEmail;
                bool isValidPassword = false;

                if (isValidUser)
                {
                    isValidPassword = _securityService.VerifyPassword(
                        loginDTO.Password,
                        configPasswordHash,
                        configPasswordSalt
                    );
                }
                else
                {
                    await SimulatePasswordVerificationAsync();
                }

                if (isValidPassword && isValidUser)
                {
                    var userForToken = new UserByEmailDTO
                    {
                        UserId = int.TryParse(configUserId, out var userId) ? userId : 1,
                        Username = configUsername ?? "admin",
                        Email = configEmail,
                        IsActive = true,
                        CreatedAt = DateTime.UtcNow,
                        UpdatedAt = DateTime.UtcNow,
                        passwordHash = configPasswordHash,
                        passwordSalt = configPasswordSalt
                    };

                    var tokenResult = await _tokenService.GenerateTokenAsync(userForToken);

                    response.IsSuccess = true;
                    response.Message = "Authentication successful.";
                    response.Data = new
                    {
                        Token = tokenResult.Token,
                        ExpiresIn = 21600, 
                        TokenType = "Bearer",
                        User = new
                        {
                            userForToken.UserId,
                            userForToken.Username,
                            userForToken.Email,
                            userForToken.IsActive
                        }
                    };

    
                }
                else
                {
                    response.Message = "Invalid credentials.";
                }
            }
            catch (Exception ex)
            {
                response.Message = "An error occurred during authentication. Please try again later.";

            }

            return response;
        }


        private async Task SimulatePasswordVerificationAsync()
        {
            var dummyPassword = Guid.NewGuid().ToString();
            var dummySalt = Convert.ToBase64String(new byte[16]);
            var dummyHash = Convert.ToBase64String(new byte[32]);

            _ = _securityService.VerifyPassword(dummyPassword, dummyHash, dummySalt);

            await Task.CompletedTask;
        }
    }
}