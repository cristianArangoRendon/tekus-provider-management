import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import { Country } from '../../../core/models/service.model';

@Injectable({
  providedIn: 'root'
})
export class CountryMockService {

  // Simulación de países desde un servicio externo
  private countries: Country[] = [
    { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'CA', name: 'Canadá', flag: '🇨🇦' },
    { code: 'CL', name: 'Chile', flag: '🇨🇱' },
    { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
    { code: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
    { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
    { code: 'EC', name: 'Ecuador', flag: '🇪🇨' },
    { code: 'ES', name: 'España', flag: '🇪🇸' },
    { code: 'FR', name: 'Francia', flag: '🇫🇷' },
    { code: 'GT', name: 'Guatemala', flag: '🇬🇹' },
    { code: 'JP', name: 'Japón', flag: '🇯🇵' },
    { code: 'MX', name: 'México', flag: '🇲🇽' },
    { code: 'PA', name: 'Panamá', flag: '🇵🇦' },
    { code: 'PE', name: 'Perú', flag: '🇵🇪' },
    { code: 'SG', name: 'Singapur', flag: '🇸🇬' },
    { code: 'UK', name: 'Reino Unido', flag: '🇬🇧' },
    { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
    { code: 'UY', name: 'Uruguay', flag: '🇺🇾' },
    { code: 'VE', name: 'Venezuela', flag: '🇻🇪' }
  ];

  constructor() { }

  getCountries(): Observable<Country[]> {
    // Simular latencia de servicio externo
    return of([...this.countries]).pipe(delay(800));
  }

  getCountryByCode(code: string): Observable<Country | undefined> {
    const country = this.countries.find(c => c.code === code);
    return of(country).pipe(delay(300));
  }

  searchCountries(search: string): Observable<Country[]> {
    const searchLower = search.toLowerCase();
    const filtered = this.countries.filter(c =>
      c.name.toLowerCase().includes(searchLower) ||
      c.code.toLowerCase().includes(searchLower)
    );
    return of(filtered).pipe(delay(400));
  }
}
