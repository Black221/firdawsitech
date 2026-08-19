import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Cart } from './cart';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';



@NgModule({
  declarations: [
    Cart
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    RouterModule.forChild([
      { path: '', component: Cart }
    ])
  ]
})
export class CartModule { }
