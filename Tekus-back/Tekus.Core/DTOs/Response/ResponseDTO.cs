namespace Tekus.Core.DTOs.ResponseDTO
{
    public class ResponseDTO
    {
        public bool IsSuccess { get; set; } = false;
        public string? Message { get; set; }
        public object? Data { get; set; }
    }
}
