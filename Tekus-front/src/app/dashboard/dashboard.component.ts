import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DashboardIndicators } from '../core/models/dashboard.model';
import { DashboardMockService } from '../infrastructure/services/dashboard/dashboard-mock.service';
import { AuthUseCase } from '../infrastructure/use-cases/auth/auth.use-case';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  
  indicators: DashboardIndicators | null = null;
  loading = true;

  constructor(
    private dashboardService: DashboardMockService,
    private authUseCase: AuthUseCase,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboardService.getDashboardIndicators().subscribe({
      next: (data) => {
        this.indicators = data;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard:', error);
        this.loading = false;
      }
    });
  }

  logout(): void {
    this.authUseCase.logout();
    this.router.navigate(['/auth/login']);
  }

  navigateToProviders(): void {
    this.router.navigate(['/providers']);
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }
}
