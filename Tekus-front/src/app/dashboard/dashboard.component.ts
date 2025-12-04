import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DashboardIndicatorsDTO } from '../core/data-transfer-object/app/dashboard.dto';
import { DashboardUseCase } from '../infrastructure/use-cases/app/dashboard.usecase';
import {
  trigger,
  transition,
  style,
  animate,
  stagger,
  query,
} from '@angular/animations';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('600ms ease-out', style({ opacity: 1 })),
      ]),
    ]),
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.9)' }),
        animate('500ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
    trigger('slideInLeft', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('500ms ease-out', style({ opacity: 1, transform: 'translateX(0)' })),
      ]),
    ]),
    trigger('staggerFadeIn', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('500ms ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
          ]),
        ], { optional: true }),
      ]),
    ]),
    trigger('expandWidth', [
      transition(':enter', [
        style({ width: '0%' }),
        animate('1000ms cubic-bezier(0.4, 0, 0.2, 1)'),
      ]),
    ]),
    trigger('countUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.5)' }),
        animate('800ms cubic-bezier(0.4, 0, 0.2, 1)', style({ opacity: 1, transform: 'scale(1)' })),
      ]),
    ]),
  ],
})
export class DashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  indicators: DashboardIndicatorsDTO | null = null;
  loading = true;
  isScrolled = false;

  constructor(
    private dashboardUseCase: DashboardUseCase,
    private router: Router
  ) {}

  @HostListener('window:scroll', [])
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
      .GetDashboardIndicators()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.indicators = data;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading dashboard:', error);
          this.loading = false;
        },
      });
  }

  getAverageRate(): number {
    if (!this.indicators?.topServices || this.indicators.topServices.length === 0) {
      return 0;
    }
    
    const sum = this.indicators.topServices.reduce(
      (acc, service) => acc + service.avgHourlyRate, 
      0
    );
    return sum / this.indicators.topServices.length;
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.router.navigate(['/auth/login']);
  }

  navigateToProviders(): void {
    this.router.navigate(['/providers']);
  }

  navigateToServices(): void {
    this.router.navigate(['/services']);
  }

  refreshDashboard(): void {
    this.loadDashboard();
  }
}
