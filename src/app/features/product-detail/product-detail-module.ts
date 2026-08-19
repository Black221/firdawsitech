import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductDetail } from './product-detail';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    ProductDetail
  ],
  exports: [
    ProductDetail
  ],
  imports: [
    CommonModule,
    RouterModule.forChild([
      { path: '', component: ProductDetail}
    ])
  ]
})
export class ProductDetailModule { }
