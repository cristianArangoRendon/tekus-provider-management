import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderListComponent } from './provider-list/provider-list.component';
import { ProviderFormComponent } from './provider-form/provider-form.component';
import { ProviderDetailComponent } from './provider-detail/provider-detail.component';

const routes: Routes = [
  {
    path: '',
    component: ProviderListComponent
  },
  {
    path: 'create',
    component: ProviderFormComponent
  },
  {
    path: 'edit/:id',
    component: ProviderFormComponent
  },
  {
    path: ':id',
    component: ProviderDetailComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProvidersRoutingModule { }
