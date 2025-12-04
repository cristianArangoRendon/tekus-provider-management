
import { Injectable } from '@angular/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { ProvidersUseCase } from './providers.usecase';
import { ServicesUseCase } from './services.usecase';
import { NotificationsService } from '../../services/notifications/notifications.service';
import { CountryIndicatorDTO, DashboardIndicatorsDTO, RecentProviderDTO, TopServiceDTO } from '../../../core/data-transfer-object/app/dashboard.dto';

@Injectable({
  providedIn: 'root',
})
export class DashboardUseCase {
  constructor(
    private providersUseCase: ProvidersUseCase,
    private servicesUseCase: ServicesUseCase,
    private notificationService: NotificationsService
  ) {}

  GetDashboardIndicators(): Observable<DashboardIndicatorsDTO | null> {
    return forkJoin({
      providers: this.providersUseCase.GetProvidersPaged({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'CreatedAt',
        sortOrder: 'DESC',
      }),
      services: this.servicesUseCase.GetServicesPaged({
        pageNumber: 1,
        pageSize: 1000,
        sortBy: 'HourlyRateUSD',
        sortOrder: 'DESC',
      }),
    }).pipe(
      map((results) => {
        if (!results.providers || !results.services) {
          this.notificationService.showToastErrorMessage(
            'Error al cargar datos del dashboard'
          );
          return null;
        }

        const indicators: DashboardIndicatorsDTO = {
          totalProviders: results.providers.totalRecords,
          totalServices: results.services.totalRecords,
          providersByCountry: this.calculateProvidersByCountry(
            results.providers.results
          ),
          topServices: this.calculateTopServices(results.services.results),
          recentProviders: this.getRecentProviders(results.providers.results),
        };

        return indicators;
      }),
      catchError((error) => {
        console.error('Error loading dashboard indicators:', error);
        this.notificationService.showToastErrorMessage(
          'Error al cargar el dashboard'
        );
        return of(null);
      })
    );
  }

  private calculateProvidersByCountry(
    providers: any[]
  ): CountryIndicatorDTO[] {
    if (!providers || providers.length === 0) {
      return [];
    }

    const groupedByDomain: { [key: string]: number } = {};

    providers.forEach((provider) => {
      const emailDomain = provider.email.split('@')[1] || 'otros';
      const domainKey = emailDomain.split('.')[0];

      if (!groupedByDomain[domainKey]) {
        groupedByDomain[domainKey] = 0;
      }
      groupedByDomain[domainKey]++;
    });

    const countryIndicators = Object.entries(groupedByDomain)
      .map(([domain, count]) => ({
        country: this.getDomainDisplayName(domain),
        count: count,
        percentage: 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const total = countryIndicators.reduce((sum, item) => sum + item.count, 0);
    countryIndicators.forEach((item) => {
      item.percentage = (item.count / total) * 100;
    });

    return countryIndicators;
  }

  private getDomainDisplayName(domain: string): string {
    const domainMap: { [key: string]: string } = {
      gmail: 'Gmail Users',
      outlook: 'Outlook Users',
      hotmail: 'Hotmail Users',
      yahoo: 'Yahoo Users',
      empresa: 'Proveedores Corporativos',
      tekus: 'Tekus Partners',
      importacionestekus: 'Importaciones Tekus',
      cloudexperts: 'Cloud Experts',
      dataservices: 'Data Services',
      innovatetech: 'Innovate Tech',
      digitalwave: 'Digital Wave',
      globalit: 'Global IT',
      bytemasters: 'Byte Masters',
      codefactory: 'Code Factory',
      devops: 'DevOps',
      cloudnine: 'Cloud Nine',
    };

    return domainMap[domain.toLowerCase()] || domain.toUpperCase();
  }

  private calculateTopServices(services: any[]): TopServiceDTO[] {
    if (!services || services.length === 0) {
      return [];
    }

    return services
      .map((service) => ({
        serviceId: service.serviceId,
        serviceName: service.serviceName,
        providerCount: 0,
        avgHourlyRate: service.hourlyRateUSD,
      }))
      .sort((a, b) => b.avgHourlyRate - a.avgHourlyRate)
      .slice(0, 5);
  }

  private getRecentProviders(providers: any[]): RecentProviderDTO[] {
    if (!providers || providers.length === 0) {
      return [];
    }

    return providers
      .map((provider) => ({
        providerId: provider.providerId,
        name: provider.providerName,
        nit: provider.nit,
        email: provider.email,
        servicesCount: provider.totalServices || 0,
        createdAt: new Date(provider.createdAt),
      }))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 5);
  }

  GetServicesStatistics(): Observable<{
    totalActive: number;
    avgRate: number;
    maxRate: number;
    minRate: number;
  } | null> {
    return this.servicesUseCase
      .GetServicesPaged({
        pageNumber: 1,
        pageSize: 1000,
      })
      .pipe(
        map((result) => {
          if (!result || result.results.length === 0) {
            return null;
          }

          const rates = result.results.map((s) => s.hourlyRateUSD);

          return {
            totalActive: result.totalRecords,
            avgRate:
              rates.reduce((sum, rate) => sum + rate, 0) / rates.length,
            maxRate: Math.max(...rates),
            minRate: Math.min(...rates),
          };
        }),
        catchError(() => of(null))
      );
  }

  GetProvidersStatistics(): Observable<{
    totalActive: number;
    withServices: number;
    withoutServices: number;
  } | null> {
    return this.providersUseCase
      .GetProvidersPaged({
        pageNumber: 1,
        pageSize: 1000,
      })
      .pipe(
        map((result) => {
          if (!result) {
            return null;
          }

          const withServices = result.results.filter(
            (p) => p.totalServices > 0
          ).length;

          return {
            totalActive: result.totalRecords,
            withServices: withServices,
            withoutServices: result.totalRecords - withServices,
          };
        }),
        catchError(() => of(null))
      );
  }

  GetQuickSummary(): Observable<{
    totalProviders: number;
    totalServices: number;
  } | null> {
    return forkJoin({
      providers: this.providersUseCase.GetProvidersPaged({
        pageNumber: 1,
        pageSize: 1,
      }),
      services: this.servicesUseCase.GetServicesPaged({
        pageNumber: 1,
        pageSize: 1,
      }),
    }).pipe(
      map((results) => {
        if (!results.providers || !results.services) {
          return null;
        }

        return {
          totalProviders: results.providers.totalRecords,
          totalServices: results.services.totalRecords,
        };
      }),
      catchError(() => of(null))
    );
  }
}