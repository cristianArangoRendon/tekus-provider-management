import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ProviderPagedDTO } from '../../../core/data-transfer-object/app/providers.dto';
import { ProvidersUseCase } from '../../../infrastructure/use-cases/app/providers.usecase';

interface CustomField {
  key: string;
  value: string;
}

@Component({
  selector: 'app-provider-detail',
  templateUrl: './provider-detail.component.html',
  styleUrls: ['./provider-detail.component.scss'],
})
export class ProviderDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  provider: ProviderPagedDTO | null = null;
  customFields: CustomField[] = [];
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private providerUseCase: ProvidersUseCase
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProvider(parseInt(id, 10));
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProvider(id: number): void {
    this.loading = true;
    this.providerUseCase
      .GetProvidersPaged({ pageNumber: 1, pageSize: 1000 })
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (result) => {
          if (result) {
            const provider = result.results.find((p) => p.providerId === id);
            if (provider) {
              this.provider = provider;
              this.customFields = this.parseCustomFields(provider.customFields);
            } else {
              this.router.navigate(['/providers']);
            }
          } else {
            this.router.navigate(['/providers']);
          }
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading provider:', error);
          this.loading = false;
          this.router.navigate(['/providers']);
        },
      });
  }

  parseCustomFields(customFieldsJson: string): CustomField[] {
    try {
      const parsed = JSON.parse(customFieldsJson || '{}');
      return Object.entries(parsed).map(([key, value]) => ({
        key,
        value: value as string,
      }));
    } catch {
      return [];
    }
  }

  editProvider(): void {
    if (this.provider) {
      this.router.navigate(['/providers/edit', this.provider.providerId]);
    }
  }

  deleteProvider(): void {
    if (
      this.provider &&
      confirm(
        `¿Está seguro de eliminar el proveedor "${this.provider.providerName}"?`
      )
    ) {
      this.loading = true;
      this.providerUseCase
        .DeleteProvider(this.provider.providerId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (success) => {
            if (success) {
              this.router.navigate(['/providers']);
            } else {
              this.loading = false;
            }
          },
          error: (error) => {
            console.error('Error deleting provider:', error);
            this.loading = false;
          },
        });
    }
  }

  goBack(): void {
    this.router.navigate(['/providers']);
  }

  addCustomField(): void {
    if (this.provider) {
      this.router.navigate(['/providers/edit', this.provider.providerId]);
    }
  }
}