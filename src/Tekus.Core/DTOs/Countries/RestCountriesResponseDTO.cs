using System.Text.Json.Serialization;

namespace Tekus.Infrastructure.ExternalModels
{
    public class RestCountriesResponse
    {
        [JsonPropertyName("name")]
        public NameInfo Name { get; set; }

        [JsonPropertyName("cca3")]
        public string Cca3 { get; set; }

        [JsonPropertyName("capital")]
        public List<string> Capital { get; set; }

        [JsonPropertyName("region")]
        public string Region { get; set; }

        [JsonPropertyName("subregion")]
        public string Subregion { get; set; }

        [JsonPropertyName("population")]
        public long Population { get; set; }

        [JsonPropertyName("flags")]
        public FlagsInfo Flags { get; set; }

        [JsonPropertyName("languages")]
        public Dictionary<string, string> Languages { get; set; }

        [JsonPropertyName("currencies")]
        public Dictionary<string, CurrencyInfo> Currencies { get; set; }
    }

    public class NameInfo
    {
        [JsonPropertyName("common")]
        public string Common { get; set; }

        [JsonPropertyName("official")]
        public string Official { get; set; }
    }

    public class FlagsInfo
    {
        [JsonPropertyName("png")]
        public string Png { get; set; }

        [JsonPropertyName("svg")]
        public string Svg { get; set; }
    }

    public class CurrencyInfo
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("symbol")]
        public string Symbol { get; set; }
    }
}