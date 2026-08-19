// src/app/features/products/products-routing.module.ts

import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductCreate } from './pages/product-create/product-create';
import { ProductDetail } from './pages/product-detail/product-detail';
import { ProductEdit } from './pages/product-edit/product-edit';
import { ProductList } from './pages/product-list/product-list';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'list',
    pathMatch: 'full'

  },
  {
    path: 'list',
    component: ProductList
  },
  {
    path: 'create',
    component: ProductCreate
  },
  {
    path: ':uuid',
    component: ProductDetail
  },
  {
    path: ':uuid/edit',
    component: ProductEdit
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }