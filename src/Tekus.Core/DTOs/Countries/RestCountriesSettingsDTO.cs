using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Tekus.Core.DTOs.Countries
{
    public class RestCountriesSettingsDTO
    {
        public string BaseUrl { get; set; } = "https://restcountries.com/v3.1";
        public int TimeoutSeconds { get; set; } = 30;
        public bool UseCache { get; set; } = true;
        public int CacheExpirationMinutes { get; set; } = 60;
    }
}

