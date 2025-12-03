namespace Tekus.Core.DTOs.Providers
{
    public class GetProvidersPagedDTO
    {
        public string? SearchTerm { get; set; }
        public bool? IsActive { get; set; }
        public int? PageSize { get; set; }
        public int? PageNumber { get; set; }
        public string SortBy { get; set; } = "ProviderName";
        public string SortOrder { get; set; } = "ASC";
    }


    public class CreateProviderDTO
    {
        public string Nit { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
    public class AddCustomFieldDTO
    {
        public int ProviderId { get; set; }
        public string FieldName { get; set; } = string.Empty;
        public string FieldValue { get; set; } = string.Empty;
    }
    public class ProviderPagedDTO
    {
        public int ProviderId { get; set; }
        public string Nit { get; set; } = string.Empty;
        public string ProviderName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string CustomFields { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? UpdatedAt { get; set; }
        public int TotalServices { get; set; }
    }
}
