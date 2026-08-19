import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminLayout } from './admin-layout/admin-layout';
import { AuthLayout } from './auth-layout/auth-layout';
import { RouterModule } from '@angular/router';
import { VitrineLayout } from './vitrine-layout/vitrine-layout';



@NgModule({
  declarations: [
    AdminLayout,
    AuthLayout,
    VitrineLayout,
  ],
  imports: [
    CommonModule,
    RouterModule,
  ]
})
export class LayoutModule { }
