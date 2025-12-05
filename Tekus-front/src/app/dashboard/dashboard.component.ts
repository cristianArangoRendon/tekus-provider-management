import { Component, OnInit, OnDestroy, HostListener } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import {
  DashboardSummaryDTO,
  CountryProvidersDTO,
  CountryServicesDTO,
} from "../core/data-transfer-object/app/dashboard.dto";
import { DashboardUseCase } from "../infrastructure/use-cases/app/dashboard.usecase";
import { AuthUseCase } from "../infrastructure/use-cases/auth/auth.use-case";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  dashboardData: DashboardSummaryDTO | null = null;
  loading = true;
  isScrolled = false;

  constructor(
    private dashboardUseCase: DashboardUseCase,
    private authUseCase: AuthUseCase,
    private router: Router
  ) {}

  @HostListener("window:scroll", [])
  onWindowScroll() {
    this.isScrolled = window.pageYOffset > 20;
  }

  ngOnInit(): void {
    this.loadDashboard();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardUseCase
      .GetDashboardSummary()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          if (data) {
            this.dashboardData = data;
          }
          this.loading = false;
        },
        error: (error) => {
          console.error("Error loading dashboard:", error);
          this.loading = false;
        },
      });
  }

  getTotalProviders(): number {
    return this.dashboardData?.totalProviders || 0;
  }

  getTotalServices(): number {
    return this.dashboardData?.totalServices || 0;
  }

  getTotalCountries(): number {
    if (!this.dashboardData?.providersByCountry) return 0;
    return this.dashboardData.providersByCountry.length;
  }

  getTopProviderCountries(): CountryProvidersDTO[] {
    if (!this.dashboardData?.providersByCountry) return [];
    return [...this.dashboardData.providersByCountry]
      .sort((a, b) => b.totalProviders - a.totalProviders)
      .slice(0, 5);
  }

  getTopServiceCountries(): CountryServicesDTO[] {
    if (!this.dashboardData?.servicesByCountry) return [];
    return [...this.dashboardData.servicesByCountry]
      .sort((a, b) => b.totalServices - a.totalServices)
      .slice(0, 5);
  }

  getMaxProviders(): number {
    const countries = this.getTopProviderCountries();
    if (countries.length === 0) return 1;
    return Math.max(...countries.map((c) => c.totalProviders));
  }

  getMaxServices(): number {
    const countries = this.getTopServiceCountries();
    if (countries.length === 0) return 1;
    return Math.max(...countries.map((c) => c.totalServices));
  }

  getProviderPercentage(total: number): number {
    const max = this.getMaxProviders();
    return (total / max) * 100;
  }

  getServicePercentage(total: number): number {
    const max = this.getMaxServices();
    return (total / max) * 100;
  }

  logout(): void {
    this.authUseCase
      .logout()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (success) => {
          if (success) {
            this.router.navigate(["/auth/login"]);
          }
        },
        error: (error) => {
          console.error("Error al cerrar sesión:", error);
          // Incluso si hay error, redirigir al login por seguridad
          this.router.navigate(["/auth/login"]);
        },
      });
  }

  navigateToProviders(): void {
    this.router.navigate(["/providers"]);
  }

  navigateToServices(): void {
    this.router.navigate(["/services"]);
  }
  navigateToAssignments(): void {
    this.router.navigate(["/provider-services/assignment"]);
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }
}
