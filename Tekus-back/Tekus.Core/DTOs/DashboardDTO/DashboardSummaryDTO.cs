namespace Tekus.Core.DTOs.ResponseDTO
{
    public class DashboardSummaryDTO
    {
        public int TotalProviders { get; set; }
        public int TotalServices { get; set; }
        public List<CountryProvidersDTO> ProvidersByCountry { get; set; }
        public List<CountryServicesDTO> ServicesByCountry { get; set; }
    }

    public class CountryProvidersDTO
    {
        public string Country { get; set; }
        public int TotalProviders { get; set; }
    }

    public class CountryServicesDTO
    {
        public string Country { get; set; }
        public int TotalServices { get; set; }
    }
}