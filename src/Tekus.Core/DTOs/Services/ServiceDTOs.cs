namespace Tekus.core.DTOs.Services
{
  
    public class GetServicesPagedDTO
    {
        public string? SearchTerm { get; set; }
        public bool? IsActive { get; set; }
        public int? PageSize { get; set; }
        public int? PageNumber { get; set; }
        public string SortBy { get; set; } = "ServiceName";
        public string SortOrder { get; set; } = "ASC";
    }

    public class CreateServiceDTO
    {
        public string ServiceName { get; set; } = string.Empty;
        public decimal HourlyRateUSD { get; set; }
        public string? Description { get; set; }
    }


    public class UpdateServiceDTO
    {
        public int ServiceId { get; set; }
        public string? ServiceName { get; set; }
        public decimal? HourlyRateUSD { get; set; }
        public string? Description { get; set; }
    }

    public class ServicePagedDTO
    {
        public int ServiceId { get; set; }
        public string ServiceName { get; set; } = string.Empty;
        public decimal HourlyRateUSD { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
    }
}