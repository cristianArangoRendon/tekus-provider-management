import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProviderServiceAssignmentComponent } from './provider-service-assignment/provider-service-assignment.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'assignment',
    pathMatch: 'full'
  },
  {
    path: 'assignment',
    component: ProviderServiceAssignmentComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProviderServicesRoutingModule { }