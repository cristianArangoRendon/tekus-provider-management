namespace Tekus.Core.DTOs.Countries
{
    public class CountryDTO
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string OfficialName { get; set; }
        public string Region { get; set; }
        public string SubRegion { get; set; }
        public long Population { get; set; }
        public List<string> Capitals { get; set; }
        public string FlagUrl { get; set; }
        public List<string> Languages { get; set; }
        public CurrencyInfoDTO Currency { get; set; }
    }

    public class CurrencyInfoDTO
    {
        public string Code { get; set; }
        public string Name { get; set; }
        public string Symbol { get; set; }
    }

    public class CountryFilterDTO
    {
        public string SearchTerm { get; set; }
        public string Region { get; set; }
        public string Language { get; set; }
        public int PageNumber { get; set; } = 1;
        public int PageSize { get; set; } = 10;
        public string SortBy { get; set; } = "Name";
        public bool Ascending { get; set; } = true;
    }

    public class PagedResultDTO<T>
    {
        public List<T> Items { get; set; }
        public int TotalCount { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public int TotalPages => (int)Math.Ceiling(TotalCount / (double)PageSize);
        public bool HasPreviousPage => PageNumber > 1;
        public bool HasNextPage => PageNumber < TotalPages;
    }
}