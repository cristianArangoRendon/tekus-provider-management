import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonToggleModule } from '@angular/material/button-toggle';

import { ProvidersRoutingModule } from './providers-routing.module';
import { ProviderListComponent } from './provider-list/provider-list.component';
import { ProviderFormComponent } from './provider-form/provider-form.component';
import { ProviderDetailComponent } from './provider-detail/provider-detail.component';
import { MatToolbar } from '@angular/material/toolbar';

@NgModule({
  declarations: [
    ProviderListComponent,
    ProviderFormComponent,
    ProviderDetailComponent
  ],
  imports: [
    CommonModule,
    ProvidersRoutingModule,
    ReactiveFormsModule,
    FormsModule,

    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatMenuModule,
    MatBadgeModule,
    MatButtonToggleModule,
    MatToolbar
  ]
})
export class ProvidersModule { }
