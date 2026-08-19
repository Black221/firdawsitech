import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Checkout } from './checkout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    Checkout
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    RouterModule.forChild([
      { path: '', component: Checkout}
    ])
  ]
})
export class CheckoutModule { }
