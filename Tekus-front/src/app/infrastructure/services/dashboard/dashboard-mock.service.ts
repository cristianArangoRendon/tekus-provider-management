import { Injectable } from '@angular/core';
import { Observable, of, delay, combineLatest, map } from 'rxjs';
import { DashboardIndicators, CountryIndicator, ServiceIndicator, ProviderSummary } from '../../../core/models/dashboard.model';
import { ProviderMockService } from '../providers/provider-mock.service';
import { ServiceMockService } from '../services/service-mock.service';
import { Service, Country } from '../../../core/models/service.model';
import { Provider } from '../../../core/models/provider.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardMockService {

  constructor(
    private providerService: ProviderMockService,
    private serviceService: ServiceMockService
  ) { }

  getDashboardIndicators(): Observable<DashboardIndicators> {
    return combineLatest([
      this.providerService.getProviders(1, 1000),
      this.serviceService.getServices(1, 1000)
    ]).pipe(
      map(([providersResult, servicesResult]) => {
        const providers = providersResult.data;
        const services = servicesResult.data;

        // Proveedores por país
        const countryMap = new Map<string, number>();
        services.forEach((service: Service) => {
          service.countries?.forEach((country: Country) => {
            countryMap.set(country.name, (countryMap.get(country.name) || 0) + 1);
          });
        });

        const providersByCountry: CountryIndicator[] = Array.from(countryMap.entries())
          .map(([country, count]) => ({
            country,
            count,
            percentage: (count / services.length) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5); // Top 5

        // Servicios por país (similar lógica)
        const servicesByCountry: CountryIndicator[] = Array.from(countryMap.entries())
          .map(([country, count]) => ({
            country,
            count,
            percentage: (count / services.length) * 100
          }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        // Top servicios
        const serviceNameMap = new Map<string, { count: number; totalRate: number }>();
        services.forEach((service: Service) => {
          if (!serviceNameMap.has(service.name)) {
            serviceNameMap.set(service.name, { count: 0, totalRate: 0 });
          }
          const data = serviceNameMap.get(service.name)!;
          data.count += 1;
          data.totalRate += service.hourlyRate;
        });

        const topServices: ServiceIndicator[] = Array.from(serviceNameMap.entries())
          .map(([serviceName, data]) => ({
            serviceName,
            providerCount: data.count,
            avgHourlyRate: data.totalRate / data.count
          }))
          .sort((a, b) => b.providerCount - a.providerCount)
          .slice(0, 5);

        // Proveedores recientes
        const recentProviders: ProviderSummary[] = providers
          .sort((a: Provider, b: Provider) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 5)
          .map((provider: Provider) => ({
            id: provider.id,
            name: provider.name,
            email: provider.email,
            servicesCount: provider.services?.length || 0,
            createdAt: provider.createdAt
          }));

        return {
          totalProviders: providers.length,
          totalServices: services.length,
          providersByCountry,
          servicesByCountry,
          topServices,
          recentProviders
        };
      }),
      delay(600)
    );
  }
}
